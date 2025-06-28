import AWS from 'aws-sdk';

// Configure AWS using environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Configure AWS
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

const s3 = new AWS.S3();
const BUCKET_NAME = AWS_S3_BUCKET_NAME;

interface FileObject {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

interface S3UploadResult {
  Location: string;
  Key: string;
}

/**
 * Upload a file to S3
 * @param {FileObject} file - The file object
 * @returns {Promise<S3UploadResult>} - S3 upload result
 */
export const uploadFile = async (file: FileObject): Promise<S3UploadResult> => {
  try {
    console.log('🔧 S3 Upload - Configuration check:', {
      hasAccessKey: !!AWS_ACCESS_KEY_ID,
      hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
      hasBucket: !!AWS_S3_BUCKET_NAME,
      region: AWS_REGION
    });

    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
    }

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: `documents/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    console.log('☁️ S3 Upload - Starting upload with params:', {
      bucket: params.Bucket,
      key: params.Key,
      contentType: params.ContentType,
      size: file.size
    });

    const result = await s3.upload(params).promise();
    
    console.log('✅ S3 Upload - Success:', {
      location: result.Location,
      key: result.Key
    });

    return {
      Location: result.Location,
      Key: result.Key
    };
  } catch (error) {
    console.error('❌ S3 Upload - Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('AccessDenied')) {
        throw new Error('S3 access denied. Please check AWS credentials and permissions.');
      } else if (error.message.includes('NoSuchBucket')) {
        throw new Error('S3 bucket not found. Please check bucket name.');
      } else if (error.message.includes('InvalidAccessKeyId')) {
        throw new Error('Invalid AWS access key. Please check credentials.');
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        throw new Error('AWS signature mismatch. Please check secret key.');
      }
    }
    
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Delete a file from S3
 * @param {string} key - The file key in S3
 * @returns {Promise<void>}
 */
export const deleteFile = async (key: string): Promise<void> => {
  try {
    if (!BUCKET_NAME) {
      throw new Error('AWS_S3_BUCKET_NAME environment variable is not set');
    }

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured');
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
}; 
import { NextRequest, NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';

// Configure AWS using environment variables
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const s3 = new S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});
const BUCKET_NAME = AWS_S3_BUCKET_NAME;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Check if AWS credentials are configured
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.error('AWS credentials not configured');
      return NextResponse.json({ 
        error: 'File upload service not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Check if S3 bucket is configured
    if (!BUCKET_NAME) {
      console.error('AWS S3 bucket not configured');
      return NextResponse.json({ 
        error: 'File upload service not configured. Please contact support.' 
      }, { status: 500 });
    }

    console.log('🔧 S3 Upload - Configuration check:', {
      hasAccessKey: !!AWS_ACCESS_KEY_ID,
      hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
      hasBucket: !!AWS_S3_BUCKET_NAME,
      region: AWS_REGION
    });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        error: 'No file uploaded. Please select a file to upload.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum file size is 10MB.' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a PDF, JPG, or PNG file.' 
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Determine the folder based on query parameter or default to vehicle-documents
    const url = new URL(req.url);
    const uploadType = url.searchParams.get('type') || 'document';
    const folder = uploadType === 'profile' ? 'profile-photos' : 'vehicle-documents';
    
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const contentType = file.type;

    console.log('📤 Starting S3 upload:', {
      fileName,
      contentType,
      size: file.size,
      bucket: BUCKET_NAME
    });

    const params = {
      Bucket: BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
    };

    const result = await s3.upload(params).promise();
    
    console.log('✅ S3 upload successful:', {
      location: result.Location,
      key: result.Key
    });

    return NextResponse.json({ 
      url: result.Location, 
      key: result.Key,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('❌ S3 upload error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('AccessDenied')) {
        return NextResponse.json({ 
          error: 'Upload service access denied. Please contact support.' 
        }, { status: 500 });
      } else if (error.message.includes('NoSuchBucket')) {
        return NextResponse.json({ 
          error: 'Upload service not configured. Please contact support.' 
        }, { status: 500 });
      } else if (error.message.includes('InvalidAccessKeyId')) {
        return NextResponse.json({ 
          error: 'Upload service configuration error. Please contact support.' 
        }, { status: 500 });
      } else if (error.message.includes('SignatureDoesNotMatch')) {
        return NextResponse.json({ 
          error: 'Upload service configuration error. Please contact support.' 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to upload file. Please try again or contact support if the problem persists.' 
    }, { status: 500 });
  }
} 
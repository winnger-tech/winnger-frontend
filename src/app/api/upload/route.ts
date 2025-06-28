import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Import S3 service
import { uploadFile, deleteFile } from '../../../services/s3Service';

export async function POST(request: NextRequest) {
  let tempPath: string | null = null;
  
  try {
    console.log('🚀 Starting file upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'documents';

    console.log('📁 File details:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      folder: folder
    });

    if (!file) {
      console.log('❌ No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/x-icon',
      'image/vnd.microsoft.icon'
    ];

    // Also check file extension for common cases where MIME type might be generic
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.ico'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const hasValidExtension = fileExtension && allowedExtensions.includes(`.${fileExtension}`);

    console.log('🔍 File type check:', {
      fileType: file.type,
      fileName: file.name,
      fileExtension: fileExtension,
      isAllowedType: allowedTypes.includes(file.type),
      hasValidExtension: hasValidExtension
    });

    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      console.log('❌ Invalid file type:', file.type, 'or extension:', fileExtension);
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only PDF and image files are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log('✅ File validation passed');

    // Check if S3 is configured
    const isS3Configured = process.env.AWS_ACCESS_KEY_ID && 
                          process.env.AWS_SECRET_ACCESS_KEY && 
                          process.env.AWS_S3_BUCKET_NAME;

    console.log('🔧 S3 Configuration check:', {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      hasBucket: !!process.env.AWS_S3_BUCKET_NAME,
      isConfigured: isS3Configured
    });

    if (!isS3Configured) {
      console.log('⚠️ S3 not configured, using mock upload');
      // Return a mock response for development/testing
      const mockUrl = `https://cdn.example.com/docs/${folder}/${Date.now()}-${file.name}`;
      return NextResponse.json({
        url: mockUrl,
        key: `${folder}/${Date.now()}-${file.name}`,
        message: 'File uploaded successfully (mock)',
        mock: true
      });
    }

    // Save file to temporary location
    console.log('💾 Saving file to temp location...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const fileNameExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${uuidv4()}.${fileNameExtension}`;
    tempPath = join(tmpdir(), fileName);
    
    await writeFile(tempPath, buffer);
    console.log('✅ File saved to temp location:', tempPath);

    // Prepare file object for S3 upload
    const fileObject = {
      originalname: file.name,
      mimetype: file.type,
      buffer: buffer,
      size: file.size
    };

    console.log('☁️ Uploading to S3...', {
      name: file.name,
      size: file.size,
      type: file.type,
      folder: folder
    });

    // Upload to S3
    const s3Result = await uploadFile(fileObject);

    console.log('✅ S3 upload successful:', s3Result);

    // Clean up temporary file
    if (tempPath) {
      try {
        await unlink(tempPath);
        console.log('🧹 Temp file cleaned up');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
      }
    }

    return NextResponse.json({
      url: s3Result.Location,
      key: s3Result.Key,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up temporary file if it exists
    if (tempPath) {
      try {
        await unlink(tempPath);
        console.log('🧹 Cleaned up temp file after error');
      } catch (cleanupError) {
        console.warn('⚠️ Failed to cleanup temp file:', cleanupError);
      }
    }

    // Return more specific error messages
    let errorMessage = 'Failed to upload file';
    let statusCode = 500;

    if (error instanceof Error) {
      console.error('🔍 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      if (error.message.includes('AWS_S3_BUCKET_NAME')) {
        errorMessage = 'S3 configuration error. Please check environment variables.';
        statusCode = 500;
      } else if (error.message.includes('access denied') || error.message.includes('AccessDenied')) {
        errorMessage = 'S3 access denied. Please check AWS credentials.';
        statusCode = 500;
      } else if (error.message.includes('NoSuchBucket')) {
        errorMessage = 'S3 bucket not found. Please check bucket configuration.';
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { error: 'No file key provided' },
        { status: 400 }
      );
    }

    // Check if S3 is configured
    const isS3Configured = process.env.AWS_ACCESS_KEY_ID && 
                          process.env.AWS_SECRET_ACCESS_KEY && 
                          process.env.AWS_S3_BUCKET_NAME;

    if (!isS3Configured) {
      console.warn('S3 not configured, skipping delete');
      return NextResponse.json({
        message: 'File deleted successfully (mock)',
        mock: true
      });
    }

    await deleteFile(key);

    return NextResponse.json({
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 
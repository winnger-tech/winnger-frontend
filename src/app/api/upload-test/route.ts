import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Test upload endpoint called');
    
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
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Return success with file info for debugging
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      folder: folder,
      message: 'File received successfully (test endpoint)'
    });

  } catch (error) {
    console.error('❌ Test upload error:', error);
    return NextResponse.json(
      { 
        error: 'Test upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
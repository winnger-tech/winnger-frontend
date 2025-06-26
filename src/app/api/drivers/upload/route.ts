import { NextRequest, NextResponse } from 'next/server';
import { S3 } from 'aws-sdk';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // @ts-ignore
    const buffer = Buffer.from(await file.arrayBuffer());
    // @ts-ignore
    const fileName = `${Date.now()}-${file.name}`;
    // @ts-ignore
    const contentType = file.type;

    const params = {
      Bucket: BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();
    return NextResponse.json({ url: result.Location, key: result.Key });
  } catch (error) {
    console.error('S3 upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
} 
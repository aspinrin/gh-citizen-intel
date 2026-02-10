import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, fileType } = await request.json();

    // Create a unique name for the file so they don't overwrite each other
    // e.g., "1738291-evidence.jpg"
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s/g, '-')}`;

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueFilename,
        ContentType: fileType,
      }),
      { expiresIn: 60 } // Link works for 60 seconds only
    );

    return NextResponse.json({ url: signedUrl, key: uniqueFilename });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create upload link" }, { status: 500 });
  }
}
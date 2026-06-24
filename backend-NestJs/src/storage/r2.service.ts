import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class R2Service implements OnModuleInit {
  private client: S3Client;
  private bucket: string = '';
  private publicUrl: string = '';
  private isConfigured: boolean = false;

  onModuleInit() {
    this.bucket = process.env.R2_BUCKET || '';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';
    const endpoint = process.env.R2_ENDPOINT;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (endpoint && accessKeyId && secretAccessKey && this.bucket) {
      this.client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      });
      this.isConfigured = true;
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    if (!this.isConfigured) {
      return `${this.publicUrl || '/uploads'}/${key}`;
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${this.publicUrl}/${key}`;
  }

  async deleteFile(url: string): Promise<void> {
    if (!url || !this.isConfigured) return;
    const base = this.publicUrl;
    if (!url.startsWith(base)) return;
    const key = url.slice(base.length + 1);
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

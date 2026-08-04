import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
    private client: S3Client;
    private bucket: string;
    private publicUrl: string;

    constructor() {
        this.bucket = process.env.R2_BUCKET!;
        this.publicUrl = process.env.R2_PUBLIC_URL!;
        this.client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID!,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
            },
        });
    }

    async uploadImage(buffer: Buffer, mimeType: string, folder: string): Promise<string> {
        const ext = mimeType.split('/')[1] ?? 'jpg';
        const key = `${folder}/${randomUUID()}.${ext}`;

        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: buffer,
                ContentType: mimeType,
                CacheControl: 'public, max-age=31536000',
            }),
        );

        return `${this.publicUrl}/${key}`;
    }

    async deleteImage(url: string): Promise<void> {
        if (!url.startsWith(this.publicUrl)) return;
        const key = url.slice(this.publicUrl.length + 1);
        await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    }
}
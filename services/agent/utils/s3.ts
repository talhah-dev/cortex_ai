import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";

export const uploadToS3 = async (fileName: string, buffer: Buffer, contentType: string) => {
    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Body: buffer,
            Key: fileName,
            ContentType: contentType,
        })
    );
    return fileName;
};

export const getFromS3 = async (filename: string, expiresIn = 600) => {
    return await getSignedUrl(
        s3,
        new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: filename,
        }),
        { expiresIn }
    );
};


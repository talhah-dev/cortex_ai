import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KED_ID || "",
        secretAccessKey: process.env.AWS_SECRET_KED_ID || "",
    },
});


"use strict";
// import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import fs from "fs";
// import { promisify } from "util";
// // Promesa para leer archivos
// const readFile = promisify(fs.readFile);
// const s3 = new S3Client({
//   region: "us-east-1",
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });
// export const uploadFileToS3 = async (file: Express.Multer.File): Promise<string> => {
//   const fileContent = await readFile(file.path);
//   const key = `productos/${Date.now()}-${file.originalname}`;
//   const command = new PutObjectCommand({
//     Bucket: "mi-bucket-productos",
//     Key: key,
//     Body: fileContent,
//     ContentType: file.mimetype,
//     ACL: "public-read", // Opcional si tu bucket lo permite
//   });
//   await s3.send(command);
//   return `https://${"mi-bucket-productos"}.s3.amazonaws.com/${key}`;
// };

// s3Uploads.js
import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

// ✅ Helper function to create an uploader for any folder
const createUploader = (folder) =>
  multer({
    storage: multerS3({
      s3,
      bucket: process.env.AWS_BUCKET_NAME,
      // ❌ Removed `acl: "public-read"`
      contentType: multerS3.AUTO_CONTENT_TYPE, // ✅ Keeps correct MIME type
      key: (req, file, cb) => {
        const sanitizedFileName = file.originalname.replace(/\s+/g, "_");
        const fileName = `${Date.now()}-${sanitizedFileName}`;
        cb(null, `${folder}/${fileName}`);
      },
    }),
  });

// ✅ Exports
export const uploadRefund = createUploader("refunds");
export const uploadAppointment = createUploader("appointments");
export const uploadHMO = createUploader("hmo");
export const uploadBilling = createUploader("billing");
const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Hàm tạo một trình upload (multer instance)
 * @param {string} folder - Thư mục con trong S3 (vd: 'avatars', 'thumbnails')
 * @param {string[]} allowedMimes - Mảng các MimeType hợp lệ (vd: ['image/jpeg', 'video/mp4'])
 * @param {number} fileSizeLimit - Giới hạn kích thước file (tính bằng bytes)
 */
const createUploader = (folder, allowedMimes, fileSizeLimit) => {
  
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME,
      acl: "public-read", 
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const fileName = `${folder}/${Date.now().toString()}-${file.originalname}`;
        cb(null, fileName);
      },
    }),
    limits: { fileSize: fileSizeLimit || 1024 * 1024 * 5 },
    fileFilter: (req, file, cb) => {
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Loại file không được chấp nhận."));
      }
    },
  });
};

module.exports = createUploader;
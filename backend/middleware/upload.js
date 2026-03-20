const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {fileSize: 20 * 1024 * 1024}, //20mb max

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  }
});

module.exports = upload;
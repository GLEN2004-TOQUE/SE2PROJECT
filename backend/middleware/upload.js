const path = require("path");
const multer = require("multer");

const ALLOWED_EXTENSIONS = new Set([".pdf", ".docx", ".pptx", ".wps", ".dot"]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/msword",
  "application/wps-office.wps",
  "application/vnd.wps-office.wps",
  "application/kswps",
  "application/x-wps",
  "application/vnd.kingsoft.wps",
]);

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb max

  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error("Invalid file type"));
      return;
    }

    const mime = (file.mimetype || "").toLowerCase();
    if (ALLOWED_MIME_TYPES.has(mime)) {
      cb(null, true);
      return;
    }
    if (
      mime === "application/octet-stream" ||
      mime === "binary/octet-stream" ||
      mime === ""
    ) {
      cb(null, true);
      return;
    }
    if (mime === "application/zip" && (ext === ".docx" || ext === ".pptx")) {
      cb(null, true);
      return;
    }

    cb(new Error("Invalid file type"));
  },
});

module.exports = upload;

import multer, { FileFilterCallback, Multer } from 'multer';
import { Request } from 'express';

interface FileFilterCallbackWithError extends FileFilterCallback {
  (err: Error | null, acceptFile: boolean): void;
}

const storage = multer.memoryStorage();

const upload: Multer = multer({
  storage,

  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb max

  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallbackWithError) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  }
});

export default upload;

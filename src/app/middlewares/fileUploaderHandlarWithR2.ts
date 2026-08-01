import multer, { FileFilterCallback, memoryStorage } from "multer";
import ApiError from "../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { Request } from "express";
import { uploadMulterFileToR2 } from "../../config/cloudefare.config";

interface UploadConfigItem {
  folder: string;
  allowedMimeTypes: string[];
  maxCount: number;
  maxSize: number;
}

const UPLOAD_CONFIG: Record<string, UploadConfigItem> = {
  image: {
    folder: "image",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    maxCount: 3,
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  imageUrl: {
    folder: "image",
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ],
    maxCount: 3,
    maxSize: 50 * 1024 * 1024,
  },

  content: {
    folder: "content",
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "video/mp4",
      "audio/mpeg",
    ],
    maxCount: 10,
    maxSize: 500 * 1024 * 1024, // 500MB
  },
  doc: {
    folder: "docs",
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxCount: 5,
    maxSize: 50 * 1024 * 1024,
  },
  documentVerified: {
    folder: "documentVerified",
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      // from iphone camera
      "image/heic",
      "image/heif",
      // from android camera
      "image/heic",
      "image/heif",
      // from other devices
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxCount: 1,
    maxSize: 50 * 1024 * 1024, //50MB
  },
  verifyOwnPicture: {
    folder: "verifyOwnPicture",
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/heic",
      "image/heif",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxCount: 1,
    maxSize: 50 * 1024 * 1024, //50MB
  },
  media: {
    folder: "media",
    allowedMimeTypes: [
      "video/mp4",
      "audio/mpeg",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/gif",
    ],
    maxCount: 6,
    maxSize: 500 * 1024 * 1024,
  },
};

const storage = memoryStorage();
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const config = UPLOAD_CONFIG[file.fieldname];
  if (!config) {
    return cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        `Unsupported field: ${file.fieldname}`,
      ),
    );
  }
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        `Invalid file type for ${file.fieldname}. Allowed: ${config.allowedMimeTypes.join(", ")}`,
      ),
    );
  }
  cb(null, true);
};
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // hard cap 100MB
  },
});

/**
 * get upload fields
 * @returns multer.FieldsCallback
 */
export const getUploadFields = () =>
  upload.fields(
    Object.keys(UPLOAD_CONFIG).map((field) => ({
      name: field,
      maxCount: UPLOAD_CONFIG[field].maxCount,
    })),
  );
type IFolderName = keyof typeof UPLOAD_CONFIG;
const assertFileSize = (file: Express.Multer.File, folder: IFolderName) => {
  const max = UPLOAD_CONFIG[folder].maxSize;
  if (file.size > max) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `File too large for ${folder}. Max ${Math.round(max / (1024 * 1024))}MB`,
    );
  }
};

/** Upload one field file to R2 → public URL */
export const getSingleFilePath = async (
  files: Record<string, Express.Multer.File[]> | undefined,
  folder: IFolderName,
): Promise<string | undefined> => {
  const fieldFiles = files?.[folder];
  if (!fieldFiles?.length) return undefined;
  const file = fieldFiles[0];
  assertFileSize(file, folder);
  const uploaded = await uploadMulterFileToR2(
    file,
    UPLOAD_CONFIG[folder].folder,
  );
  return uploaded.url;
};
/** Upload many field files to R2 → public URLs */
export const getMultipleFilesPath = async (
  files: Record<string, Express.Multer.File[]> | undefined,
  folder: IFolderName,
): Promise<string[] | undefined> => {
  const fieldFiles = files?.[folder];
  if (!fieldFiles?.length) return undefined;
  const urls: string[] = [];
  for (const file of fieldFiles) {
    assertFileSize(file, folder);
    const uploaded = await uploadMulterFileToR2(
      file,
      UPLOAD_CONFIG[folder].folder,
    );
    urls.push(uploaded.url);
  }
  return urls;
};
export const uploadFilesByField = async (
  files: Record<string, Express.Multer.File[]> | undefined,
  folder: IFolderName,
): Promise<Express.Multer.File[]> => {
  // helper if you still need multer file objects after size check
  const fieldFiles = files?.[folder] ?? [];
  fieldFiles.forEach((f) => assertFileSize(f, folder));
  return fieldFiles;
};

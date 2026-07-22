import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import config from ".";
import path from "path";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiErrors";

const r2Client = new S3Client({
  region: "auto",
  endpoint: config.cloudflare.CLOUDFLARE_API_URL,
  credentials: {
    accessKeyId: config.cloudflare.CLOUDFLARE_API_KEY,
    secretAccessKey: config.cloudflare.CLOUDFLARE_SECRET_KEY,
  },
  forcePathStyle: true,
});

// url sanitizer
const sanitizerFileName = (name: string) =>
  name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();

const buildObjectKey = (folder: string, originalname: string) => {
  const ext = path.extname(originalname).toLowerCase() || ".bin";
  const base = sanitizerFileName(path.basename(originalname, ext)) || "file";
  return `${folder}/${base}-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
};

export const uploadBufferToR2 = async (params: {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  folder: string;
}): Promise<{ key: string; url: string }> => {
  const key = buildObjectKey(params.folder, params.originalname);
  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: config.cloudflare.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        Body: params.buffer,
        ContentType: params.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to upload file to R2: ${(error as Error).message}`,
    );
  }
  return {
    key,
    url: `${config.cloudflare.CLOUDFLARE_PUBLIC_URL.replace(/\/$/, "")}/${key}`,
  };
};

export const uploadMulterFileToR2 = async (
  file: Express.Multer.File,
  folder: string,
) => {
  if (!file.buffer?.length) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Empty file upload");
  }
  return uploadBufferToR2({
    buffer: file.buffer,
    originalname: file.originalname,
    mimetype: file.mimetype,
    folder,
  });
};

export const deleteFromR2 = async (keyOrUrl: string) => {
  const key = keyOrUrl.includes("://")
    ? keyOrUrl.replace(
        config.cloudflare.CLOUDFLARE_PUBLIC_URL.replace(/\/$/, "") + "/",
        "",
      )
    : keyOrUrl.replace(/^\//, "");
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: config.cloudflare.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    }),
  );
};
/** Private objects (e.g. private album) — short-lived URL */
export const getR2SignedUrl = async (key: string, expiresIn = 3600) => {
  return getSignedUrl(
    r2Client,
    new GetObjectCommand({
      Bucket: config.cloudflare.CLOUDFLARE_BUCKET_NAME,
      Key: key,
    }),
    { expiresIn },
  );
};
export const r2Service = {
  uploadBufferToR2,
  uploadMulterFileToR2,
  deleteFromR2,
  getR2SignedUrl,
};

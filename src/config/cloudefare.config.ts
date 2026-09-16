import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import path from "path";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiErrors";
import { envPath } from ".";

const readR2Config = () => {
  const accessKeyId = (process.env.CLOUDFARE_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.CLOUDFARE_SECRET_ACCESS_KEY || "").trim();
  const endpoint = (process.env.CLOUDFARE_R2_ENDPOINT || "").trim();
  const bucket = (process.env.R2_BUCKET_NAME || "").trim();
  const publicUrl = (process.env.CLOUDFARE_R2_PUBLIC_URL || "").trim();

  return { accessKeyId, secretAccessKey, endpoint, bucket, publicUrl };
};

const r2PublicBaseUrl = () => {
  const { publicUrl, endpoint, bucket } = readR2Config();
  if (publicUrl) {
    return publicUrl.replace(/\/$/, "");
  }
  return `${endpoint.replace(/\/$/, "")}/${bucket}`;
};

let r2Client: S3Client | undefined;

const getR2Client = () => {
  if (r2Client) {
    return r2Client;
  }

  const { accessKeyId, secretAccessKey, endpoint, bucket } = readR2Config();

  if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `R2 env missing on this process. envFile=${envPath || "NOT FOUND"} cwd=${process.cwd()}. Set CLOUDFARE_ACCESS_KEY_ID, CLOUDFARE_SECRET_ACCESS_KEY, CLOUDFARE_R2_ENDPOINT, R2_BUCKET_NAME.`,
    );
  }

  if (accessKeyId.startsWith("cfat_") || accessKeyId.length !== 32) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Invalid R2 Access Key ID (length ${accessKeyId.length}). Use CLOUDFARE_ACCESS_KEY_ID (32 chars). Do not use CLOUDFARE_API_TOKEN.`,
    );
  }

  r2Client = new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });

  return r2Client;
};

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
  const { accessKeyId, bucket } = readR2Config();
  try {
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.mimetype,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      `Failed to upload file to R2: ${(error as Error).message} (local CLOUDFARE_ACCESS_KEY_ID length=${accessKeyId.length})`,
    );
  }
  return {
    key,
    url: `${r2PublicBaseUrl()}/${key}`,
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
  const { bucket } = readR2Config();
  const key = keyOrUrl.includes("://")
    ? keyOrUrl.replace(r2PublicBaseUrl() + "/", "")
    : keyOrUrl.replace(/^\//, "");
  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
};

export const getR2SignedUrl = async (key: string, expiresIn = 3600) => {
  const { bucket } = readR2Config();
  return getSignedUrl(
    getR2Client(),
    new GetObjectCommand({
      Bucket: bucket,
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

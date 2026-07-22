import sharp from "sharp";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiErrors";
import { uploadBufferToR2 } from "../config/cloudefare.config";

export const createBlurredImage = async (
  file: Express.Multer.File,
): Promise<string> => {
  if (!file.mimetype.startsWith("image/")) return "";
  if (!file.buffer?.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Missing image buffer for blur",
    );
  }

  const blurred = await sharp(file.buffer)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .blur(20)
    .jpeg({ quality: 70 })
    .toBuffer();

  const uploaded = await uploadBufferToR2({
    buffer: blurred,
    originalname: `blur-${file.originalname.replace(/\.[^.]+$/, "")}.jpg`,
    mimetype: "image/jpeg",
    folder: "protected",
  });

  return uploaded.url;
};

/**
 * For existing profile URL already on R2/CDN.
 * If old local path, skip safely.
 */
export const createBlurredImageFromPath = async (
  imagePath: string,
): Promise<string> => {
  if (!imagePath || imagePath === "/image.png") return "";
  if (!imagePath.startsWith("http")) {
    // old local path — cannot blur without disk file
    return "";
  }

  const res = await fetch(imagePath);
  if (!res.ok) return "";

  const arrayBuffer = await res.arrayBuffer();
  const input = Buffer.from(arrayBuffer);

  const blurred = await sharp(input)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .blur(20)
    .jpeg({ quality: 70 })
    .toBuffer();

  const uploaded = await uploadBufferToR2({
    buffer: blurred,
    originalname: "blur-profile.jpg",
    mimetype: "image/jpeg",
    folder: "protected",
  });

  return uploaded.url;
};

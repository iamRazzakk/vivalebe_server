import sharp from "sharp";
import path from "path";
import fs from "fs";
const PROTECTED_DIR = path.join(process.cwd(), "uploads", "protected");
export const createBlurredImage = async (
  file: Express.Multer.File,
): Promise<string> => {
  if (!file.mimetype.startsWith("image/")) {
    return ""; // video/audio — skip
  }
  if (!fs.existsSync(PROTECTED_DIR)) {
    fs.mkdirSync(PROTECTED_DIR, { recursive: true });
  }
  const blurredFileName = `blur-${file.filename}`;
  const outputPath = path.join(PROTECTED_DIR, blurredFileName);
  // multer disk storage — file.path
  await sharp(file.path).blur(20).toFile(outputPath);
  return `/protected/${blurredFileName}`;
};
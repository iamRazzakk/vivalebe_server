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

export const createBlurredImageFromPath = async (
  imagePath: string,
): Promise<string> => {
  if (!imagePath || imagePath === "/image.png") return "";
  const relative = imagePath.replace(/^\//, "").replace(/^uploads\//, "");
  const inputPath = path.join(process.cwd(), "uploads", relative);
  if (!fs.existsSync(inputPath)) {
    console.warn(
      "Blur skipped — file not found:",
      inputPath,
      "from",
      imagePath,
    );
    return "";
  }
  if (!fs.existsSync(PROTECTED_DIR)) {
    fs.mkdirSync(PROTECTED_DIR, { recursive: true });
  }
  const filename = path.basename(inputPath);
  const blurredFileName = `blur-${filename}`;
  const outputPath = path.join(PROTECTED_DIR, blurredFileName);
  await sharp(inputPath).blur(20).toFile(outputPath);
  return `/protected/${blurredFileName}`;
};

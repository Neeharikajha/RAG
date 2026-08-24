import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

const SUPPORTED = ["pdf", "docx", "md", "txt"] as const; //const since readonly
export type FileType = (typeof SUPPORTED)[number];

export function getFileType(fileName: string): FileType {
  const ext = fileName.split(".").pop()?.toLocaleLowerCase();
  if (!ext || !SUPPORTED.includes(ext as FileType)) {
    throw new Error(
      `Unsupported file type: ${ext}. Allowed: ${SUPPORTED.join(", ")}`,
    );
  }
  return ext as FileType;
}

export async function parseFile(
  filePath: string,
  fileType: FileType,
): Promise<string> {
  try {
    switch (fileType) {
      case "pdf": {
        const buffer = await fs.readFile(filePath);
        const { text } = await pdfParse(buffer);
        return text;
      }
      case "docx": {
        const { value } = await mammoth.extractRawText({ path: filePath });
        return value;
      }
      case "md":
      case "txt":
        return await fs.readFile(filePath, "utf-8");
    }
  } catch (err) {
    throw new Error(
      `Failed to parse ${fileType} file: ${(err as Error).message}`,
    );
  }
}

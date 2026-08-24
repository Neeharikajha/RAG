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

export interface ParsedPage {
  pageNumber: number;
  text: string;
}

export interface ParsedFileResult {
  fullText: string;
  pages: ParsedPage[];
}

export async function parseFile(
  filePath: string,
  fileType: FileType,
): Promise<ParsedFileResult> {
  try {
    switch (fileType) {
      case "pdf": {
        const buffer = await fs.readFile(filePath);
        const pages: ParsedPage[] = [];
        const options = {
          pagerender: (pageData: any) =>
            pageData.getTextContent().then((tc: any) => {
              const text = tc.items.map((i: any) => i.str).join(" ");
              const pageNumber = pageData.pageIndex + 1;
              pages.push({ pageNumber, text });
              return text;
            }),
        };
        const res = await pdfParse(buffer, options);
        pages.sort((a, b) => a.pageNumber - b.pageNumber);
        return { fullText: res.text, pages };
      }
      case "docx": {
        const { value } = await mammoth.extractRawText({ path: filePath });
        return { fullText: value, pages: [{ pageNumber: 1, text: value }] };
      }
      case "md":
      case "txt": {
        const content = await fs.readFile(filePath, "utf-8");
        return { fullText: content, pages: [{ pageNumber: 1, text: content }] };
      }
    }
  } catch (err) {
    throw new Error(
      `Failed to parse ${fileType} file: ${(err as Error).message}`,
    );
  }
}


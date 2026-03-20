import * as fs from "fs";
import pdfParse from "pdf-parse";
import * as mammoth from "mammoth";

interface ExtractTextResult {
  text: string;
}

async function extractText(filePath: string, ext: string): Promise<string> {
  if (ext === "pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await (pdfParse as any)(dataBuffer) as ExtractTextResult;
    return data.text;
  } else if (ext === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    return "";
  }
}

export { extractText };

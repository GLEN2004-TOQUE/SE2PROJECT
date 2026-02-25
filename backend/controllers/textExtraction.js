const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(filePath, ext) {
  if (ext === "pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } else if (ext === "docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } else {
    return "";
  }
}

module.exports = { extractText };
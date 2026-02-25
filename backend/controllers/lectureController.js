const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { extractText } = require("./textExtraction")
const path = require("path");
const { supabase } = require("../supabaseClient");

exports.uploadLecture = async (req, res) => {
  try {
    const file = req.file;
    const { title } = req.body;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    let extractedText = "";
    const ext = path.extname(file.originalname).toLowerCase();

    // Extract text based on file type
    if (ext === ".pdf") {
      const data = await pdfParse(file.buffer);
      extractedText = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else if (ext === ".pptx") {
      // Optional: add PPTX parser if needed
      extractedText = "PPTX text extraction not implemented yet";
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("lectures")
      .upload(`${Date.now()}-${file.originalname}`, file.buffer);

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("lectures")
      .getPublicUrl(uploadData.path);

    const fileUrl = publicUrlData.publicUrl;

    // Save to DB
    const { error: dbError } = await supabase.from("lectures").insert([
      {
        title,
        file_url: fileUrl,
        extracted_text: extractedText,
        teacher_id: req.user.id,
      },
    ]);

    if (dbError) return res.status(400).json({ error: dbError.message });

    res.json({ message: "Lecture uploaded successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
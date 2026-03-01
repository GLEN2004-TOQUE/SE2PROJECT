const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const getSupabase = require("../utils/supabaseClient");

// =====================================
// Upload Lecture
// =====================================
exports.uploadLecture = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token);

    const file = req.file;
    const title = req.body.title;
    const user = req.user; // already verified by middleware

    if (!file) return res.status(400).json({ message: "No file uploaded" });
    if (!title) return res.status(400).json({ message: "Title missing" });

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
      extractedText = "PPTX text extraction not implemented yet";
    } else {
      return res.status(400).json({ message: "Unsupported file type" });
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lectures")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) return res.status(400).json({ error: uploadError.message });

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("lectures")
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    // Save metadata to DB
    const { data, error } = await supabase
      .from("lectures")
      .insert([{
        title,
        file_url: fileUrl,
        file_path: filePath,
        extracted_text: extractedText,
        teacher_id: user.id,
        file_size: file.size,
        file_type: ext,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      await supabase.storage.from("lectures").remove([filePath]);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Lecture uploaded successfully", lecture: data });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =====================================
// Get All Lectures (Per Teacher)
// =====================================
exports.getLectures = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token);
    const user = req.user;

    const { data, error } = await supabase
      .from("lectures")
      .select("*")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error: error.message });

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================================
// Delete Lecture
// =====================================
exports.deleteLecture = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token);
    const user = req.user;
    const { id } = req.params;

    // Fetch lecture first to get file_path
    const { data: lecture, error: fetchError } = await supabase
      .from("lectures")
      .select("*")
      .eq("id", id)
      .eq("teacher_id", user.id)
      .single();

    if (fetchError || !lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    // Delete file from storage
    await supabase.storage.from("lectures").remove([lecture.file_path]);

    // Delete from DB
    const { error: deleteError } = await supabase
      .from("lectures")
      .delete()
      .eq("id", id)
      .eq("teacher_id", user.id);

    if (deleteError) return res.status(400).json({ error: deleteError.message });

    res.json({ message: "Lecture deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const { supabaseAdmin } = require("../supabaseClient");

const uploadLecture = async (req, res) => {
  try {
    const file = req.file;
    const { title } = req.body;
    const teacherId = req.user.id; // from verifyToken middleware

    if (!file) return res.status(400).json({ message: "No file uploaded" });
    if (!title) return res.status(400).json({ message: "Title is required" });

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

    // Build storage path: teacherId folder + timestamp + original filename
    const storagePath = `${teacherId}/${Date.now()}-${file.originalname}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("lectures")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      return res.status(400).json({ message: uploadError.message });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("lectures")
      .getPublicUrl(storagePath);

    const fileUrl = publicUrlData.publicUrl;

    // Insert into lectures table with all required fields
    const { error: dbError } = await supabaseAdmin.from("lectures").insert([
      {
        title,
        file_url: fileUrl,
        extracted_text: extractedText,
        teacher_id: teacherId,
        file_path: storagePath,           // the path used in storage
        file_size: file.size,             // bytes
        file_type: file.mimetype,         // e.g., application/pdf
      },
    ]);

    if (dbError) {
      // Optionally delete the uploaded file if DB insert fails
      await supabase.storage.from("lectures").remove([storagePath]);
      return res.status(400).json({ message: dbError.message });
    }

    res.json({ message: "Lecture uploaded successfully" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: err.message });
  }
};

const getLectures = async (req, res) => {
  try {
    const { data: lectures, error } = await supabase
      .from('lectures')
      .select('*')
      .eq('teacher_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ message: error.message });

    res.json(lectures);
  } catch (err) {
    console.error("Get lectures error:", err);
    res.status(500).json({ message: err.message });
  }
};

const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch lecture to ensure ownership and get file_path
    const { data: lecture, error: fetchError } = await supabase
      .from('lectures')
      .select('file_path, teacher_id')
      .eq('id', id)
      .eq('teacher_id', req.user.id)
      .single();

    if (fetchError || !lecture) {
      return res.status(404).json({ message: 'Lecture not found or unauthorized' });
    }

    // Delete file from storage
    const { error: deleteStorageError } = await supabase.storage
      .from('lectures')
      .remove([lecture.file_path]);

    if (deleteStorageError) {
      console.error('Storage delete error:', deleteStorageError);
      // Continue to delete from DB even if storage delete fails? Usually we want to delete both.
      // We'll still try to delete from DB but inform user.
    }

    // Delete from DB
    const { error: dbError } = await supabase
      .from('lectures')
      .delete()
      .eq('id', id);

    if (dbError) return res.status(400).json({ message: dbError.message });

    res.json({ message: 'Lecture deleted successfully' });
  } catch (err) {
    console.error("Delete lecture error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { uploadLecture, getLectures, deleteLecture };
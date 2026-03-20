import { Response } from 'express';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import * as path from 'path';
import getSupabase from '../utils/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthRequest } from '../middleware/authMiddleware';

interface MulterFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  fieldname?: string;
  encoding?: string;
}

// =====================================
// Upload Lecture
// =====================================
export const uploadLecture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token || undefined) as SupabaseClient;

    const file = req.file as MulterFile | undefined;
    const title = (req.body as { title?: string }).title;
    const user = req.user;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    if (!title) {
      res.status(400).json({ message: "Title missing" });
      return;
    }

    let extractedText = "";
    const ext = path.extname(file.originalname).toLowerCase();

    // Extract text based on file type
    if (ext === ".pdf") {
      const data = await (pdfParse as any)(file.buffer);
      extractedText = data.text;
    } else if (ext === ".docx") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    } else if (ext === ".pptx") {
      extractedText = "PPTX text extraction not implemented yet";
    } else {
      res.status(400).json({ message: "Unsupported file type" });
      return;
    }

    // Upload file to Supabase Storage
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = `${user?.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("lectures")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      res.status(400).json({ error: uploadError.message });
      return;
    }

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
        teacher_id: user?.id,
        file_size: file.size,
        file_type: ext,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      await supabase.storage.from("lectures").remove([filePath]);
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: "Lecture uploaded successfully", lecture: data });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: (err as Error).message });
  }
};

// =====================================
// Get All Lectures (Per Teacher)
// =====================================
export const getLectures = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token || undefined) as SupabaseClient;
    const user = req.user;

    const { data, error } = await supabase
      .from("lectures")
      .select("*")
      .eq("teacher_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

// =====================================
// Delete Lecture
// =====================================
export const deleteLecture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const supabase = getSupabase(token || undefined) as SupabaseClient;
    const user = req.user;
    const { id } = req.params;

    // Fetch lecture first to get file_path
    const { data: lecture, error: fetchError } = await supabase
      .from("lectures")
      .select("*")
      .eq("id", id)
      .eq("teacher_id", user?.id)
      .single();

    if (fetchError || !lecture) {
      res.status(404).json({ message: "Lecture not found" });
      return;
    }

    // Delete file from storage
    await supabase.storage.from("lectures").remove([lecture.file_path]);

    // Delete from DB
    const { error: deleteError } = await supabase
      .from("lectures")
      .delete()
      .eq("id", id)
      .eq("teacher_id", user?.id);

    if (deleteError) {
      res.status(400).json({ error: deleteError.message });
      return;
    }

    res.json({ message: "Lecture deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

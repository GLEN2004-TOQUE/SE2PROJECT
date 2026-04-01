const { supabaseAdmin } = require("../supabaseClient");

/**
 * Lecture Model
 *
 * Supabase table: lectures
 * Columns: id, title, file_url, file_path, file_size, file_type,
 *          extracted_text, teacher_id, created_at
 */

/**
 * Fetch all lectures belonging to a teacher.
 */
exports.getLecturesByTeacher = async (teacherId) => {
  const { data, error } = await supabaseAdmin
    .from("lectures")
    .select("id, title, file_url, file_type, file_size, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch a single lecture by ID.
 * Optionally verifies ownership when teacherId is provided.
 */
exports.getLectureById = async (lectureId, teacherId = null) => {
  let query = supabaseAdmin
    .from("lectures")
    .select("*")
    .eq("id", lectureId);

  if (teacherId) {
    query = query.eq("teacher_id", teacherId);
  }

  const { data, error } = await query.single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Insert a new lecture record.
 */
exports.createLecture = async ({
  title,
  file_url,
  file_path,
  file_size,
  file_type,
  extracted_text,
  teacher_id,
}) => {
  const { data, error } = await supabaseAdmin
    .from("lectures")
    .insert([
      {
        title,
        file_url,
        file_path,
        file_size,
        file_type,
        extracted_text,
        teacher_id,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Update a lecture's title (or other mutable fields).
 * Only the owning teacher may update.
 */
exports.updateLecture = async (lectureId, teacherId, updates) => {
  const allowedFields = ["title"];
  const sanitized = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowedFields.includes(k))
  );

  if (Object.keys(sanitized).length === 0) {
    throw new Error("No valid fields to update");
  }

  const { data, error } = await supabaseAdmin
    .from("lectures")
    .update(sanitized)
    .eq("id", lectureId)
    .eq("teacher_id", teacherId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Delete a lecture record by ID, verifying teacher ownership.
 * Returns the deleted row so the caller can also remove the storage file.
 */
exports.deleteLecture = async (lectureId, teacherId) => {
  // First fetch to confirm ownership and retrieve file_path
  const { data: lecture, error: fetchError } = await supabaseAdmin
    .from("lectures")
    .select("id, file_path, teacher_id")
    .eq("id", lectureId)
    .eq("teacher_id", teacherId)
    .single();

  if (fetchError || !lecture) {
    throw new Error("Lecture not found or unauthorized");
  }

  const { error: deleteError } = await supabaseAdmin
    .from("lectures")
    .delete()
    .eq("id", lectureId);

  if (deleteError) throw new Error(deleteError.message);
  return lecture; // Return so caller can delete from storage
};

/**
 * Search lectures by title for a given teacher.
 */
exports.searchLectures = async (teacherId, searchTerm) => {
  const { data, error } = await supabaseAdmin
    .from("lectures")
    .select("id, title, file_type, file_size, created_at")
    .eq("teacher_id", teacherId)
    .ilike("title", `%${searchTerm}%`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Count lectures for a given teacher.
 */
exports.countLecturesByTeacher = async (teacherId) => {
  const { count, error } = await supabaseAdmin
    .from("lectures")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId);

  if (error) throw new Error(error.message);
  return count;
};
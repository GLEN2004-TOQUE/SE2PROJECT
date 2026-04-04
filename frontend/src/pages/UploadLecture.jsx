import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadLecture } from "../services/api";

export default function UploadLecture() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // new state for success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setError("Please provide both title and file.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(""); // clear previous success message
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      await uploadLecture(formData);

      // Show success notification
      setSuccess("✅ Uploaded successfully!");

      // Wait 1.5 seconds so user can see the notification, then navigate
      setTimeout(() => {
        navigate("/teacher");
      }, 1500);
    } catch (err) {
      setError(err.message);
      setSuccess(""); // clear success on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b10] text-white flex items-center justify-center p-4">
      <div className="bg-[#1a1a24] p-8 rounded-2xl w-full max-w-md border border-white/10">
        <h1 className="text-2xl font-bold mb-6">Upload Lecture</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-white/10 border border-white/20 focus:outline-none focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">File (PDF, DOCX, PPTX)</label>
            <input
              type="file"
              accept=".pdf,.docx,.pptx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-white/70"
              required
            />
          </div>

          {/* Error notification */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Success notification */}
          {success && (
            <div className="bg-green-600/20 border border-green-500 text-green-300 text-sm p-2 rounded text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  getUser, logout,
  getLectures, uploadLecture, deleteLecture,
  generateQuiz, saveQuiz,
  getLeaderboard,
} from "../services/api";

/* ── Tiny spinner ───────────────────────────────────────────────── */
const Spinner = ({ size = 5 }) => (
  <div className={`w-${size} h-${size} border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin`} />
);

/* ─────────────────────────────────────────────────────────────────
   UPLOAD LECTURE
───────────────────────────────────────────────────────────────── */
function UploadLecture({ lectures, onUploaded, onDelete }) {
  const [title,    setTitle]    = useState("");
  const [file,     setFile]     = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading,setUploading]= useState(false);
  const [msg,      setMsg]      = useState({ text: "", ok: true });
  const [deleting, setDeleting] = useState(null);
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    setMsg({ text: "", ok: true });
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { setMsg({ text: "Please select a file.", ok: false }); return; }
    if (!title.trim()) { setMsg({ text: "Please enter a title.", ok: false }); return; }
    setUploading(true); setMsg({ text: "", ok: true });
    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title.trim());
    try {
      await uploadLecture(fd);
      setMsg({ text: "Lecture uploaded successfully!", ok: true });
      setFile(null); setTitle("");
      onUploaded();
    } catch (err) {
      setMsg({ text: err.message || "Upload failed.", ok: false });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lecture?")) return;
    setDeleting(id);
    try { await deleteLecture(id); onUploaded(); }
    catch (err) { alert(err.message); }
    finally { setDeleting(null); }
  };

  const fmt = (bytes) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Upload Lecture Materials</h2>
      <p className="text-gray-500 text-sm mb-6">Share PDFs, slides, or documents with your students</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload zone */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">New Upload</span>
          </div>
          <div className="p-5">
            {/* Title input */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Lecture title…"
              className="w-full mb-3 text-sm px-3 py-2.5 border border-[#e8dfc8] rounded-xl bg-white text-gray-700 outline-none focus:border-[#C9A227] transition"
            />
            {/* Drop zone */}
            <label
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all mb-3 ${
                dragging ? "border-[#C9A227] bg-[#fdf9ef]" : "border-[#C9A227]/25 bg-[#FFFDF7] hover:border-[#C9A227]"
              }`}
            >
              {file ? (
                <div>
                  <p className="text-sm font-medium text-[#4A0404]">{file.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{fmt(file.size)}</p>
                </div>
              ) : (
                <>
                  <svg className="w-9 h-9 text-[#C9A22780] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                  </svg>
                  <p className="text-sm text-gray-600">Drag & drop, or <span className="text-[#C9A227] font-medium">browse</span></p>
                  <p className="text-xs text-gray-400 mt-1">PDF, PPTX, DOCX — max 20 MB</p>
                </>
              )}
              <input ref={inputRef} type="file" className="hidden" accept=".pdf,.pptx,.docx"
                onChange={e => pickFile(e.target.files[0])} />
            </label>
            {msg.text && (
              <p className={`text-xs mb-3 ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
            )}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2.5 bg-[#C9A227] hover:bg-[#b8911f] text-[#4A0404] font-semibold rounded-xl transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploading ? <><Spinner size={4} /> Uploading…</> : "Upload Lecture"}
            </button>
          </div>
        </div>

        {/* Lecture list */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Uploaded Lectures</span>
            <span className="ml-auto text-xs bg-[#faeeda] text-[#854F0B] px-2 py-0.5 rounded-full">{lectures.length}</span>
          </div>
          <div className="p-4 flex flex-col gap-3 max-h-96 overflow-y-auto">
            {lectures.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No lectures yet</p>
            ) : lectures.map(lec => (
              <div key={lec.id} className="flex items-center gap-3 px-3 py-2.5 bg-[#FFFDF7] border border-[#e8dfc8]/50 rounded-xl">
                <div className="w-8 h-8 bg-[#faeeda] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{lec.title}</p>
                  <p className="text-xs text-gray-400">
                    {lec.file_size ? fmt(lec.file_size) : "—"} · {new Date(lec.created_at).toLocaleDateString()}
                  </p>
                </div>
                <a href={lec.file_url} target="_blank" rel="noreferrer"
                  className="text-xs text-[#C9A227] hover:underline mr-2">View</a>
                <button
                  onClick={() => handleDelete(lec.id)}
                  disabled={deleting === lec.id}
                  className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                >
                  {deleting === lec.id ? "…" : "✕"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   LEADERBOARD
───────────────────────────────────────────────────────────────── */
function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [lbType,   setLbType]   = useState("overall");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(lbType)
      .then(setStudents)
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, [lbType]);

  const medalStyle = (i) => [
    "bg-[#C9A227] text-white",
    "bg-gray-400 text-white",
    "bg-[#b96a30] text-white",
  ][i] || "bg-[#f0e8d0] text-[#4A0404]";

  const tierBadge = (tier) => ({
    Master:       "bg-[#faeeda] text-[#854F0B]",
    Advanced:     "bg-blue-100 text-blue-700",
    Intermediate: "bg-green-100 text-green-700",
    Beginner:     "bg-gray-100 text-gray-600",
  })[tier] || "bg-gray-100 text-gray-600";

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Class Leaderboard</h2>
      <p className="text-gray-500 text-sm mb-6">Live rankings from gamification data</p>

      <div className="flex gap-2 mb-5">
        {["daily","weekly","overall"].map(t => (
          <button
            key={t}
            onClick={() => setLbType(t)}
            className={`text-sm px-4 py-2 rounded-xl capitalize transition ${
              lbType === t
                ? "bg-[#C9A227] text-[#4A0404] font-semibold"
                : "border border-[#e8dfc8] text-gray-500 hover:border-[#C9A227]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-sm font-semibold text-[#4A0404]">Rankings — {lbType}</span>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size={6} /></div>
        ) : students.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-[#f0e8d0]">
                  <th className="text-left px-5 py-3">Rank</th>
                  <th className="text-left px-5 py-3">User ID</th>
                  <th className="text-left px-5 py-3">Points</th>
                  <th className="text-left px-5 py-3">Tier</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id} className="border-b border-[#f8f4ec] hover:bg-[#FFFDF7] transition">
                    <td className="px-5 py-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${medalStyle(i)}`}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-700">{s.id}</td>
                    <td className="px-5 py-3 font-bold text-[#4A0404]">{s.points ?? 0}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadge(s.tier)}`}>
                        {s.tier || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   GENERATE QUIZ
───────────────────────────────────────────────────────────────── */
function GenerateQuiz({ lectures }) {
  const [lectureId, setLectureId] = useState("");
  const [type,      setType]      = useState("multiple choice");
  const [count,     setCount]     = useState(10);
  const [quizTitle, setQuizTitle] = useState("");
  const [courseId,  setCourseId]  = useState("");
  const [questions, setQuestions] = useState([]);
  const [generating,setGenerating]= useState(false);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState({ text: "", ok: true });
  const [savedId,   setSavedId]   = useState(null);

  const handleGenerate = async () => {
    if (!lectureId) { setMsg({ text: "Please select a lecture.", ok: false }); return; }
    setGenerating(true); setMsg({ text: "", ok: true }); setQuestions([]); setSavedId(null);
    try {
      const data = await generateQuiz(lectureId, type, count);
      setQuestions(data.questions || []);
      if (data.questions?.length) setMsg({ text: `Generated ${data.questions.length} questions.`, ok: true });
    } catch (err) {
      setMsg({ text: err.message || "Generation failed.", ok: false });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!questions.length) return;
    if (!quizTitle.trim()) { setMsg({ text: "Please enter a quiz title.", ok: false }); return; }
    if (!courseId.trim())  { setMsg({ text: "Please enter a Course ID.", ok: false }); return; }
    setSaving(true); setMsg({ text: "", ok: true });
    try {
      const data = await saveQuiz(lectureId, quizTitle, questions, courseId);
      setSavedId(data.quiz_id);
      setMsg({ text: `Quiz saved! ID: ${data.quiz_id}`, ok: true });
    } catch (err) {
      setMsg({ text: err.message || "Save failed.", ok: false });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Generate Quiz</h2>
      <p className="text-gray-500 text-sm mb-6">Create AI-powered quizzes from your uploaded lecture materials</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Quiz Settings</span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Source Lecture</p>
              <select
                value={lectureId}
                onChange={e => setLectureId(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]"
              >
                <option value="">Select a lecture…</option>
                {lectures.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Question Type</p>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]"
              >
                <option value="multiple choice">Multiple Choice</option>
                <option value="true or false">True or False</option>
                <option value="identification">Identification</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Number of Items</p>
              <select
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full text-sm px-3 py-2.5 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]"
              >
                {[5,10,15,20,25].map(n => <option key={n} value={n}>{n} items</option>)}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-2.5 bg-[#C9A227] hover:bg-[#b8911f] text-[#4A0404] font-semibold rounded-xl transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? <><Spinner size={4} /> Generating…</> : "Generate with AI"}
            </button>

            {/* Save section */}
            {questions.length > 0 && (
              <div className="border-t border-[#f0e8d0] pt-4 flex flex-col gap-3">
                <p className="text-xs text-gray-400 font-medium">Save Quiz</p>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  placeholder="Quiz title…"
                  className="w-full text-sm px-3 py-2.5 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]"
                />
                <input
                  type="text"
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  placeholder="Course ID…"
                  className="w-full text-sm px-3 py-2.5 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]"
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-2.5 bg-[#4A0404] hover:bg-[#6b1010] text-white font-semibold rounded-xl transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><Spinner size={4} /> Saving…</> : "Save Quiz"}
                </button>
                {savedId && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
                    Quiz saved! Share this ID with students: <strong className="font-mono">{savedId}</strong>
                  </div>
                )}
              </div>
            )}

            {msg.text && (
              <p className={`text-xs ${msg.ok ? "text-green-600" : "text-red-500"}`}>{msg.text}</p>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Generated Questions ({questions.length})</span>
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto flex flex-col gap-3">
            {questions.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Questions will appear here after generation</p>
            ) : questions.map((q, i) => (
              <div key={i} className="px-4 py-3 bg-[#FFFDF7] border border-[#e8dfc8]/60 rounded-xl">
                <p className="text-xs font-medium text-gray-700 mb-2">Q{i + 1}. {q.question}</p>
                {q.options && (
                  <div className="flex flex-col gap-1">
                    {q.options.map((o, oi) => (
                      <p key={oi} className={`text-xs ${q.correct_answer === String.fromCharCode(65+oi) ? "text-green-700 font-semibold" : "text-gray-400"}`}>
                        {String.fromCharCode(65+oi)}. {o}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   REPORTS  (UI kept, with real leaderboard data for charts)
───────────────────────────────────────────────────────────────── */
function Reports() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard("overall")
      .then(setLeaders)
      .catch(() => setLeaders([]))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data from real leaderboard
  const tierCounts = leaders.reduce((acc, u) => {
    const t = u.tier || "Beginner";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const gradeData = [
    { name: "Master",       value: tierCounts.Master       || 0, color: "#C9A227" },
    { name: "Advanced",     value: tierCounts.Advanced     || 0, color: "#3B82F6" },
    { name: "Intermediate", value: tierCounts.Intermediate || 0, color: "#22C55E" },
    { name: "Beginner",     value: tierCounts.Beginner     || 0, color: "#6B7280" },
  ].filter(d => d.value > 0);

  const topPoints = leaders
    .slice(0, 8)
    .map((u, i) => ({ rank: `#${i+1}`, points: u.points || 0 }));

  if (loading) return (
    <div className="flex justify-center py-20"><Spinner size={8} /></div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Reports & Analytics</h2>
      <p className="text-gray-500 text-sm mb-6">Gamification overview — real-time from leaderboard</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Ranked",  value: leaders.length },
          { label: "Masters",       value: tierCounts.Master || 0 },
          { label: "Top Points",    value: leaders[0]?.points ?? "—" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border-t-2 border-[#C9A227] border border-[#e8dfc8] shadow-sm p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-[#4A0404]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tier Pie */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7]">
            <span className="text-sm font-semibold text-[#4A0404]">Tier Distribution</span>
          </div>
          <div className="p-5">
            {gradeData.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gradeData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {gradeData.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Points Bar */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7]">
            <span className="text-sm font-semibold text-[#4A0404]">Top 8 Points</span>
          </div>
          <div className="p-5">
            {topPoints.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
                  <XAxis dataKey="rank" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="points" fill="#C9A227" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD HOME
───────────────────────────────────────────────────────────────── */
function DashboardHome({ lectures, setActivePage, loading }) {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaderboard("overall")
      .then(d => setLeaders(d.slice(0, 5)))
      .catch(() => {});
  }, []);

  const medalCls = (i) => [
    "bg-[#C9A227] text-white",
    "bg-gray-400 text-white",
    "bg-[#b96a30] text-white",
    "bg-[#f0e8d0] text-[#4A0404]",
    "bg-[#f0e8d0] text-[#4A0404]",
  ][i];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Overview</h2>
      <p className="text-gray-500 text-sm mb-6">Welcome to your teacher dashboard</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border-t-2 border-[#C9A227] border border-[#e8dfc8] shadow-sm p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Lectures Uploaded</p>
          <p className="text-3xl font-bold text-[#4A0404]">{loading ? "…" : lectures.length}</p>
        </div>
        <div className="bg-white rounded-2xl border-t-2 border-[#C9A227] border border-[#e8dfc8] shadow-sm p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Ranked Students</p>
          <p className="text-3xl font-bold text-[#4A0404]">{leaders.length ? `${leaders.length}+` : "—"}</p>
        </div>
        <div className="bg-white rounded-2xl border-t-2 border-[#C9A227] border border-[#e8dfc8] shadow-sm p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Top Score</p>
          <p className="text-3xl font-bold text-[#4A0404]">{leaders[0]?.points ?? "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Students */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-sm font-semibold text-[#4A0404]">Top Performers</span>
            </div>
            <button onClick={() => setActivePage("leaderboard")} className="text-xs text-[#C9A227] hover:underline">See all</button>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {leaders.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No data yet</p>
            ) : leaders.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${medalCls(i)}`}>{i+1}</div>
                <span className="flex-1 text-xs text-gray-600 font-mono truncate">{s.id}</span>
                <span className="text-xs font-bold text-[#4A0404]">{s.points ?? 0} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Lectures */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
              </svg>
              <span className="text-sm font-semibold text-[#4A0404]">Recent Lectures</span>
            </div>
            <button onClick={() => setActivePage("upload")} className="text-xs text-[#C9A227] hover:underline">Upload</button>
          </div>
          <div className="p-4 flex flex-col gap-2">
            {loading ? (
              <div className="flex justify-center py-6"><Spinner size={5} /></div>
            ) : lectures.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No lectures yet</p>
            ) : lectures.slice(0, 5).map(lec => (
              <div key={lec.id} className="flex items-center gap-3 px-3 py-2 bg-[#FFFDF7] border border-[#e8dfc8]/40 rounded-xl">
                <div className="w-7 h-7 bg-[#faeeda] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{lec.title}</p>
                  <p className="text-xs text-gray-400">{new Date(lec.created_at).toLocaleDateString()}</p>
                </div>
                <a href={lec.file_url} target="_blank" rel="noreferrer" className="text-xs text-[#C9A227] hover:underline">View</a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN TEACHER DASHBOARD
───────────────────────────────────────────────────────────────── */
export default function TeacherDashboard() {
  const [activePage,  setActivePage]  = useState("dashboard");
  const [lectures,    setLectures]    = useState([]);
  const [lecLoading,  setLecLoading]  = useState(true);
  const navigate = useNavigate();

  // Verify teacher role
  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    if (u.role !== "teacher") { navigate("/student"); return; }
  }, [navigate]);

  const fetchLectures = () => {
    setLecLoading(true);
    getLectures()
      .then(setLectures)
      .catch(() => setLectures([]))
      .finally(() => setLecLoading(false));
  };

  useEffect(fetchLectures, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const navItems = [
    { id: "dashboard",   label: "Dashboard",      icon: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/> },
    { id: "upload",      label: "Upload Lecture",  icon: <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/> },
    { id: "quiz",        label: "Generate Quiz",   icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z"/> },
    { id: "leaderboard", label: "Leaderboard",     icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/> },
    { id: "reports",     label: "Reports",         icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/> },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "upload":      return <UploadLecture lectures={lectures} onUploaded={fetchLectures} />;
      case "quiz":        return <GenerateQuiz  lectures={lectures} />;
      case "leaderboard": return <Leaderboard />;
      case "reports":     return <Reports />;
      default:            return <DashboardHome lectures={lectures} setActivePage={setActivePage} loading={lecLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-[#1a0505] flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C9A227] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-[#4A0404]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
                <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/40 leading-none uppercase tracking-widest">Teacher</p>
              <p className="text-sm font-semibold text-white leading-tight">QuizGen</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activePage === item.id
                  ? "bg-[#C9A227] text-[#4A0404]"
                  : "text-white/50 hover:text-white hover:bg-white/8"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/8 transition w-full"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {renderPage()}
      </main>
    </div>
  );
}
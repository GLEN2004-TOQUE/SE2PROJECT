import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Mock page components ────────────────────────────────────────────────────

function UploadLecture() {
  const [files, setFiles] = useState([
    { name: "Chapter 7 Notes.pdf",   size: "2.4 MB", status: "Published", subject: "Biology" },
    { name: "Lab Manual Q2.pdf",     size: "4.1 MB", status: "Published", subject: "Chemistry" },
    { name: "Midterm Slides.pptx",   size: "8.7 MB", status: "Draft",     subject: "Physics" },
    { name: "Formula Sheet.docx",    size: "0.9 MB", status: "Published", subject: "Math" },
  ]);
  const [dragging, setDragging] = useState(false);

  const statusStyle = (s) => {
    if (s === "Published") return "bg-green-100 text-green-800";
    if (s === "Draft")     return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Upload Lecture Materials</h2>
      <p className="text-gray-500 text-sm mb-6">Share PDFs, slides, or documents with your students</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Zone */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">New Upload</span>
          </div>
          <div className="p-5">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragging(false);
                const dropped = Array.from(e.dataTransfer.files).map(f => ({
                  name: f.name, size: (f.size / 1024 / 1024).toFixed(1) + " MB",
                  status: "Draft", subject: "—"
                }));
                setFiles(prev => [...prev, ...dropped]);
              }}
              className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-4 ${
                dragging ? "border-[#C9A227] bg-[#fdf9ef]" : "border-[#C9A22766] bg-[#FFFDF7] hover:border-[#C9A227]"
              }`}
            >
              <svg className="w-10 h-10 text-[#C9A22799] mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
              </svg>
              <p className="text-sm text-gray-600">Drag & drop files here, or <span className="text-[#C9A227] font-medium">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">PDF, PPTX, DOCX — max 50 MB each</p>
              <input type="file" className="hidden" multiple accept=".pdf,.pptx,.docx"
                onChange={(e) => {
                  const picked = Array.from(e.target.files).map(f => ({
                    name: f.name, size: (f.size / 1024 / 1024).toFixed(1) + " MB",
                    status: "Draft", subject: "—"
                  }));
                  setFiles(prev => [...prev, ...picked]);
                }}
              />
            </label>

            <div className="flex gap-3 mb-4">
              <select className="flex-1 text-sm px-3 py-2 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]">
                <option>Select Subject</option>
                <option>Biology</option><option>Chemistry</option><option>Physics</option><option>Mathematics</option>
              </select>
              <select className="flex-1 text-sm px-3 py-2 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]">
                <option>Select Section</option>
                <option>Section A</option><option>Section B</option><option>All Sections</option>
              </select>
            </div>

            <button className="w-full py-2.5 bg-[#C9A227] hover:bg-[#b8911f] text-[#4A0404] font-semibold rounded-xl transition text-sm">
              Upload Files
            </button>
          </div>
        </div>

        {/* File List */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Uploaded Files</span>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-[#FFFDF7] border border-[#e8dfc8] rounded-xl">
                <div className="w-8 h-8 bg-[#faeeda] rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.subject} · {f.size}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle(f.status)}`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const students = [
    { rank: 1, name: "Andrea Reyes",     section: "Sec A", quizzes: 32, avg: 97, medal: "gold" },
    { rank: 2, name: "Carlo Mendoza",    section: "Sec B", quizzes: 32, avg: 94, medal: "silver" },
    { rank: 3, name: "Lyra Bautista",    section: "Sec A", quizzes: 31, avg: 91, medal: "bronze" },
    { rank: 4, name: "Kevin Tan",        section: "Sec B", quizzes: 32, avg: 88, medal: null },
    { rank: 5, name: "Sophia dela Cruz", section: "Sec A", quizzes: 30, avg: 85, medal: null },
    { rank: 6, name: "Marco Villanueva", section: "Sec B", quizzes: 32, avg: 83, medal: null },
    { rank: 7, name: "Jessa Ramos",      section: "Sec A", quizzes: 29, avg: 81, medal: null },
    { rank: 8, name: "Diego Aquino",     section: "Sec B", quizzes: 32, avg: 79, medal: null },
  ];

  const medalStyle = (m) => ({
    gold:   "bg-[#C9A227] text-white",
    silver: "bg-gray-400 text-white",
    bronze: "bg-[#b96a30] text-white",
  })[m] || "bg-[#f0e8d0] text-[#4A0404]";

  const badgeLabel = (m) => ({ gold: "Gold", silver: "Silver", bronze: "Bronze" })[m] || "—";
  const badgePill  = (m) => ({
    gold:   "bg-[#faeeda] text-[#854F0B]",
    silver: "bg-gray-100 text-gray-600",
    bronze: "bg-[#faece7] text-[#993C1D]",
  })[m];

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Class Leaderboard</h2>
      <p className="text-gray-500 text-sm mb-6">Ranked by cumulative quiz scores this semester</p>

      <div className="flex gap-3 mb-5">
        <select className="text-sm px-3 py-2 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]">
          <option>All Subjects</option><option>Biology</option><option>Chemistry</option><option>Physics</option>
        </select>
        <select className="text-sm px-3 py-2 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]">
          <option>All Sections</option><option>Section A</option><option>Section B</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span className="text-sm font-semibold text-[#4A0404]">Rankings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-[#f0e8d0]">
                <th className="text-left px-5 py-3">Rank</th>
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Section</th>
                <th className="text-left px-5 py-3">Quizzes</th>
                <th className="text-left px-5 py-3">Avg Score</th>
                <th className="text-left px-5 py-3">Progress</th>
                <th className="text-left px-5 py-3">Badge</th>
               </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.rank} className="border-b border-[#f8f4ec] hover:bg-[#FFFDF7] transition">
                  <td className="px-5 py-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${medalStyle(s.medal)}`}>
                      {s.rank}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-5 py-3 text-gray-500">{s.section}</td>
                  <td className="px-5 py-3 text-gray-600">{s.quizzes}</td>
                  <td className="px-5 py-3 font-semibold text-[#4A0404]">{s.avg}%</td>
                  <td className="px-5 py-3">
                    <div className="w-24 h-1.5 bg-[#f0e8d0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C9A227] rounded-full" style={{ width: `${s.avg}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {s.medal
                      ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgePill(s.medal)}`}>{badgeLabel(s.medal)}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Attendance() {
  const days = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  // March 2026 starts on Sunday
  const calendar = [
    { day: null }, { day: null }, { day: null }, { day: null }, { day: null }, { day: null }, { day: 1 },
    { day: 2, status: "weekend" }, { day: 3, status: "present" }, { day: 4, status: "present" }, { day: 5, status: "present" }, { day: 6, status: "present" }, { day: 7, status: "present" }, { day: 8, status: "weekend" },
    { day: 9, status: "weekend" }, { day: 10, status: "present" }, { day: 11, status: "absent" }, { day: 12, status: "present" }, { day: 13, status: "present" }, { day: 14, status: "present" }, { day: 15, status: "weekend" },
    { day: 16, status: "weekend" }, { day: 17, status: "present" }, { day: 18, status: "present" }, { day: 19, status: "present" }, { day: 20, status: "present" }, { day: 21, status: "today" }, { day: 22, status: "weekend" },
    { day: 23, status: "weekend" }, { day: 24, status: "future" }, { day: 25, status: "future" }, { day: 26, status: "future" }, { day: 27, status: "future" }, { day: 28, status: "future" }, { day: 29, status: "weekend" },
    { day: 30, status: "weekend" }, { day: 31, status: "future" },
  ];

  const cellStyle = (s) => ({
    present: "bg-green-100 text-green-800",
    absent:  "bg-red-100 text-red-700",
    today:   "bg-[#C9A227] text-white font-bold ring-2 ring-[#C9A227] ring-offset-1",
    future:  "bg-[#f5f0e8] text-gray-300",
    weekend: "text-gray-300",
  })[s] || "text-gray-200";

  const todayStudents = [
    { name: "Andrea Reyes",     section: "Sec A", status: "Present", time: "7:58 AM" },
    { name: "Carlo Mendoza",    section: "Sec B", status: "Present", time: "8:01 AM" },
    { name: "Lyra Bautista",    section: "Sec A", status: "Absent",  time: "—" },
    { name: "Kevin Tan",        section: "Sec B", status: "Present", time: "7:55 AM" },
    { name: "Sophia dela Cruz", section: "Sec A", status: "Late",    time: "8:24 AM" },
    { name: "Marco Villanueva", section: "Sec B", status: "Present", time: "7:50 AM" },
  ];

  const statusBadge = (s) => ({
    Present: "bg-green-100 text-green-800",
    Absent:  "bg-red-100 text-red-700",
    Late:    "bg-yellow-100 text-yellow-800",
  })[s] || "bg-gray-100 text-gray-600";

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Attendance Tracker</h2>
      <p className="text-gray-500 text-sm mb-6">March 2026 — Section A & B</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">March 2026</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {days.map(d => <div key={d} className="text-center text-xs text-gray-400 pb-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((c, i) => (
                <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs transition ${c.day ? cellStyle(c.status) : ""}`}>
                  {c.day || ""}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              {[["bg-green-100","text-green-800","Present"],["bg-red-100","text-red-700","Absent"],["bg-[#C9A227]","text-white","Today"]].map(([bg,tc,label]) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className={`w-3 h-3 rounded ${bg} inline-block`}></span>{label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Today's list */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Today's Attendance</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-[#f0e8d0]">
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Section</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Time In</th>
                </tr>
              </thead>
              <tbody>
                {todayStudents.map((s, i) => (
                  <tr key={i} className="border-b border-[#f8f4ec] hover:bg-[#FFFDF7] transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.section}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{s.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reports() {
  // Data for Pie Chart (Grade Distribution)
  const gradeData = [
    { name: 'A (90-100%)', value: 30, color: '#4CAF50' },
    { name: 'B (80-89%)', value: 40, color: '#8BC34A' },
    { name: 'C (70-79%)', value: 20, color: '#FFC107' },
    { name: 'D (60-69%)', value: 7, color: '#FF9800' },
    { name: 'F (<60%)', value: 3, color: '#F44336' },
  ];

  // Data for Line Chart (Quiz Trend over time)
  const quizTrendData = [
    { quiz: 'Q1', score: 85 },
    { quiz: 'Q2', score: 82 },
    { quiz: 'Q3', score: 88 },
    { quiz: 'Q4', score: 86 },
    { quiz: 'Q5', score: 90 },
    { quiz: 'Q6', score: 92 },
    { quiz: 'Q7', score: 88 },
    { quiz: 'Q8', score: 91 },
    { quiz: 'Q9', score: 89 },
    { quiz: 'Q10', score: 93 },
    { quiz: 'Q11', score: 94 },
    { quiz: 'Q12', score: 96 },
  ];

  // Data for Bar Chart (Average Score by Subject)
  const subjectData = [
    { subject: 'Biology', avg: 84 },
    { subject: 'Chemistry', avg: 78 },
    { subject: 'Physics', avg: 82 },
    { subject: 'Mathematics', avg: 88 },
  ];

  // At-risk students
  const atRisk = [
    { name: "Ryan Gomez",   avg: "54%", missed: 3, status: "At Risk" },
    { name: "Bianca Cruz",  avg: "61%", missed: 2, status: "Watch"   },
    { name: "Ivan Lim",     avg: "58%", missed: 4, status: "At Risk" },
    { name: "Mia Santos",   avg: "65%", missed: 1, status: "Watch"   },
  ];

  const riskBadge = (s) => s === "At Risk"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-800";

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Reports & Analytics</h2>
      <p className="text-gray-500 text-sm mb-6">Student performance overview — Semester 2, AY 2025–2026</p>

      {/* Mini stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Class Average",      value: "81%", sub: "+3% vs last quiz" },
          { label: "Passing Rate",       value: "94%", sub: "141 of 148 students" },
          { label: "Quizzes Completed",  value: "32",  sub: "This semester" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border-t-2 border-[#C9A227] border border-[#e8dfc8] shadow-sm p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-[#4A0404]">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Three graphs row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Grade Distribution</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Quiz Score Trend</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={quizTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
                <XAxis dataKey="quiz" stroke="#9ca3af" fontSize={12} />
                <YAxis domain={[70, 100]} stroke="#9ca3af" fontSize={12} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="score" stroke="#C9A227" strokeWidth={2} dot={{ fill: '#C9A227', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
            </svg>
            <span className="text-sm font-semibold text-[#4A0404]">Average by Subject</span>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8d0" />
                <XAxis dataKey="subject" stroke="#9ca3af" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="avg" fill="#C9A227" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* At-risk table */}
      <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span className="text-sm font-semibold text-[#4A0404]">At-Risk Students</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-[#f0e8d0]">
                <th className="text-left px-5 py-3">Student</th>
                <th className="text-left px-5 py-3">Avg</th>
                <th className="text-left px-5 py-3">Missed</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((s, i) => (
                <tr key={i} className="border-b border-[#f8f4ec] hover:bg-[#FFFDF7] transition">
                  <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-5 py-3 text-gray-600">{s.avg}</td>
                  <td className="px-5 py-3 text-gray-600">{s.missed}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskBadge(s.status)}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GenerateQuiz({ navigate }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Generate Quiz</h2>
      <p className="text-gray-500 text-sm mb-6">Create AI-powered quizzes from your uploaded lecture materials</p>
      <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden max-w-xl">
        <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z"/>
          </svg>
          <span className="text-sm font-semibold text-[#4A0404]">Quiz Settings</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              { label: "Source Lecture",   opts: ["Chapter 7 Notes.pdf","Lab Manual Q2.pdf","Midterm Slides.pptx"] },
              { label: "Number of Items",  opts: ["10 items","15 items","20 items","25 items"] },
              { label: "Question Type",    opts: ["Multiple Choice","True or False","Identification","Mixed"] },
              { label: "Difficulty",       opts: ["Easy","Medium","Hard","Mixed"] },
            ].map(({ label, opts }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-1.5">{label}</p>
                <select className="w-full text-sm px-3 py-2 border border-[#e8dfc8] rounded-xl bg-white text-gray-600 focus:outline-none focus:border-[#C9A227]">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/generate-quiz")}
            className="w-full py-2.5 bg-[#C9A227] hover:bg-[#b8911f] text-[#4A0404] font-semibold rounded-xl transition text-sm"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function TeacherDashboard() {
  const [fullName, setFullName]   = useState("John Doe");
  const [initials, setInitials]   = useState("JD");
  const [loginTime, setLoginTime] = useState("");
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  // Set login time on mount
  useState(() => {
    const now = new Date();
    const opts = { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    setLoginTime(now.toLocaleString("en-US", opts));
  });

  const handleLogout = () => {
    navigate("/");
  };

  // Sidebar nav config
  const navItems = [
    {
      id: "dashboard", label: "Dashboard",
      icon: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>,
    },
    {
      id: "upload", label: "Upload Lecture",
      icon: <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>,
    },
    {
      id: "leaderboard", label: "Leaderboard",
      icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.07 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/>,
    },
    {
      id: "attendance", label: "Attendance",
      icon: <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>,
    },
    {
      id: "reports", label: "Reports",
      icon: <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>,
    },
    {
      id: "quiz", label: "Generate Quiz",
      icon: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 13.5v-7l6 3.5-6 3.5z"/>,
    },
  ];

  // Dashboard home page
  const DashboardHome = () => {
    const stats = [
      { label: "Total Students",   value: "148", change: "+4 this semester",  up: true  },
      { label: "Quizzes Given",    value: "32",  change: "+2 this week",       up: true  },
      { label: "Avg. Score",       value: "81%", change: "+3% vs last quiz",   up: true  },
      { label: "Attendance Today", value: "93%", change: "-2% vs last week",   up: false },
    ];

    const topStudents = [
      { rank: 1, name: "Andrea Reyes",     score: 97, cls: "bg-[#C9A227] text-white" },
      { rank: 2, name: "Carlo Mendoza",    score: 94, cls: "bg-gray-400 text-white"  },
      { rank: 3, name: "Lyra Bautista",    score: 91, cls: "bg-[#b96a30] text-white" },
      { rank: 4, name: "Kevin Tan",        score: 88, cls: "bg-[#f0e8d0] text-[#4A0404]" },
      { rank: 5, name: "Sophia dela Cruz", score: 85, cls: "bg-[#f0e8d0] text-[#4A0404]" },
    ];

    const recentFiles = [
      { name: "Chapter 7 Notes.pdf", subject: "Biology",   date: "Mar 20", status: "Published" },
      { name: "Lab Manual Q2.pdf",   subject: "Chemistry", date: "Mar 19", status: "Published" },
      { name: "Midterm Slides.pptx", subject: "Physics",   date: "Mar 18", status: "Draft"     },
      { name: "Formula Sheet.docx",  subject: "Math",      date: "Mar 15", status: "Published" },
    ];

    return (
      <div>
        <h2 className="text-2xl font-bold text-[#4A0404] mb-1">Good morning, {fullName}! 📚</h2>
        <p className="text-gray-500 text-sm mb-6">Here's a summary of your classes today — Monday, March 21, 2026</p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border-t-2 border-[#C9A227] border border-[#e8dfc8] shadow-sm p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-[#4A0404]">{s.value}</p>
              <p className={`text-xs mt-1 ${s.up ? "text-green-600" : "text-red-500"}`}>{s.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
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
              {topStudents.map((s) => (
                <div key={s.rank} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${s.cls}`}>{s.rank}</div>
                  <span className="flex-1 text-sm text-gray-700">{s.name}</span>
                  <div className="w-20 h-1.5 bg-[#f0e8d0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C9A227] rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-[#4A0404] w-8 text-right">{s.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white rounded-2xl border border-[#e8dfc8] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#f0e8d0] bg-[#FFFDF7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                </svg>
                <span className="text-sm font-semibold text-[#4A0404]">Recent Uploads</span>
              </div>
              <button onClick={() => setActivePage("upload")} className="text-xs text-[#C9A227] hover:underline">Manage</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-[#f0e8d0]">
                    <th className="text-left px-5 py-3">File</th>
                    <th className="text-left px-5 py-3">Subject</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFiles.map((f, i) => (
                    <tr key={i} className="border-b border-[#f8f4ec] hover:bg-[#FFFDF7] transition">
                      <td className="px-5 py-3 text-gray-700 truncate max-w-[140px]">{f.name}</td>
                      <td className="px-5 py-3 text-gray-500">{f.subject}</td>
                      <td className="px-5 py-3 text-gray-500">{f.date}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.status === "Published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render page based on activePage
  const renderPage = () => {
    switch (activePage) {
      case "upload":      return <UploadLecture />;
      case "leaderboard": return <Leaderboard />;
      case "attendance":  return <Attendance />;
      case "reports":     return <Reports />;
      case "quiz":        return <GenerateQuiz navigate={navigate} />;
      default:            return <DashboardHome />;
    }
  };

  // Main layout
  return (
    <div className="min-h-screen flex flex-col bg-[#6B0000]">

      {/* TOP NAV */}
      <header className="h-14 bg-[#4A0000] border-b-2 border-[#C9A227] flex items-center justify-between px-6 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A227] rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-[#4A0000]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
            </svg>
          </div>
          <span className="text-[#C9A227] font-semibold text-sm tracking-wide">QuizGen Portal</span>
        </div>

        {/* User info + logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[#F5E6A3] text-sm font-medium">{fullName}</p>
            <p className="text-[#C9A227] text-xs opacity-70">Logged in: {loginTime}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#C9A227] border-2 border-[#F5E6A3] flex items-center justify-center text-[#4A0000] text-sm font-bold">
            {initials || "T"}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-[#C9A227] border border-[#C9A22766] px-3 py-1.5 rounded-lg hover:bg-[#C9A22720] transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-52 bg-[#3D0000] border-r border-[#C9A22730] flex flex-col py-5 flex-shrink-0">
          <p className="text-[10px] text-[#C9A22755] uppercase tracking-widest px-5 mb-2">Main</p>
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm text-left transition border-l-2 ${
                activePage === item.id
                  ? "bg-[#C9A22715] text-[#C9A227] border-[#C9A227]"
                  : "text-[#C9A22799] border-transparent hover:bg-[#C9A22710] hover:text-[#F5E6A3]"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              {item.label}
            </button>
          ))}
          <p className="text-[10px] text-[#C9A22755] uppercase tracking-widest px-5 mt-4 mb-2">Quizzes</p>
          {navItems.slice(5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm text-left transition border-l-2 ${
                activePage === item.id
                  ? "bg-[#C9A22715] text-[#C9A227] border-[#C9A227]"
                  : "text-[#C9A22799] border-transparent hover:bg-[#C9A22710] hover:text-[#F5E6A3]"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
              {item.label}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-[#F9F5EC] p-7">
          {renderPage()}
          <p className="text-center text-gray-400 text-xs mt-10">© 2024 Quiz Generator. Empower your teaching! 🍎</p>
        </main>

      </div>
    </div>
  );
}

export default TeacherDashboard;
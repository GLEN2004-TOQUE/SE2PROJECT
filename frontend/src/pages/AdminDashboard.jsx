import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../services/api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const apiFetch = async (path, opts = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
};

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.93) translateY(8px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: .4; }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes toastSlide {
      0%   { opacity: 0; transform: translateX(60px); }
      10%  { opacity: 1; transform: translateX(0); }
      85%  { opacity: 1; transform: translateX(0); }
      100% { opacity: 0; transform: translateX(60px); }
    }

    .adm-root {
      min-height: 100vh;
      background: #0b0b0f;
      background-image:
        radial-gradient(ellipse 70% 50% at 20% 0%,  rgba(139,92,246,.12) 0%, transparent 65%),
        radial-gradient(ellipse 50% 40% at 80% 100%, rgba(16,185,129,.08) 0%, transparent 65%);
      font-family: 'Syne', sans-serif;
      color: #e2e2f0;
    }

    /* ── Topbar ── */
    .topbar {
      position: sticky; top: 0; z-index: 40;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 2.5rem;
      height: 60px;
      background: rgba(11,11,15,.85);
      backdrop-filter: blur(14px);
      border-bottom: 1px solid rgba(255,255,255,.07);
      animation: slideDown .4s ease both;
    }
    .topbar-logo {
      display: flex; align-items: center; gap: .65rem;
      font-size: 1rem; font-weight: 800; letter-spacing: -.02em;
      color: #fff;
    }
    .topbar-logo-badge {
      width: 28px; height: 28px;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
    }
    .topbar-logo-badge svg { width: 16px; height: 16px; color: #fff; }
    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .admin-chip {
      font-family: 'DM Mono', monospace;
      font-size: .68rem; font-weight: 500;
      padding: .22rem .7rem;
      background: rgba(139,92,246,.15);
      border: 1px solid rgba(139,92,246,.3);
      border-radius: 999px;
      color: #a78bfa;
      letter-spacing: .06em;
    }
    .btn-logout {
      padding: .38rem .9rem;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.05);
      color: rgba(255,255,255,.5);
      font-family: 'Syne', sans-serif;
      font-size: .78rem;
      cursor: pointer;
      transition: all .2s;
    }
    .btn-logout:hover { background: rgba(255,255,255,.1); color: #fff; }

    /* ── Layout ── */
    .adm-body { display: flex; gap: 0; }

    /* ── Sidebar tabs ── */
    .side-nav {
      width: 200px; flex-shrink: 0;
      min-height: calc(100vh - 60px);
      padding: 1.5rem 1rem;
      border-right: 1px solid rgba(255,255,255,.06);
    }
    .nav-section-label {
      font-size: .62rem; letter-spacing: .12em;
      text-transform: uppercase;
      color: rgba(255,255,255,.25);
      padding: 0 .5rem;
      margin-bottom: .5rem;
    }
    .nav-item {
      display: flex; align-items: center; gap: .6rem;
      padding: .55rem .75rem;
      border-radius: 9px;
      cursor: pointer;
      font-size: .82rem; font-weight: 600;
      color: rgba(255,255,255,.4);
      transition: all .15s;
      margin-bottom: .2rem;
      border: 1px solid transparent;
    }
    .nav-item:hover { background: rgba(255,255,255,.05); color: rgba(255,255,255,.75); }
    .nav-item.active {
      background: rgba(139,92,246,.15);
      border-color: rgba(139,92,246,.25);
      color: #c4b5fd;
    }
    .nav-item svg { width: 15px; height: 15px; flex-shrink: 0; }
    .nav-badge {
      margin-left: auto;
      font-family: 'DM Mono', monospace;
      font-size: .65rem;
      background: rgba(139,92,246,.2);
      color: #a78bfa;
      border-radius: 5px;
      padding: .1rem .35rem;
    }

    /* ── Main content ── */
    .adm-main {
      flex: 1;
      padding: 2rem 2.5rem;
      animation: fadeIn .35s ease both;
      min-width: 0;
    }
    .page-header { margin-bottom: 2rem; }
    .page-title {
      font-size: 1.5rem; font-weight: 800;
      color: #fff;
      letter-spacing: -.03em;
    }
    .page-subtitle {
      font-size: .82rem; color: rgba(255,255,255,.35);
      margin-top: .3rem;
    }

    /* ── Stat cards ── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 14px;
      padding: 1.25rem 1.4rem;
    }
    .stat-label {
      font-size: .72rem; letter-spacing: .08em;
      text-transform: uppercase;
      color: rgba(255,255,255,.3);
      margin-bottom: .5rem;
    }
    .stat-value {
      font-size: 2rem; font-weight: 800;
      color: #fff; line-height: 1;
    }
    .stat-sub {
      font-size: .72rem; color: rgba(255,255,255,.25);
      margin-top: .4rem;
    }
    .stat-dot {
      display: inline-block;
      width: 7px; height: 7px; border-radius: 50%;
      margin-right: .4rem;
      animation: pulse-dot 2s infinite;
    }

    /* ── Panel / table ── */
    .panel {
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.07);
      border-radius: 16px;
      overflow: hidden;
    }
    .panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1.1rem 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .panel-title {
      font-size: .88rem; font-weight: 700; color: #fff;
    }
    .search-box {
      display: flex; align-items: center; gap: .5rem;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 8px;
      padding: .4rem .75rem;
    }
    .search-box input {
      background: none; border: none; outline: none;
      color: #fff; font-family: 'Syne', sans-serif;
      font-size: .8rem; width: 180px;
    }
    .search-box input::placeholder { color: rgba(255,255,255,.25); }
    .search-box svg { width: 14px; height: 14px; color: rgba(255,255,255,.25); }

    /* table */
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      font-size: .68rem; letter-spacing: .1em;
      text-transform: uppercase; color: rgba(255,255,255,.25);
      font-weight: 600; font-family: 'DM Mono', monospace;
      padding: .75rem 1.5rem;
      text-align: left;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .data-table td {
      padding: .85rem 1.5rem;
      font-size: .82rem; color: rgba(255,255,255,.7);
      border-bottom: 1px solid rgba(255,255,255,.04);
    }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(255,255,255,.025); }

    .user-cell { display: flex; align-items: center; gap: .7rem; }
    .avatar {
      width: 32px; height: 32px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: .75rem; font-weight: 700; flex-shrink: 0;
    }
    .avatar-teacher { background: rgba(139,92,246,.2); color: #a78bfa; }
    .avatar-student { background: rgba(16,185,129,.15); color: #34d399; }
    .avatar-admin   { background: rgba(251,191,36,.15); color: #fbbf24; }

    .user-name { font-weight: 600; color: #fff; font-size: .83rem; }
    .user-email { font-size: .72rem; color: rgba(255,255,255,.3); font-family: 'DM Mono', monospace; }

    .role-chip {
      display: inline-flex; align-items: center;
      padding: .18rem .6rem;
      border-radius: 6px;
      font-size: .68rem; font-weight: 600; letter-spacing: .04em;
    }
    .role-teacher { background: rgba(139,92,246,.15); color: #a78bfa; }
    .role-student { background: rgba(16,185,129,.12); color: #34d399; }
    .role-admin   { background: rgba(251,191,36,.12); color: #fbbf24; }

    /* action buttons */
    .btn-assign {
      padding: .32rem .8rem;
      border-radius: 7px;
      border: 1px solid rgba(139,92,246,.35);
      background: rgba(139,92,246,.12);
      color: #c4b5fd;
      font-family: 'Syne', sans-serif;
      font-size: .76rem; font-weight: 600;
      cursor: pointer;
      transition: all .15s;
    }
    .btn-assign:hover { background: rgba(139,92,246,.25); border-color: rgba(139,92,246,.6); }

    .btn-remove {
      padding: .28rem .7rem;
      border-radius: 7px;
      border: 1px solid rgba(239,68,68,.25);
      background: rgba(239,68,68,.08);
      color: #f87171;
      font-family: 'Syne', sans-serif;
      font-size: .72rem; font-weight: 600;
      cursor: pointer;
      transition: all .15s;
    }
    .btn-remove:hover { background: rgba(239,68,68,.18); }

    .empty-state {
      padding: 3rem 1.5rem;
      text-align: center;
      color: rgba(255,255,255,.2);
      font-size: .85rem;
    }

    /* ── Assignment chip in table ── */
    .assign-info {
      display: flex; align-items: center; gap: .5rem;
    }
    .assign-name { font-size: .8rem; color: rgba(255,255,255,.65); font-weight: 600; }
    .assign-none { font-size: .75rem; color: rgba(255,255,255,.2); font-style: italic; }

    /* ── Confirmation modal ── */
    .modal-overlay {
      position: fixed; inset: 0; z-index: 60;
      background: rgba(0,0,0,.65);
      backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center;
      padding: 1rem;
      animation: fadeIn .2s ease both;
    }
    .modal {
      background: #16161e;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 20px;
      padding: 2rem;
      width: 100%; max-width: 420px;
      animation: modalIn .25s cubic-bezier(.34,1.56,.64,1) both;
      box-shadow: 0 40px 80px rgba(0,0,0,.6);
    }
    .modal-icon {
      width: 52px; height: 52px; border-radius: 14px;
      background: linear-gradient(135deg, rgba(139,92,246,.3), rgba(6,182,212,.2));
      border: 1px solid rgba(139,92,246,.3);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.25rem;
    }
    .modal-icon svg { width: 24px; height: 24px; color: #a78bfa; }
    .modal-title { font-size: 1.1rem; font-weight: 800; color: #fff; margin-bottom: .5rem; }
    .modal-body  { font-size: .84rem; color: rgba(255,255,255,.5); line-height: 1.6; margin-bottom: 1.5rem; }
    .modal-body strong { color: rgba(255,255,255,.8); }
    .modal-select-label {
      font-size: .72rem; letter-spacing: .08em;
      text-transform: uppercase; color: rgba(255,255,255,.3);
      margin-bottom: .5rem;
    }
    .modal-select {
      width: 100%;
      padding: .65rem .9rem;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 10px;
      color: #fff;
      font-family: 'Syne', sans-serif; font-size: .84rem;
      outline: none; cursor: pointer;
      margin-bottom: 1.5rem;
      transition: border-color .2s;
    }
    .modal-select:focus { border-color: rgba(139,92,246,.5); }
    .modal-select option { background: #16161e; }
    .modal-actions { display: flex; gap: .75rem; }
    .btn-cancel {
      flex: 1; padding: .7rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.05);
      color: rgba(255,255,255,.5);
      font-family: 'Syne', sans-serif; font-size: .84rem; font-weight: 600;
      cursor: pointer; transition: all .15s;
    }
    .btn-cancel:hover { background: rgba(255,255,255,.1); color: #fff; }
    .btn-confirm {
      flex: 2; padding: .7rem;
      border-radius: 10px;
      border: none;
      background: linear-gradient(135deg, #7c3aed, #2563eb);
      color: #fff;
      font-family: 'Syne', sans-serif; font-size: .84rem; font-weight: 700;
      cursor: pointer; transition: opacity .15s;
    }
    .btn-confirm:hover { opacity: .88; }
    .btn-confirm:disabled { opacity: .45; cursor: not-allowed; }

    /* ── Toast ── */
    .toast {
      position: fixed; bottom: 2rem; right: 2rem; z-index: 100;
      display: flex; align-items: center; gap: .75rem;
      padding: .85rem 1.2rem;
      border-radius: 12px;
      background: #16161e;
      border: 1px solid rgba(255,255,255,.1);
      box-shadow: 0 20px 40px rgba(0,0,0,.4);
      font-size: .84rem; font-weight: 600;
      animation: toastSlide 3.5s ease forwards;
      max-width: 340px;
    }
    .toast-success { border-color: rgba(16,185,129,.35); color: #34d399; }
    .toast-error   { border-color: rgba(239,68,68,.35);  color: #f87171; }
    .toast svg { width: 18px; height: 18px; flex-shrink: 0; }

    /* spinner */
    .spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.2);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .6s linear infinite;
    }

    /* loading skeleton */
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position:  400px 0; }
    }
    .skeleton {
      height: 14px; border-radius: 4px;
      background: linear-gradient(90deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.1) 50%, rgba(255,255,255,.05) 100%);
      background-size: 800px 100%;
      animation: shimmer 1.4s infinite;
    }

    @media (max-width: 768px) {
      .stats-row { grid-template-columns: 1fr; }
      .side-nav { display: none; }
      .adm-main { padding: 1.25rem; }
      .topbar { padding: 0 1rem; }
    }
  `}</style>
);

/* ─── Icons ── */
const Ico = {
  Shield:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l7 3v5c0 5.25-2.625 8.75-7 10C7.625 18.75 5 15.25 5 10V5l7-3z"/></svg>,
  Users:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Teacher: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v10H4z"/><path d="M2 20l10-6 10 6"/></svg>,
  Link:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Search:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Check:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>,
  X:       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Logout:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "?";

/* ─── Component ── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // { student }
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState(null);

  const user = getUser();

  // Auth guard
  useEffect(() => {
    if (!user || user.role !== "admin") navigate("/");
  }, [user, navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3600);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, t, a] = await Promise.all([
        apiFetch("/api/admin/students"),
        apiFetch("/api/admin/teachers"),
        apiFetch("/api/admin/assignments"),
      ]);
      setStudents(s);
      setTeachers(t);
      setAssignments(a);
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Map student_id → teacher info for quick lookup
  const assignmentMap = {};
  assignments.forEach((a) => {
    if (a.student?.id) assignmentMap[a.student.id] = a.teacher;
  });

  const handleOpenAssign = (student) => {
    const currentTeacher = assignmentMap[student.id];
    setSelectedTeacher(currentTeacher?.id || "");
    setModal({ student });
  };

  const handleConfirmAssign = async () => {
    if (!selectedTeacher) return;
    setConfirming(true);
    try {
      const result = await apiFetch("/api/admin/assign", {
        method: "POST",
        body: JSON.stringify({ teacherId: selectedTeacher, studentId: modal.student.id }),
      });
      showToast(result.message);
      setModal(null);
      await loadData();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setConfirming(false);
    }
  };

  const handleRemove = async (studentId, studentName) => {
    if (!window.confirm(`Remove assignment for ${studentName}?`)) return;
    try {
      await apiFetch(`/api/admin/assign/${studentId}`, { method: "DELETE" });
      showToast("Assignment removed");
      await loadData();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const filteredStudents = students.filter(
    (s) => s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
           s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTeachers = teachers.filter(
    (t) => t.full_name?.toLowerCase().includes(search.toLowerCase()) ||
           t.email?.toLowerCase().includes(search.toLowerCase())
  );

  const assignedCount = Object.keys(assignmentMap).length;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Styles />

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? Ico.Check : Ico.X}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Confirm modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">{Ico.Link}</div>
            <h2 className="modal-title">Assign Teacher</h2>
            <p className="modal-body">
              You're assigning a teacher to{" "}
              <strong>{modal.student.full_name}</strong>.
              {assignmentMap[modal.student.id] && (
                <> Current teacher: <strong>{assignmentMap[modal.student.id].full_name}</strong>. This will be replaced.</>
              )}
            </p>
            <p className="modal-select-label">Select Teacher</p>
            <select
              className="modal-select"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
            >
              <option value="">— Choose a teacher —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name} ({t.email})</option>
              ))}
            </select>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="btn-confirm"
                onClick={handleConfirmAssign}
                disabled={!selectedTeacher || confirming}
              >
                {confirming ? <span className="spinner" /> : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="adm-root">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-logo">
            <div className="topbar-logo-badge">{Ico.Shield}</div>
            Admin Console
          </div>
          <div className="topbar-right">
            <span className="admin-chip">ADMIN</span>
            <button className="btn-logout" onClick={() => { logout(); navigate("/"); }}>
              Sign out
            </button>
          </div>
        </header>

        <div className="adm-body">
          {/* Side Nav */}
          <nav className="side-nav">
            <p className="nav-section-label" style={{ marginBottom: "1rem" }}>Navigation</p>
            {[
              { key: "overview", icon: Ico.Shield, label: "Overview" },
              { key: "students", icon: Ico.Users, label: "Students", count: students.length },
              { key: "teachers", icon: Ico.Teacher, label: "Teachers", count: teachers.length },
              { key: "assignments", icon: Ico.Link, label: "Assignments", count: assignments.length },
            ].map((n) => (
              <div
                key={n.key}
                className={`nav-item ${tab === n.key ? "active" : ""}`}
                onClick={() => { setTab(n.key); setSearch(""); }}
              >
                {n.icon}
                {n.label}
                {n.count !== undefined && (
                  <span className="nav-badge">{n.count}</span>
                )}
              </div>
            ))}
          </nav>

          {/* Main */}
          <main className="adm-main">

            {/* Overview */}
            {tab === "overview" && (
              <>
                <div className="page-header">
                  <h1 className="page-title">Overview</h1>
                  <p className="page-subtitle">System summary and quick stats</p>
                </div>
                <div className="stats-row">
                  <div className="stat-card">
                    <p className="stat-label">Students</p>
                    <p className="stat-value">{students.length}</p>
                    <p className="stat-sub">
                      <span className="stat-dot" style={{ background: "#34d399" }} />
                      {assignedCount} assigned
                    </p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Teachers</p>
                    <p className="stat-value">{teachers.length}</p>
                    <p className="stat-sub">
                      <span className="stat-dot" style={{ background: "#a78bfa" }} />
                      {teachers.filter(t => assignments.some(a => a.teacher?.id === t.id)).length} active
                    </p>
                  </div>
                  <div className="stat-card">
                    <p className="stat-label">Assignments</p>
                    <p className="stat-value">{assignments.length}</p>
                    <p className="stat-sub">
                      <span className="stat-dot" style={{ background: "#38bdf8" }} />
                      {students.length - assignedCount} unassigned
                    </p>
                  </div>
                </div>

                {/* Unassigned students alert */}
                {students.length - assignedCount > 0 && (
                  <div className="panel" style={{ marginBottom: "1.5rem", border: "1px solid rgba(251,191,36,.2)" }}>
                    <div className="panel-header" style={{ background: "rgba(251,191,36,.05)" }}>
                      <span className="panel-title" style={{ color: "#fbbf24" }}>
                        ⚠ {students.length - assignedCount} student(s) without a teacher
                      </span>
                      <button className="btn-assign" onClick={() => setTab("students")}>
                        Assign Now →
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent assignments */}
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">Recent Assignments</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Teacher</th>
                        <th>Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i}>
                            <td><div className="skeleton" style={{width:"140px"}} /></td>
                            <td><div className="skeleton" style={{width:"120px"}} /></td>
                            <td><div className="skeleton" style={{width:"80px"}} /></td>
                          </tr>
                        ))
                      ) : assignments.length === 0 ? (
                        <tr><td colSpan={3} className="empty-state">No assignments yet</td></tr>
                      ) : (
                        assignments.slice(0, 6).map((a) => (
                          <tr key={a.id}>
                            <td>
                              <div className="user-cell">
                                <div className="avatar avatar-student">{initials(a.student?.full_name)}</div>
                                <div>
                                  <div className="user-name">{a.student?.full_name}</div>
                                  <div className="user-email">{a.student?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="user-cell">
                                <div className="avatar avatar-teacher">{initials(a.teacher?.full_name)}</div>
                                <span className="user-name">{a.teacher?.full_name}</span>
                              </div>
                            </td>
                            <td style={{ fontFamily:"'DM Mono',monospace", fontSize:".72rem", color:"rgba(255,255,255,.3)" }}>
                              {new Date(a.assigned_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Students Tab */}
            {tab === "students" && (
              <>
                <div className="page-header">
                  <h1 className="page-title">Students</h1>
                  <p className="page-subtitle">Manage student accounts and teacher assignments</p>
                </div>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">{filteredStudents.length} students</span>
                    <div className="search-box">
                      {Ico.Search}
                      <input
                        placeholder="Search students…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Points / Tier</th>
                        <th>Assigned Teacher</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3,4].map(i => (
                          <tr key={i}>
                            {[200,80,120,60].map((w,j) => (
                              <td key={j}><div className="skeleton" style={{width:w}} /></td>
                            ))}
                          </tr>
                        ))
                      ) : filteredStudents.length === 0 ? (
                        <tr><td colSpan={4} className="empty-state">No students found</td></tr>
                      ) : (
                        filteredStudents.map((s) => {
                          const teacher = assignmentMap[s.id];
                          return (
                            <tr key={s.id}>
                              <td>
                                <div className="user-cell">
                                  <div className="avatar avatar-student">{initials(s.full_name)}</div>
                                  <div>
                                    <div className="user-name">{s.full_name}</div>
                                    <div className="user-email">{s.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: "#fff" }}>{s.points ?? 0}</span>
                                <span style={{ color: "rgba(255,255,255,.3)", marginLeft: ".4rem", fontSize: ".74rem" }}>
                                  {s.tier || "Beginner"}
                                </span>
                              </td>
                              <td>
                                {teacher ? (
                                  <div className="assign-info">
                                    <div className="avatar avatar-teacher" style={{width:24,height:24,fontSize:".6rem"}}>
                                      {initials(teacher.full_name)}
                                    </div>
                                    <span className="assign-name">{teacher.full_name}</span>
                                  </div>
                                ) : (
                                  <span className="assign-none">Unassigned</span>
                                )}
                              </td>
                              <td>
                                <div style={{ display: "flex", gap: ".5rem" }}>
                                  <button className="btn-assign" onClick={() => handleOpenAssign(s)}>
                                    {teacher ? "Reassign" : "Assign"}
                                  </button>
                                  {teacher && (
                                    <button className="btn-remove" onClick={() => handleRemove(s.id, s.full_name)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Teachers Tab */}
            {tab === "teachers" && (
              <>
                <div className="page-header">
                  <h1 className="page-title">Teachers</h1>
                  <p className="page-subtitle">View all registered teachers and their student load</p>
                </div>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">{filteredTeachers.length} teachers</span>
                    <div className="search-box">
                      {Ico.Search}
                      <input
                        placeholder="Search teachers…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Teacher</th>
                        <th>Status</th>
                        <th>Students Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i}>
                            {[200,60,80].map((w,j) => (
                              <td key={j}><div className="skeleton" style={{width:w}} /></td>
                            ))}
                          </tr>
                        ))
                      ) : filteredTeachers.length === 0 ? (
                        <tr><td colSpan={3} className="empty-state">No teachers found</td></tr>
                      ) : (
                        filteredTeachers.map((t) => {
                          const count = assignments.filter(a => a.teacher?.id === t.id).length;
                          return (
                            <tr key={t.id}>
                              <td>
                                <div className="user-cell">
                                  <div className="avatar avatar-teacher">{initials(t.full_name)}</div>
                                  <div>
                                    <div className="user-name">{t.full_name}</div>
                                    <div className="user-email">{t.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="role-chip role-teacher">Teacher</span>
                              </td>
                              <td>
                                <span style={{ fontWeight: 700, color: "#a78bfa" }}>{count}</span>
                                <span style={{ color: "rgba(255,255,255,.3)", marginLeft: ".4rem", fontSize: ".74rem" }}>
                                  student{count !== 1 ? "s" : ""}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Assignments Tab */}
            {tab === "assignments" && (
              <>
                <div className="page-header">
                  <h1 className="page-title">Assignments</h1>
                  <p className="page-subtitle">All teacher–student pairings</p>
                </div>
                <div className="panel">
                  <div className="panel-header">
                    <span className="panel-title">{assignments.length} active assignments</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Teacher</th>
                        <th>Assigned On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [1,2,3].map(i => (
                          <tr key={i}>
                            {[200,180,80,60].map((w,j) => (
                              <td key={j}><div className="skeleton" style={{width:w}} /></td>
                            ))}
                          </tr>
                        ))
                      ) : assignments.length === 0 ? (
                        <tr><td colSpan={4} className="empty-state">No assignments yet — go to Students tab to assign</td></tr>
                      ) : (
                        assignments.map((a) => (
                          <tr key={a.id}>
                            <td>
                              <div className="user-cell">
                                <div className="avatar avatar-student">{initials(a.student?.full_name)}</div>
                                <div>
                                  <div className="user-name">{a.student?.full_name}</div>
                                  <div className="user-email">{a.student?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="user-cell">
                                <div className="avatar avatar-teacher">{initials(a.teacher?.full_name)}</div>
                                <div>
                                  <div className="user-name">{a.teacher?.full_name}</div>
                                  <div className="user-email">{a.teacher?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontFamily:"'DM Mono',monospace", fontSize:".72rem", color:"rgba(255,255,255,.3)" }}>
                              {new Date(a.assigned_at).toLocaleString()}
                            </td>
                            <td>
                              <button
                                className="btn-remove"
                                onClick={() => handleRemove(a.student?.id, a.student?.full_name)}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </>
  );
}
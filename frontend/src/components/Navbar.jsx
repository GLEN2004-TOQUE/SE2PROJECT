export default function Navbar({ user, onLogout }) {
  // Get user initials for avatar fallback
  const getInitials = () => {
    const name = user.full_name || "Student";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sd-nav">
      <div className="sd-nav-brand">
        <div className="sd-nav-icon">
          <img 
            src="/image/logo.png" 
            alt="Logo" 
            onError={(e) => { e.target.style.display = "none"; }} 
          />
        </div>
        <span className="sd-nav-title">QuizSystem</span>
      </div>

      <div className="sd-nav-right">
        <div className="sd-user-info">
          <div className="sd-user-avatar">
            {getInitials()}
          </div>
          <span className="sd-user-name">{user.full_name || "Student"}</span>
        </div>
        <button className="sd-nav-logout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
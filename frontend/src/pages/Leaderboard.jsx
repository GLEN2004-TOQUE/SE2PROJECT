import { useEffect, useState } from "react";
import { API_BASE_URL } from "../services/api";

function Leaderboard({ type }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/game/leaderboard/${type}`)
      .then((res) => res.json())
      .then(setUsers);
  }, [type]);

  return (
    <div>
      <h2>Leaderboard ({type})</h2>

      {users.map((u, i) => (
        <div key={u.id}>
          <p>#{i + 1} - {u.points} pts - {u.tier}</p>
        </div>
      ))}
    </div>
  );
}
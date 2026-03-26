const { supabase } = require("../supabaseClient");

function computePoints(score, total) {
  return Math.round((score / total) * 100);
}

function getTier(points) {
  if (points >= 1000) return "Master";
  if (points >= 500) return "Advanced";
  if (points >= 200) return "Intermediate";
  return "Beginner";
}
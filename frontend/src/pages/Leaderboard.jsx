import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function useBadgeAssignment(userId) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const assignBadges = async () => {
      setLoading(true);
      try {
        // 1. Fetch user stats or achievements
        const { data: userStats, error: statsError } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (statsError) throw statsError;

        // 2. Define badge conditions
        const badgeConditions = [
          { name: "First Quiz Completed", condition: userStats.quizzes_completed >= 1 },
          { name: "Quiz Master", condition: userStats.quizzes_completed >= 10 },
          { name: "High Scorer", condition: userStats.highest_score >= 90 },
          { name: "Consistent Learner", condition: userStats.login_streak >= 7 },
        ];

        // 3. Determine which badges the user qualifies for
        const earnedBadges = badgeConditions
          .filter(b => b.condition)
          .map(b => b.name);

        // 4. Fetch already assigned badges to avoid duplicates
        const { data: existingBadges, error: badgeError } = await supabase
          .from("user_badges")
          .select("badge_name")
          .eq("user_id", userId);

        if (badgeError) throw badgeError;

        const existingBadgeNames = existingBadges.map(b => b.badge_name);

        // 5. Filter out badges that were already assigned
        const newBadges = earnedBadges.filter(b => !existingBadgeNames.includes(b));

        // 6. Insert new badges
        if (newBadges.length > 0) {
          const { error: insertError } = await supabase
            .from("user_badges")
            .insert(newBadges.map(badge => ({ user_id: userId, badge_name: badge })));

          if (insertError) throw insertError;
        }

        // 7. Update state with all badges
        setBadges([...existingBadgeNames, ...newBadges]);
      } catch (err) {
        console.error("Badge assignment error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    assignBadges();
  }, [userId]);

  return { badges, loading, error };
}

export default useBadgeAssignment;
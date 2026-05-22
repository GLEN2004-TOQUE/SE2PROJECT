const SEEN_PREFIX = "tutorial_seen_";

export function tutorialSeenKey(userId, role) {
  return `${SEEN_PREFIX}${role}_${userId}`;
}

export function hasSeenTutorial(userId, role) {
  if (!userId || !role) return true;
  try {
    return localStorage.getItem(tutorialSeenKey(userId, role)) === "1";
  } catch {
    return true;
  }
}

export function markTutorialSeen(userId, role) {
  if (!userId || !role) return;
  try {
    localStorage.setItem(tutorialSeenKey(userId, role), "1");
  } catch {
    /* ignore quota / private mode */
  }
}

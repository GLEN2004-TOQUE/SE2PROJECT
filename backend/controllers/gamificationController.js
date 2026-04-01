const gamificationService = require('../services/gamificationServices');

// Controller for gamification-related routes

const getLeaderboard = async (req, res) => {
	try {
		const leaderboard = await gamificationService.getLeaderboard();
		return res.status(200).json(leaderboard);
	} catch (error) {
		console.error('Error getting leaderboard:', error);
		return res.status(500).json({ error: 'Failed to fetch leaderboard' });
	}
};

const getBadges = async (req, res) => {
	try {
		const badges = await gamificationService.getBadges();
		return res.status(200).json(badges);
	} catch (error) {
		console.error('Error getting badges:', error);
		return res.status(500).json({ error: 'Failed to fetch badges' });
	}
};

const getUserBadges = async (req, res) => {
	const { userId } = req.params;
	try {
		const badges = await gamificationService.getUserBadges(userId);
		return res.status(200).json(badges);
	} catch (error) {
		console.error(`Error getting badges for user ${userId}:`, error);
		return res.status(500).json({ error: 'Failed to fetch user badges' });
	}
};

const awardBadge = async (req, res) => {
	const { userId, badgeId } = req.body;
	if (!userId || !badgeId) {
		return res.status(400).json({ error: 'userId and badgeId are required' });
	}
	try {
		const result = await gamificationService.awardBadge(userId, badgeId);
		return res.status(200).json(result);
	} catch (error) {
		console.error(`Error awarding badge ${badgeId} to user ${userId}:`, error);
		return res.status(500).json({ error: 'Failed to award badge' });
	}
};

module.exports = {
	getLeaderboard,
	getBadges,
	getUserBadges,
	awardBadge,
};
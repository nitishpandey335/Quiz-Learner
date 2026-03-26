const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, updateUser, getPlatformAnalytics, createUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/', getAllUsers);
router.get('/analytics', getPlatformAnalytics);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

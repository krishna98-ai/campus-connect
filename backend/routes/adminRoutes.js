const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboard, getUsers, toggleUserActive, deleteUser, getReportedContent, changeUserRole } = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', changeUserRole);
router.get('/reported', getReportedContent);

module.exports = router;

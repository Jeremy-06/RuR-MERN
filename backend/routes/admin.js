const express = require('express');
const { createUser, listUsers, updateUser, deleteUser } = require('../controllers/admin');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);
router.post('/users', createUser);
router.get('/users', listUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;

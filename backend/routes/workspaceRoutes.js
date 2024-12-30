const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken'); // Middleware to authenticate user
const { inviteUser, switchWorkspace } = require('../controllers/workspaceController');

// Route to invite a user
router.post('/workspace/invite', verifyToken, inviteUser);
router.post('/workspace/switch', verifyToken, switchWorkspace);

module.exports = router;

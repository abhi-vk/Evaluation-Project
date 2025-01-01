const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const { inviteUser, switchWorkspace, generateInviteLink, handleWorkspaceJoin } = require('../controllers/workspaceController');

// Route to generate the invite link
router.get('/workspace/invite-link', verifyToken, generateInviteLink);

// Route to handle the user joining a workspace via the invite link
router.post('/workspace/join/:workspaceId', verifyToken, handleWorkspaceJoin);

// Route to invite a user to the workspace via email
router.post('/workspace/invite', verifyToken, inviteUser);

// Route to switch between workspaces
router.post('/workspace/switch', verifyToken, switchWorkspace);

module.exports = router;

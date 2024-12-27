const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = mongoose.Types;
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const inviteUser = async (req, res, next) => {
    try {
        const { inviteeEmail, permission } = req.body; // Frontend sends only email and permission
        const workspaceId = req.activeWorkspaceId; // Dynamically set by verifyToken middleware
        const userId = req.user; // Extract user ID from the token

        if (!workspaceId) {
            throw Object.assign(Error("Workspace ID is required."), { code: 400 });
        }

        // Fetch workspace and ensure the current user is the owner
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw Object.assign(Error("Workspace not found."), { code: 404 });
        }
        if (workspace.owner.toString() !== userId.toString()) {
            throw Object.assign(Error("You do not have permission to invite users to this workspace."), { code: 403 });
        }

        // Fetch the invitee user by email
        const invitee = await User.findOne({ email: inviteeEmail });
        if (!invitee) {
            throw Object.assign(Error("The invited user does not exist."), { code: 404 });
        }

        // Check permission value
        if (!['view', 'edit'].includes(permission)) {
            throw Object.assign(Error("Invalid permission value. Must be 'view' or 'edit'."), { code: 400 });
        }

        // Check if the invitee is already a member
        const existingMember = workspace.members.find(member => member.userId.toString() === invitee._id.toString());
        if (existingMember) {
            // Update permission if already a member
            existingMember.permission = permission;
        } else {
            // Add new member
            workspace.members.push({ userId: invitee._id, permission });
        }

        await workspace.save();

        // Update invitee's user collection with the workspaceId if not already added
        if (!invitee.workspaces.includes(workspaceId)) {
            invitee.workspaces.push(workspaceId);
            await invitee.save();
        }

        // Send response
        res.status(200).json({
            status: "success",
            msg: `User ${inviteeEmail} has been successfully invited with ${permission} permission.`,
            workspaceId,
        });
    } catch (err) {
        next(err);
    }
};


const switchWorkspace = async (req, res, next) => {
    try {
        const { workspaceId } = req.body; // Frontend sends workspaceId in request body
        const userId = req.user; // Extract user ID from the verified token

        if (!workspaceId) {
            throw Object.assign(Error("Workspace ID is required."), { code: 400 });
        }

        // Verify the workspace exists and the user is a member
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw Object.assign(Error("Workspace not found."), { code: 404 });
        }

        const isMember = workspace.members.some(member => member.userId.toString() === userId.toString());
        if (!isMember && workspace.owner.toString() !== userId.toString()) {
            throw Object.assign(Error("You do not have access to this workspace."), { code: 403 });
        }

        // Generate a new token with the updated activeWorkspaceId
        const newToken = jwt.sign(
            { uid: userId, activeWorkspaceId: workspaceId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Set an appropriate expiration time
        );

        // Send response with the new token and workspace details
        res.status(200).json({
            status: "success",
            msg: `Switched to workspace ${workspace.name} successfully.`,
            token: newToken,
            workspace: {
                id: workspace._id,
                name: workspace.name,
                permission: workspace.owner.toString() === userId.toString() ? 'owner' : workspace.members.find(member => member.userId.toString() === userId.toString()).permission,
            },
        });
    } catch (err) {
        next(err);
    }
};
module.exports = { inviteUser,switchWorkspace };
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = mongoose.Types;
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const inviteUser = async (req, res, next) => {
    try {
        const { inviteeEmail, permission } = req.body; // Frontend sends only email and permission
        const workspaceId = req.headers['workspace-id']; // Extract workspaceId from request headers
        const userId = req.user; // ID of the user sending the invite

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

        // Update invitee's user collection with the workspaceId if not already added
        if (!invitee.workspaces.includes(workspaceId)) {
            invitee.workspaces.push(workspaceId);
            await invitee.save();
        }

        // Update workspace members array with the invitee's userId if not already added
        if (!workspace.members.includes(invitee._id)) {
            workspace.members.push(invitee._id);
            await workspace.save();
        }

        // Send response
        res.status(200).json({
            status: "success",
            msg: `User ${inviteeEmail} has been successfully invited.`,
            workspaceId,
            permission,
        });
    } catch (err) {
        next(err);
    }
};

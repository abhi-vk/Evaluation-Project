const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = mongoose.Types;
require('dotenv').config();
const User = require('../models/User');
const Workspace = require('../models/Workspace');

const generateInviteLink = async (req, res, next) => {
    try {
        const workspaceId = req.activeWorkspaceId;
        const userId = req.user;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw Object.assign(Error("Workspace not found."), { code: 404 });
        }

        if (workspace.owner.toString() !== userId.toString()) {
            throw Object.assign(Error("You do not have permission to generate an invite link."), { code: 403 });
        }

        const inviteLink = `${process.env.FRONTEND_URL}/join-workspace/${workspaceId}`;

        res.status(200).json({
            status: "success",
            msg: "Invite link generated successfully.",
            inviteLink,
        });
    } catch (err) {
        next(err);
    }
};

const handleWorkspaceJoin = async (req, res, next) => {
    try {
        const { workspaceId } = req.params;
        const userId = req.user;

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw Object.assign(Error("Workspace not found."), { code: 404 });
        }

        if (!userId) {
            throw Object.assign(Error("You must be logged in to join a workspace."), { code: 401 });
        }

        const existingMember = workspace.members.find(member => String(member.userId) === String(userId));
        if (existingMember) {
            return res.status(200).json({
                status: "success",
                msg: `You are already a member of workspace: ${workspace.name}.`,
            });
        }

        workspace.members.push({ userId, permission: 'view' });
        workspace.members = [...new Map(workspace.members.map(member => [String(member.userId), member])).values()];
        await workspace.save();

        const user = await User.findById(userId);
        if (!user.workspaces.includes(String(workspaceId))) {
            user.workspaces.push(workspaceId);
            user.workspaces = [...new Set(user.workspaces.map(String))];
            await user.save();
        }

        res.status(200).json({
            status: "success",
            msg: `Successfully joined workspace: ${workspace.name}.`,
            workspace,
        });
    } catch (err) {
        next(err);
    }
};

const inviteUser = async (req, res, next) => {
    try {
        const { inviteeEmail, permission } = req.body;
        const workspaceId = req.activeWorkspaceId;
        const userId = req.user;

        if (!workspaceId) {
            throw Object.assign(Error("Workspace ID is required."), { code: 400 });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw Object.assign(Error("Workspace not found."), { code: 404 });
        }
        if (workspace.owner.toString() !== userId.toString()) {
            throw Object.assign(Error("You do not have permission to invite users to this workspace."), { code: 403 });
        }

        const invitee = await User.findOne({ email: inviteeEmail });
        if (!invitee) {
            throw Object.assign(Error("The invited user does not exist."), { code: 404 });
        }

        if (!['view', 'edit'].includes(permission)) {
            throw Object.assign(Error("Invalid permission value. Must be 'view' or 'edit'."), { code: 400 });
        }

        const existingMember = workspace.members.find(member => member.userId.toString() === invitee._id.toString());
        if (existingMember) {
            existingMember.permission = permission;
        } else {
            workspace.members.push({ userId: invitee._id, permission });
        }

        await workspace.save();

        if (!invitee.workspaces.includes(workspaceId)) {
            invitee.workspaces.push(workspaceId);
            await invitee.save();
        }

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
        const { workspaceId } = req.body;
        const userId = req.user;

        if (!workspaceId) {
            throw Object.assign(Error("Workspace ID is required."), { code: 400 });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            throw Object.assign(Error("Workspace not found."), { code: 404 });
        }

        const isMember = workspace.members.some(member => member.userId.toString() === userId.toString());
        if (!isMember && workspace.owner.toString() !== userId.toString()) {
            throw Object.assign(Error("You do not have access to this workspace."), { code: 403 });
        }

        const newToken = jwt.sign(
            { uid: userId, activeWorkspaceId: workspaceId },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

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

module.exports = { inviteUser, switchWorkspace, generateInviteLink, handleWorkspaceJoin };

const Folder = require('../models/Folder');
const Form = require('../models/Form');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Validate Folder Data
const validateFolderData = async (folderId, workspaceId) => {
    if (!ObjectId.isValid(folderId)) {
        throw Object.assign(Error("This is not a valid folder, please check your URL"), { code: 400 });
    }

    const folderdata = await Folder.findOne({ _id: folderId, workspaceId });
    if (!folderdata) {
        throw Object.assign(Error("This is not a valid folder or it does not belong to the workspace."), { code: 404 });
    }

    return folderdata;
};

// Create Folder
const createFolder = async (req, res, next) => {
    try {
        const { folderName } = req.body;
        const workspaceId = req.activeWorkspaceId;

        if (!folderName) throw Object.assign(Error("Please enter folder name."), { code: 400 });
        if (!workspaceId) throw Object.assign(Error("Workspace ID is required."), { code: 400 });

        // Validate Workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw Object.assign(Error("Workspace not found."), { code: 404 });

        // Create Folder
        const newFolder = await Folder.create({ folderName, workspaceId });

        // Update Workspace with new Folder
        workspace.folders.push(newFolder._id);
        await workspace.save();

        res.status(200).json({ status: "success", msg: "Folder created successfully.", folderId: newFolder._id });
    } catch (err) {
        next(err);
    }
};

// Fetch All Folders for a Workspace
const fetchAllFolder = async (req, res, next) => {
    try {
        const workspaceId = req.activeWorkspaceId;
        if (!workspaceId) throw Object.assign(Error("Workspace ID is required."), { code: 400 });

        const folderdata = await Folder.find({ workspaceId });
        res.status(200).json({ status: "success", data: folderdata });
    } catch (err) {
        next(err);
    }
};

// Fetch All Forms by Folder
const fetchAllFormByFolder = async (req, res, next) => {
    const { folderId } = req.params;
    try {
        const workspaceId = req.activeWorkspaceId;
        if (!workspaceId) throw Object.assign(Error("Workspace ID is required."), { code: 400 });

        await validateFolderData(folderId, workspaceId);

        const formdata = await Form.find({ folderId, workspaceId });
        res.status(200).json({ status: "success", data: formdata });
    } catch (err) {
        next(err);
    }
};

// Delete Folder
const deleteFolder = async (req, res, next) => {
    const { folderId } = req.params;
    try {
        const workspaceId = req.activeWorkspaceId;
        if (!workspaceId) throw Object.assign(Error("Workspace ID is required."), { code: 400 });

        const folder = await validateFolderData(folderId, workspaceId);

        // Delete Folder
        await Folder.findByIdAndDelete(folderId);

        // Delete Forms in the Folder
        await Form.deleteMany({ folderId });

        // Remove Folder from Workspace
        await Workspace.findByIdAndUpdate(workspaceId, { $pull: { folders: folderId } });

        res.status(200).json({ status: "success", msg: "Folder deleted successfully." });
    } catch (err) {
        next(err);
    }
};

module.exports = { fetchAllFolder, fetchAllFormByFolder, createFolder, deleteFolder };

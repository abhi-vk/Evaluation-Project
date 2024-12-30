const Form = require('../models/Form');
const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// Utility function to validate form data
const validateFormData = async (formId) => {
    if (!ObjectId.isValid(formId)) {
        throw Object.assign(Error("This form is not valid, please check your URL"), { code: 400 });
    }

    const formdata = await Form.findById(formId);
    if (!formdata) {
        throw Object.assign(Error("This form is not valid, please check your URL."), { code: 404 });
    }

    return formdata;
};

// Check if User Has Edit Permissions
const hasEditPermissions = (workspace, userId) => {
    const member = workspace.members.find(member => member.userId.toString() === userId.toString());
    return member && (member.permission === 'edit' || workspace.owner.toString() === userId.toString());
};

// Create a new form and update the workspace
const createForm = async (req, res, next) => {
    try {
        const { folderId, formName } = req.body;
        const workspaceId = req.activeWorkspaceId;
        const userId = req.user; // Extracted from JWT token

        if (!workspaceId) throw Object.assign(Error("Workspace ID is required."), { code: 400 });
        if (!ObjectId.isValid(workspaceId)) throw Object.assign(Error("Invalid Workspace ID."), { code: 400 });

        // Validate input
        if (!formName) throw Object.assign(Error("Please enter a form name."), { code: 400 });

        // Validate Workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw Object.assign(Error("Workspace not found."), { code: 404 });

        // Check User Permission
        if (!hasEditPermissions(workspace, userId)) {
            throw Object.assign(Error("You do not have permission to create forms."), { code: 403 });
        }

        // Create the form
        const newForm = await Form.create({ workspaceId, folderId, formName, formTheme: "#ffffff" });

        // Update the workspace's forms array
        await Workspace.findByIdAndUpdate(
            workspaceId,
            { $push: { forms: newForm._id } },
            { new: true }
        );

        res.status(200).json({
            status: "success",
            formId: newForm._id,
            msg: "Form created successfully and added to the workspace.",
        });
    } catch (err) {
        next(err);
    }
};

// Fetch all forms for a workspace
const fetchAllForm = async (req, res, next) => {
    try {
        const workspaceId = req.activeWorkspaceId;
        if (!workspaceId) throw Object.assign(Error("Workspace ID is required."), { code: 400 });
        if (!ObjectId.isValid(workspaceId)) throw Object.assign(Error("Invalid Workspace ID."), { code: 400 });

        const forms = await Form.find({ workspaceId });
        res.status(200).json({ status: "success", data: forms });
    } catch (err) {
        next(err);
    }
};

// Fetch a form by ID
const fetchFormById = async (req, res, next) => {
    const { formId } = req.params;
    try {
        const formdata = await validateFormData(formId);
        res.status(200).json({ status: "success", data: formdata });
    } catch (err) {
        next(err);
    }
};

// Update a form
const updateForm = async (req, res, next) => {
    const { formId } = req.params;
    try {
        await validateFormData(formId);

        const { formName, formTheme, formSequence } = req.body;

        const workspaceId = req.activeWorkspaceId;
        const userId = req.user; // Extracted from JWT token

        // Validate Workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw Object.assign(Error("Workspace not found."), { code: 404 });

        // Check User Permission
        if (!hasEditPermissions(workspace, userId)) {
            throw Object.assign(Error("You do not have permission to update forms."), { code: 403 });
        }

        await Form.findByIdAndUpdate(formId, { formName, formTheme, formSequence });
        res.status(200).json({ status: "success", msg: "Form updated successfully." });
    } catch (err) {
        next(err);
    }
};

// Delete a form
const deleteForm = async (req, res, next) => {
    const { formId } = req.params;
    try {
        const formdata = await validateFormData(formId);

        const workspaceId = formdata.workspaceId;
        if (!workspaceId) throw Object.assign(Error("Workspace ID is required for deletion."), { code: 400 });

        // Validate Workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) throw Object.assign(Error("Workspace not found."), { code: 404 });

        const userId = req.user; // Extracted from JWT token

        // Check User Permission
        if (!hasEditPermissions(workspace, userId)) {
            throw Object.assign(Error("You do not have permission to delete forms."), { code: 403 });
        }

        // Remove the form from the workspace's forms array
        await Workspace.findByIdAndUpdate(
            workspaceId,
            { $pull: { forms: formId } },
            { new: true }
        );

        await Form.findByIdAndDelete(formId);
        res.status(200).json({ status: "success", msg: "Form deleted successfully." });
    } catch (err) {
        next(err);
    }
};

// Share a form
const shareForm = async (req, res, next) => {
    const { formId } = req.params;
    try {
        const formdata = await validateFormData(formId);
        res.status(200).json({ status: "success", data: formdata });
    } catch (err) {
        next(err);
    }
};

// Count form hits
const countFormHit = async (req, res, next) => {
    const { formId } = req.params;
    try {
        const formdata = await validateFormData(formId);
        const formHits = formdata.formHits + 1;
        await Form.findByIdAndUpdate(formId, { formHits });
        res.status(200).json({ status: "success", msg: "Hit count: " + formHits });
    } catch (err) {
        next(err);
    }
};

// Save form responses
const saveFormResponse = async (req, res, next) => {
    const { formId } = req.params;
    try {
        const formdata = await validateFormData(formId);
        const formResponse = req.body;

        const index = formdata.formResponse.findIndex(
            response => response.vid === formResponse.vid
        );

        if (index !== -1) {
            formdata.formResponse[index] = formResponse;
        } else {
            formdata.formResponse.push(formResponse);
        }
        await formdata.save();

        res.status(200).json({ status: "success", data: formdata });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    fetchAllForm,
    fetchFormById,
    createForm,
    updateForm,
    deleteForm,
    shareForm,
    countFormHit,
    saveFormResponse,
};

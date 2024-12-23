const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    folderName: {
        type: String,
        required: true,
    },
    workspaceId: { 
        type: mongoose.ObjectId,
        ref: 'Workspace',
        required: true,
    },
});

module.exports = mongoose.model('Folder', folderSchema);

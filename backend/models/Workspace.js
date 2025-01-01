const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    owner: {
        type: mongoose.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            permission: { type: String, enum: ['view', 'edit'], default: 'view' },
        },
    ],
    folders: [
        {
            type: mongoose.ObjectId,
            ref: 'Folder',
        },
    ],
    forms: [
        {
            type: mongoose.ObjectId,
            ref: 'Form',
        },
    ],
});

module.exports = mongoose.model('Workspace', workspaceSchema);

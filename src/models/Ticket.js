const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    authorName: String,
    authorRole: {
        type: String,
        enum: ['MANAGER', 'SUPPORT', 'USER']
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const statusLogSchema = new mongoose.Schema({
    oldStatus: String,
    newStatus: String,
    changedBy: {
        name: String,
        role: String
    },
    changedAt: {
        type: Date,
        default: Date.now
    }
});

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    status: {
        type: String,
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    createdBy: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        role: String
    },
    assignedTo: {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        role: String
    },
    comments: [commentSchema],
    statusLogs: [statusLogSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);

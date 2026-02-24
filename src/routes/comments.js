const express = require('express');
const Ticket = require('../models/Ticket');
const { authenticate } = require('../middleware/auth');
const { validateComment } = require('../middleware/validate');
const router = express.Router();

// helper function to check if a user can access a ticket's comments
function canAccessTicket(ticket, user) {
    // managers can access any ticket
    if (user.role === 'MANAGER') return true;

    // support can access if they are assigned
    if (user.role === 'SUPPORT' && ticket.assignedTo &&
        ticket.assignedTo._id && ticket.assignedTo._id.toString() === user._id.toString()) {
        return true;
    }

    // user can access if they created it
    if (user.role === 'USER' && ticket.createdBy._id.toString() === user._id.toString()) {
        return true;
    }

    return false;
}

// @route   POST /tickets/:id/comments
// @desc    Add a comment to ticket
router.post('/tickets/:id/comments', authenticate, validateComment, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (!canAccessTicket(ticket, req.user)) {
            return res.status(403).json({ message: 'Not authorized to comment on this ticket' });
        }

        const newComment = {
            authorName: req.user.name,
            authorRole: req.user.role,
            authorId: req.user._id,
            comment: req.body.comment.trim()
        };

        ticket.comments.push(newComment);
        await ticket.save();

        // send back the comment that was just added
        const added = ticket.comments[ticket.comments.length - 1];
        res.status(201).json(added);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /tickets/:id/comments
// @desc    Get all comments for a ticket
router.get('/tickets/:id/comments', authenticate, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        if (!canAccessTicket(ticket, req.user)) {
            return res.status(403).json({ message: 'Not authorized to view comments on this ticket' });
        }

        res.json(ticket.comments);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /comments/:id
// @desc    Edit a comment
router.patch('/comments/:id', authenticate, validateComment, async (req, res) => {
    try {
        // find the ticket that has this comment
        const ticket = await Ticket.findOne({ 'comments._id': req.params.id });
        if (!ticket) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = ticket.comments.id(req.params.id);

        // only the author or a manager can edit
        if (req.user.role !== 'MANAGER' && comment.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this comment' });
        }

        comment.comment = req.body.comment.trim();
        await ticket.save();

        res.json(comment);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Comment not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /comments/:id
// @desc    Delete a comment
router.delete('/comments/:id', authenticate, async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ 'comments._id': req.params.id });
        if (!ticket) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const comment = ticket.comments.id(req.params.id);

        // only author or manager can delete
        if (req.user.role !== 'MANAGER' && comment.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        ticket.comments.pull({ _id: req.params.id });
        await ticket.save();

        res.status(204).send();
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Comment not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

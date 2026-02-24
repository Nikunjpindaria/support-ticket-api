const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateCreateTicket, validateStatusUpdate, STATUS_TRANSITIONS } = require('../middleware/validate');
const router = express.Router();

// @route   POST /tickets
// @desc    Create a new ticket
router.post('/', authenticate, authorize('USER', 'MANAGER'), validateCreateTicket, async (req, res) => {
    try {
        const { title, description, priority } = req.body;

        const ticket = new Ticket({
            title: title.trim(),
            description: description.trim(),
            priority: priority || 'MEDIUM',
            createdBy: {
                _id: req.user._id,
                name: req.user.name,
                role: req.user.role
            }
        });

        const savedTicket = await ticket.save();
        res.status(201).json(savedTicket);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /tickets
// @desc    Get tickets based on role
router.get('/', authenticate, async (req, res) => {
    try {
        let filter = {};

        switch (req.user.role) {
            case 'MANAGER':
                // managers can see everything
                filter = {};
                break;
            case 'SUPPORT':
                // support can only see tickets assigned to them
                filter = { 'assignedTo._id': req.user._id };
                break;
            case 'USER':
                // users can only see their own tickets
                filter = { 'createdBy._id': req.user._id };
                break;
            default:
                return res.status(403).json({ message: 'Unknown role' });
        }

        const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /tickets/:id/assign
// @desc    Assign a ticket to someone
router.patch('/:id/assign', authenticate, authorize('MANAGER', 'SUPPORT'), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }

        // find the user we want to assign
        const assignee = await User.findById(userId);
        if (!assignee) {
            return res.status(404).json({ message: 'Assignee user not found' });
        }

        // cant assign to regular users
        if (assignee.role === 'USER') {
            return res.status(400).json({ message: 'Cannot assign tickets to users with USER role' });
        }

        ticket.assignedTo = {
            _id: assignee._id,
            name: assignee.name,
            role: assignee.role
        };

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /tickets/:id/status
// @desc    Update ticket status
router.patch('/:id/status', authenticate, authorize('MANAGER', 'SUPPORT'), validateStatusUpdate, async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const newStatus = req.body.status;
        const currentStatus = ticket.status;

        // check if transition is valid
        // only forward transitions allowed: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED
        const allowedNext = STATUS_TRANSITIONS[currentStatus];
        if (newStatus !== allowedNext) {
            return res.status(400).json({
                message: `Cannot change status from ${currentStatus} to ${newStatus}. Next allowed status: ${allowedNext || 'none'}`
            });
        }

        // add to status log
        ticket.statusLogs.push({
            oldStatus: currentStatus,
            newStatus: newStatus,
            changedBy: {
                name: req.user.name,
                role: req.user.role
            }
        });

        ticket.status = newStatus;
        await ticket.save();

        res.json(ticket);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /tickets/:id
// @desc    Delete a ticket (manager only)
router.delete('/:id', authenticate, authorize('MANAGER'), async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        await Ticket.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

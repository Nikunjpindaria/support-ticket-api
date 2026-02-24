// valid values
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const ROLES = ['MANAGER', 'SUPPORT', 'USER'];

// allowed transitions (forward only)
const STATUS_TRANSITIONS = {
    'OPEN': 'IN_PROGRESS',
    'IN_PROGRESS': 'RESOLVED',
    'RESOLVED': 'CLOSED'
    // CLOSED -> nothing (cant change after closing)
};

// validate ticket creation
const validateCreateTicket = (req, res, next) => {
    const { title, description, priority } = req.body;
    let errors = [];

    if (!title || title.trim().length < 5) {
        errors.push('Title must be at least 5 characters long');
    }
    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
    }
    if (priority && !PRIORITIES.includes(priority)) {
        errors.push('Priority must be LOW, MEDIUM or HIGH');
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }
    next();
};

// validate status
const validateStatusUpdate = (req, res, next) => {
    const { status } = req.body;
    if (!status || !STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
    }
    next();
};

// validate comment
const validateComment = (req, res, next) => {
    if (!req.body.comment || req.body.comment.trim() === '') {
        return res.status(400).json({ message: 'Comment cannot be empty' });
    }
    next();
};

// validate user creation
const validateCreateUser = (req, res, next) => {
    const { name, email, password, role } = req.body;
    let errors = [];

    if (!name || name.trim() === '') errors.push('Name is required');
    if (!email || !email.includes('@')) errors.push('Please provide a valid email');
    if (!password || password.length < 4) errors.push('Password must be at least 4 characters');
    if (!role || !ROLES.includes(role)) errors.push('Role must be MANAGER, SUPPORT or USER');

    if (errors.length > 0) {
        return res.status(400).json({ message: errors.join(', ') });
    }
    next();
};

module.exports = {
    validateCreateTicket,
    validateStatusUpdate,
    validateComment,
    validateCreateUser,
    STATUS_TRANSITIONS,
    STATUSES,
    PRIORITIES
};

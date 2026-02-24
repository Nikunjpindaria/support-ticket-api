const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

// import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const commentRoutes = require('./routes/comments');

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// api routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/', commentRoutes);

// base route
app.get('/', (req, res) => {
    res.json({
        message: 'Support Ticket Management API',
        documentation: '/docs'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;

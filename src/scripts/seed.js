require('dotenv').config();
const { connectDB } = require('../config/db');
const User = require('../models/User');

// seed default manager account
const seedDB = async () => {
    await connectDB();

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
        console.log('Admin user already exists, skipping seed');
        process.exit(0);
    }

    // password will be hashed by the pre-save hook
    const admin = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'MANAGER'
    });

    console.log('Created admin user:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Password: admin123`);
    console.log(`  Role: ${admin.role}`);
    process.exit(0);
};

seedDB().catch(err => {
    console.error(err);
    process.exit(1);
});

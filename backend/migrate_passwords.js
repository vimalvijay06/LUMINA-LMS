const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB...');

        const users = await User.find({});
        console.log(`Found ${users.length} users to check...`);

        for (let user of users) {
             // Basic check: if it doesn't start with $argon2 or $2a (bcrypt), it's likely plain text
             if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
                 console.log(`Hashing password for: ${user.email}`);
                 const salt = await bcrypt.genSalt(10);
                 user.password = await bcrypt.hash(user.password, salt);
                 await user.save();
             }
        }

        console.log('✅ Migration complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
};

migrate();

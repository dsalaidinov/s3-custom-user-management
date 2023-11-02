import User from './models/user';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.development.env' });
} else {
  dotenv.config({ path: '.production.env' });
}

export async function initializeAdmin() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, saltRounds);

      const newAdmin = new User({
        username: process.env.ADMIN_USERNAME,
        password: hashedPassword,
        role: 'admin',
      });
      await newAdmin.save();
      console.log('Admin created');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

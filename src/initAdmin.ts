import User from './models/user';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.development.env' });
} else {
  dotenv.config({ path: '.production.env' });
}

export async function initializeAdmin() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      const newAdmin = new User({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin',
      });
      await newAdmin.save();
      console.log('Admin created');
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

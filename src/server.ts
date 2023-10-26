import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.development.env' });
} else {
  dotenv.config({ path: '.production.env' });
}

import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';

import resourceRoutes from './routes/resource.routes';
import auth from './routes/auth';
import s3SystemRoutes from './routes/s3system.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  credentials: true
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// Set Mongoose options
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);
// mongoose.set('useCreateIndex', true);

app.use('/auth', auth);
app.use('/resources', resourceRoutes);
app.use('/s3Systems', s3SystemRoutes);


// Connect to MongoDB
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

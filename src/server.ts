import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

import resourceRoutes from './routes/resource.routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Set Mongoose options
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);
// mongoose.set('useCreateIndex', true);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/usermanagement')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

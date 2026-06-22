import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import connectDB from './config/db.js';
import apiRoutes from './routes/api.routes.js';
import { initCronJobs } from './cron/reminders.cron.js';
import { initSocket } from './socket.js';

// Load env vars
dotenv.config();

// Connect to database
await connectDB();

// Init Cron Jobs
initCronJobs();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Set security headers
app.use(helmet());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api', apiRoutes);

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Root route
app.get('/', (req, res) => {
  res.send('InternPulse API is running...');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
    🚀 InternPulse Server Running
    📡 Port: ${PORT}
    🌍 Mode: ${process.env.NODE_ENV}
  `);
});

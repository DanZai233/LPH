import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import systemRoutes from './routes/system';
import packageRoutes from './routes/packages';
import aliasRoutes from './routes/aliases';
import aiRoutes from './routes/ai';
import configRoutes from './routes/config';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3888;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3777',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/system', systemRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/aliases', aliasRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 LPH Backend server running on port ${PORT}`);
});


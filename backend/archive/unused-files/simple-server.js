const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple API endpoint
app.get('/api/auth/check-db', (req, res) => {
  res.status(200).json({
    status: 'OK',
    database: 'connected'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'Fixia Backend funcionando!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Fixia Backend funcionando en puerto ${PORT}`);
});
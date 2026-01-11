import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'responses.json');

app.use(cors());
app.use(express.json());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Initialize DB file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Get all responses
app.get('/api/responses', (req, res) => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Submit a response
app.post('/api/submit', (req, res) => {
  try {
    const newResponse = req.body;
    let data = [];
    try {
        data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
        // if file is empty or invalid, start fresh
        data = [];
    }
    
    // Ensure uniqueness by ID
    const exists = data.find((r) => r.id === newResponse.id);
    if (!exists) {
      data.push(newResponse);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Admin Login (Simple hardcoded check)
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'admin123') {
    res.json({ success: true, token: 'admin-token-xyz' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Handle React routing, return all requests to React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

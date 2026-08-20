const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Main entry point for the frontend to hit
app.get('/api/health', (req, res) => {
    res.json({ status: 'API Gateway is running safely!' });
});

// We will route AI requests to the Python service here eventually
app.post('/api/roadmap', (req, res) => {
    // In a full environment, this makes an HTTP request to the python-service (Port 5000)
    res.json({ message: "Request received by API Gateway. Ready to forward to Python AI Service." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});

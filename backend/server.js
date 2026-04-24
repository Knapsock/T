const express = require('express');
const cors = require('cors');
const { processEdges } = require('./processor');

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL : '*',
    methods: ['GET', 'POST']
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/bfhl', (req, res) => {
    try {
        const data = req.body?.data;
        if (!Array.isArray(data)) {
            return res.status(400).json({ error: "Invalid payload format. 'data' must be an array." });
        }

        const result = processEdges(data);
        res.status(200).json(result);
    } catch (error) {
        console.error("Processing error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});

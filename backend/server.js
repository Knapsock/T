const express = require('express');
const cors = require('cors');
const { processEdges } = require('./processor');

const app = express();
app.use(cors());
app.use(express.json());

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

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const jsonServer = require('json-server');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Proxy Route for MyFigureCollection Search
app.get('/api/figures/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Search query "q" is required' });
        }

        const url = `https://myfigurecollection.net/api.php?mode=search&root=0&name=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        const parser = new XMLParser();
        const jsonObj = parser.parse(response.data);

        if (!jsonObj.root || !jsonObj.root.item) {
            return res.json([]);
        }

        // Handle single vs multiple items from fast-xml-parser
        const items = Array.isArray(jsonObj.root.item) ? jsonObj.root.item : [jsonObj.root.item];

        const extracted = items.slice(0, 5).map(item => {
            const id = item.id || Math.random().toString();
            return {
                id: id.toString(),
                title: item.name || 'Figure Desconhecida',
                image: item.picture || `https://static.myfigurecollection.net/pics/figure/big/${id}.jpg`,
                company: item.manufacturer || 'Desconhecido',
                subtitle: `Fabricante: ${item.manufacturer || 'Desconhecido'}`
            };
        });

        res.json(extracted);
    } catch (error) {
        console.error('Error fetching from MyFigureCollection:', error.message);
        res.status(500).json({ error: 'Failed to fetch the figures from external API' });
    }
});

// JSON Server setup
const router = jsonServer.router('db.json');
app.use('/items', router);

app.listen(port, () => {
    console.log(`Express Backend proxy+DB running at http://localhost:${port}`);
});

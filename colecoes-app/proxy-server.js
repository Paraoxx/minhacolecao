import express from 'express';
import cors from 'cors';
import { XMLParser } from 'fast-xml-parser';

const app = express();
app.use(cors());

app.get('/api/figures/search', async (req, res) => {
    try {
        const { q } = req.query;
        const response = await fetch(`https://myfigurecollection.net/api.php?mode=search&root=0&name=${encodeURIComponent(q)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/xml, application/xml, */*'
            }
        });

        if (!response.ok) throw new Error(`Bloqueado pelo servidor (Status ${response.status})`);
        const xmlData = await response.text();

        if (xmlData.includes('cloudflare') || xmlData.includes('Just a moment')) {
            throw new Error("Bloqueio de segurança do MyFigureCollection detectado.");
        }

        const parser = new XMLParser();
        const jsonObj = parser.parse(xmlData);

        // Extração segura dependendo do formato do XML do MFC
        let items = [];
        if (jsonObj.root && jsonObj.root.item) {
            items = Array.isArray(jsonObj.root.item) ? jsonObj.root.item : [jsonObj.root.item];
        }

        const formattedItems = items.slice(0, 5).map(item => ({
            id: item.id,
            title: item.name,
            company: item.manufacturer || 'Desconhecido',
            image: `https://static.myfigurecollection.net/pics/figure/big/${item.id}.jpg`
        }));

        res.json(formattedItems);
    } catch (error) {
        console.error("Erro no proxy:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => console.log('Proxy do MFC rodando na porta 3001!'));

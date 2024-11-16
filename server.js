import express from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/api/openai', async (req, res) => {
    const { detail, query } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key is not configured.' });
    }
    const prompt = `Aqui estão algumas informações internas:\n${detail}\n\nPergunta do usuário: "${query}"\nBaseando-se na seguinte informação: "${detail}", responda de forma natural e amigável ao usuário.`;

    console.log(req.body);
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'Você é um assistente útil.' },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 100,
                temperature: 0.5
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed: ${errorText}`);
        }

        const responseData = await response.json();
        res.json({ answer: responseData.choices[0].message.content.trim() });
        console.log('Resposta da API:', responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

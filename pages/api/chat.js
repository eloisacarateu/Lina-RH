export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { detail, query } = req.body;

  const prompt = `Aqui estão algumas informações:\n${detail}\n\nPergunta: ${query}`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Você é um assistente útil.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();

    if (data.error) throw new Error(data.error.message);
    res.status(200).json({ answer: data.choices[0].message.content.trim() });

  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar a OpenAI' });
  }
}

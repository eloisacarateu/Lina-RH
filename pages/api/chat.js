export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { detail, query } = req.body;

  if (!detail || !query) {
    return res.status(400).json({ error: 'Detalhes ou consulta ausentes' });
  }

  const prompt = `Aqui estão algumas informações detalhadas sobre nossa empresa:\n${detail}\n\nCom base nessas informações, responda à seguinte pergunta de forma clara e objetiva: ${query}`;

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
        max_tokens: 300,  // Ajuste conforme necessário
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.status(200).json({ answer: data.choices[0].message.content.trim() });
    } else {
      res.status(500).json({ error: 'Erro ao processar a resposta da OpenAI' });
    }

  } catch (error) {
    console.error('Erro ao chamar a OpenAI:', error); // Log para depuração
    res.status(500).json({ error: 'Erro ao consultar a OpenAI, tente novamente mais tarde.' });
  }
}

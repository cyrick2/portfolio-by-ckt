export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userMessage } = req.body;

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat", // adjust if your model name differs
          messages: [
            {
              role: "system",
              content:
                "You are Cyrick AI, a friendly AI chatbot on a student portfolio.",
            },
            { role: "user", content: userMessage },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res
        .status(500)
        .json({ message: "Error from DeepSeek API", details: data });
    }

    const botReply = data.choices[0].message.content.trim();
    res.status(200).json({ botReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred with Cyrick AI." });
  }
};

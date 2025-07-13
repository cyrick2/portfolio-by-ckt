import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-R1-0528";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userMessage } = req.body;

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        model: model,
        messages: [
          {
            role: "system",
            content:
              "You are Cyrick AI, a friendly chatbot on a student portfolio.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
      },
    });

    if (isUnexpected(response)) {
      console.error(response.body.error);
      return res.status(500).json({
        message: "Error from Azure API",
        details: response.body.error,
      });
    }

    const botReply = response.body.choices[0].message.content.trim();
    res.status(200).json({ botReply });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred with Cyrick AI.",
      details: error.message,
    });
  }
};

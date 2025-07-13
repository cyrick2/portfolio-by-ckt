import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-R1-0528";

export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const { userMessage } = JSON.parse(event.body);

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content:
              "You are Cyrick AI, a friendly AI chatbot on a student portfolio.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 150,
        model: model,
      },
    });

    if (isUnexpected(response)) {
      console.error(response.body.error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error from Azure API",
          details: response.body.error,
        }),
      };
    }

    const botReply = response.body.choices[0].message.content.trim();
    return {
      statusCode: 200,
      body: JSON.stringify({ botReply }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "An error occurred with Cyrick AI.",
        details: error.message,
      }),
    };
  }
}

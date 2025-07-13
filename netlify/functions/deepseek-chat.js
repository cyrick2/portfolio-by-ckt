import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-R1-0528";

// Preload structured personal data Cyrick AI can reference
const CYRICK_PROFILE = `
Name: Cyrick Kyle B. Tapay
Location: Philippines
Field: BSIT (Bachelor of Science in Information Technology) Student
Skills: Web development, programming (HTML, CSS, JavaScript, C#), troubleshooting, UI/UX design
Interests: Exploring IT, building projects, learning new technologies
Portfolio Focus: Showcasing projects, skills, and certificates for internships or opportunities
`;

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
            content: `You are Cyrick AI, a friendly AI chatbot on a student portfolio website. 
You only answer questions related to Cyrick Kyle B. Tapay and his portfolio. 
If users ask about unrelated topics, politely tell them you can only answer portfolio-related questions.

Here is Cyrick's data for reference:
${CYRICK_PROFILE}
`,
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 300,
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

    // Clean bot reply to remove <think> traces if returned
    const rawReply = response.body.choices[0].message.content.trim();
    const botReply = rawReply.includes("</think>")
      ? rawReply.split("</think>")[1].trim()
      : rawReply;

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

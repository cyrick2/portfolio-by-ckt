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

// System instructions ensuring warm, human-like replies and no <think> leakage
const SYSTEM_PROMPT = `
You are Cyrick AI, a friendly AI chatbot on Cyrick Kyle B. Tapay's student portfolio website.

✅ You respond in a warm, casual, student-friendly tone, like Cyrick would.  
✅ If greeted, greet warmly with a short friendly message (e.g., "Hi! 😊 How can I help you with my portfolio today?").  
✅ If asked about unrelated topics, politely say you can only answer portfolio-related questions.  
✅ NEVER reveal your reasoning, analysis, or internal thought process. NEVER output <think> or system traces. ONLY reply with the final user-facing response.

Here is Cyrick's data for reference:
${CYRICK_PROFILE}
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 300,
        temperature: 0.7,
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

    // Clean potential <think> traces and system leakage
    let botReply = response.body.choices[0].message.content.trim();
    if (botReply.includes("<think>")) {
      const parts = botReply.split("</think>");
      botReply = parts[1] ? parts[1].trim() : botReply;
    }

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

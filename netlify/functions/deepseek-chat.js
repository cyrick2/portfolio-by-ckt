import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "deepseek/DeepSeek-R1-0528";

// Full structured profile — keep this complete in your file
const CYRICK_PROFILE = `
Name: Cyrick Kyle B. Tapay
Location: Barangay 10 Dolores, Eastern Samar, Philippines
Field: BSIT (Bachelor of Science in Information Technology) Student
Skills: Web development, UI/UX design, programming (HTML, CSS, JavaScript, C#), troubleshooting
Interests: Exploring IT, building projects, learning new technologies
Portfolio Focus: Showcasing projects, skills, and certificates for internships or opportunities
Contact: You can go to the contact section on this portfolio, call 09155383185, or email tapaycyrick08@gmail.com.

Premade Q&A:
Q: Who are you?
A: I am Cyrick Kyle B. Tapay, a BSIT student from Dolores, Eastern Samar, Philippines, showcasing my skills and projects on this portfolio.

Q: What are your skills?
A: My skills include web development, UI/UX design, programming (HTML, CSS, JavaScript, C#), and troubleshooting.

Q: What are your interests?
A: I am interested in exploring IT, building projects, and learning new technologies.

Q: How can you be contacted?
A: You can go to the contact section on this portfolio, call 09155383185, or email tapaycyrick08@gmail.com.

Q: Can you help me navigate this portfolio?
A: Yes! Let me know if you want to see my projects, skills, or certificates, and I can guide you.

Q: Can you tell me about your projects?
A: I have built several projects related to web development and school projects showcasing my skills in HTML, CSS, JavaScript, and C#.

Q: Why did you choose IT?
A: I chose IT because I am passionate about technology and enjoy solving problems through coding and design.

Q: Are you open for internships or opportunities?
A: Yes, I am actively looking for opportunities to grow and learn in the IT field.

Q: What programming languages do you know?
A: I am familiar with HTML, CSS, JavaScript, and C#. I am also learning new technologies to improve my skills.

Q: Do you work well in a team?
A: Yes, I work well in a team and value collaboration while being able to handle tasks independently.

Q: What are your strengths?
A: My strengths include being detail-oriented, fast at learning new technologies, and having a strong foundation in IT concepts and web development.

Q: What are your goals?
A: My goal is to gain experience in the IT industry and grow as a developer while contributing to meaningful projects.
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

    // If your frontend sends a special signal, return typing status
    if (userMessage === "__typing_check__") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          botReply: "Cyrick is typing...",
          isTyping: true,
        }),
      };
    }

    const client = ModelClient(endpoint, new AzureKeyCredential(token));

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: `You are Cyrick AI, a friendly AI chatbot on a student portfolio website.
You must only answer questions related to Cyrick Kyle B. Tapay and his portfolio using the provided data.
If a user asks something unrelated, politely respond that you can only answer portfolio-related questions.
Do not include "<think>" or internal reasoning in your response; only provide clean, direct answers.

Here is the data:
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

    let rawReply = response.body.choices[0].message.content.trim();

    // Remove any stray <think> or XML-like tags the model might add
    rawReply = rawReply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    rawReply = rawReply.replace(/^<.*?>/, "").trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ botReply: rawReply, isTyping: false }),
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

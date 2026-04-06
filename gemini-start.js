const { GoogleGenAI } = require("@google/genai");
const Module = require("./models/Module");
require("dotenv").config();

// Ensure the API key fallback is in place
const ai = new GoogleGenAI({apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

async function generateModuleFromDetails(details) {
  const { title, description, sourceLink } = details;
  
  if (!title || !description) {
    throw new Error('Title and description are required.');
  }

  const prompt = `
    Create a comprehensive learning module for the following:
    Title: "${title}"
    Description: "${description}"
    ${sourceLink ? `Optional Reference Source: "${sourceLink}"` : ''}

    The output MUST be a valid JSON object matching this schema exactly, and nothing else (do not wrap in markdown tags like \`\`\`json):
    {
      "title": "String, short and catchy title (can be identical to the provided title)",
      "description": "String, a concise description of the module based on the provided description",
      "content": "String, detailed educational content (at least 3 paragraphs) formatted with simple HTML tags like <h3>, <p>, <ul>, <li>",
      "videoUrl": "String, a placeholder youtube URL related to the topic (e.g., https://www.youtube.com/watch?v=...) if available, otherwise empty string",
      "quiz": [
        {
          "question": "String, a multiple choice question",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswerIndex": 0 // Number (index of the correct option, 0-3)
        }
      ],
      "simulationPrompt": "String, a prompt that could be used to start an AI roleplay simulation or debate about this topic"
    }
    Provide exactly 3 quiz questions. Make sure the content empowers Nigerian girls and young women to engage in politics and governance, if applicable to the topic.
  `;

  try {
    console.log(`Generating module for: ${title}...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // updated model to a more standard name
      contents: prompt,
    });
    
    let responseText = response.text;
    
    // Clean up markdown markers if Gemini adds them
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const moduleData = JSON.parse(responseText);
    
    const newModule = new Module({
      title: moduleData.title || title,
      description: moduleData.description,
      content: moduleData.content,
      videoUrl: moduleData.videoUrl,
      quiz: moduleData.quiz,
      simulationPrompt: moduleData.simulationPrompt
    });
    
    const savedModule = await newModule.save();
    console.log(`Successfully generated and saved module: ${savedModule.title}`);
    return savedModule;
  } catch (err) {
    console.error(`Error generating module for topic ${title}:`, err.message);
    throw err;
  }
}

module.exports = { generateModuleFromDetails };
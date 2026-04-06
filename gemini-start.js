const { GoogleGenAI } = require("@google/genai");
const Module = require("./models/Module");
const PracticeSubmission = require("./models/PracticeSubmission");
const PracticeResource = require("./models/PracticeResource");
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

async function evaluatePracticeSubmission(submissionId) {
  try {
    const submission = await PracticeSubmission.findById(submissionId).populate('resourceId');
    if (!submission) {
      throw new Error('Submission not found');
    }

    let prompt = '';
    let submissionContent = '';

    if (submission.submissionType === 'simulation') {
      submissionContent = `
        Option Selected: ${submission.simulationOption}
        Reasoning: ${submission.simulationReason}
      `;
      prompt = `
        You are an expert civic educator evaluating a student's response to a budget allocation scenario in Nigerian local government.
        
        Scenario Context: A local government has N10 million remaining in the budget. The community needs both a new borehole for clean water and repairs to the primary school roof.
        
        The student's response:
        ${submissionContent}
        
        Evaluation criteria:
        - Critical thinking: Does the response show deep consideration of trade-offs?
        - Leadership perspective: Does it demonstrate civic responsibility?
        - Feasibility: Is the solution practical for Nigerian context?
        - Clarity: Is the reasoning well-articulated?
        
        Provide evaluation as a JSON object (only JSON, no markdown):
        {
          "score": number (0-100),
          "feedback": "string",
          "strengths": ["string1", "string2"],
          "areasForImprovement": ["string1", "string2"],
          "suggestedNextSteps": ["string1", "string2"]
        }
      `;
    } else if (submission.submissionType === 'debate') {
      submissionContent = `
        Debate Response: ${submission.debateResponse}
        Time Spent: ${submission.timeSpent} seconds
      `;
      prompt = `
        You are an expert in civic discourse evaluating a student's debate response on a Nigerian governance issue.
        
        The student's response:
        ${submissionContent}
        
        Evaluation criteria:
        - Argument clarity: Is the argument well-structured and easy to follow?
        - Evidence: Does it reference facts or examples?
        - Civility: Is the tone respectful even if discussing differences?
        - Originality: Does it show original thinking?
        - Persuasiveness: Would this argument convince others?
        
        Provide evaluation as a JSON object (only JSON, no markdown):
        {
          "score": number (0-100),
          "feedback": "string",
          "strengths": ["string1", "string2"],
          "areasForImprovement": ["string1", "string2"],
          "suggestedNextSteps": ["string1", "string2"]
        }
      `;
    } else if (submission.submissionType === 'policy') {
      submissionContent = `
        Policy Title: ${submission.policyTitle}
        Problem Statement: ${submission.policyProblem}
        Proposed Solution: ${submission.policyProposal}
      `;
      prompt = `
        You are an expert policy analyst evaluating a student's policy proposal for addressing a community problem in Nigeria.
        
        The student's proposal:
        ${submissionContent}
        
        Evaluation criteria:
        - Problem identification: Is the problem clearly defined?
        - Solution design: Is the policy practical and well-designed?
        - Impact: Will it achieve positive change?
        - Fairness: Does it consider equity and inclusion?
        - Implementation: Is it realistic to implement?
        
        Provide evaluation as a JSON object (only JSON, no markdown):
        {
          "score": number (0-100),
          "feedback": "string",
          "strengths": ["string1", "string2"],
          "areasForImprovement": ["string1", "string2"],
          "suggestedNextSteps": ["string1", "string2"]
        }
      `;
    }

    if (!prompt) {
      throw new Error('Invalid submission type');
    }

    console.log(`Evaluating practice submission: ${submissionId}...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let responseText = response.text;
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const evaluation = JSON.parse(responseText);

    // Update the submission with evaluation
    submission.aiEvaluation = {
      score: evaluation.score,
      feedback: evaluation.feedback,
      strengths: evaluation.strengths,
      areasForImprovement: evaluation.areasForImprovement,
      suggestedNextSteps: evaluation.suggestedNextSteps
    };
    submission.evaluationStatus = 'completed';
    submission.evaluatedAt = new Date();

    await submission.save();
    console.log(`Successfully evaluated submission: ${submissionId}`);

  } catch (err) {
    console.error(`Error evaluating practice submission ${submissionId}:`, err.message);
    // Mark as failed but don't throw - we want async evaluation to fail gracefully
    try {
      await PracticeSubmission.findByIdAndUpdate(submissionId, {
        evaluationStatus: 'failed'
      });
    } catch (updateErr) {
      console.error('Could not update submission status:', updateErr.message);
    }
  }
}

module.exports = { generateModuleFromDetails, evaluatePracticeSubmission };
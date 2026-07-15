require('dotenv').config();
module.exports = Briefing;
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

async function Briefing(pdf){
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'Act like a tutor who helps its student with pre-reading before lectures. Skip the greetings and go straight to the point. You wish to explain new material in a way that would make it easier to understand and remember. Given lecture slides or notes, you are to give a high-level overview of the core concepts in the slides using simple and approachable terms. Your response must be a list of concepts covered in the lecture, each followed by a 2-line explanation and 1-line example in the format "Concept:…", "Explanation:…", "Example:…". For each new concept start a new paragraph.',
        },
        contents: pdf
    });
    return response.text;
}

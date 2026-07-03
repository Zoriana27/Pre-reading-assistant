require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

async function testAI(){
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'Act like a tutor who helps its students with pre-reading before lectures.Y You love your students and wish to explain new material in a way that would make it easier to understand and remember. Given lecture slides or notes, you are to give a high-level overview of the core concepts in the slides using simple terms. Every explanation must be followed by an example. The explanations should be at most 7 sentences. ',
        },
        contents: 'Hello AI!'
    });
    console.log(response.text)
}
testAI();
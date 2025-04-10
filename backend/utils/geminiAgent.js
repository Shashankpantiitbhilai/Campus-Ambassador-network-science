const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// 1) Force the base URL to v1
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiEndpoint: "https://generativelanguage.googleapis.com/v1"
});

// 2) Get the model handle
const model = genAI.getGenerativeModel({ model: "models/gemini-2.0-flash" });
const CLUBS = [
    "Goals (Oratory Club)",
    "FPS (Film Production)",
    "Swara (Singing Club)",
    "Drishya (Drama Club)",
    "TPS (Photography Club)",
    "Beathackers (Dance Club)",
    "Renaissance (Art Club)",
    "DesignX (Design Club)",
    "Quizzotica (Quiz Club)",
    "Athletics",
    "Badminton",
    "Basketball",
    "Chess",
    "Cricket",
    "Football",
    "Kabaddi",
    "TT (Table Tennis)",
    "Volleyball",
    "Space Exploration Society (SES)",
    "Epsilon (Robotics Club)",
    "Electromos (Electronics Club)",
    "Ingenuity (Competitive Coding Club)",
    "OpenLake (Open Source Club)",
    "Data Science and Artificial Intelligence Club",
    "BIB (Blockchain Club at IIT Bhilai)",
    "Developer Student Clubs (DSC)"
  ];
  
const getRelevanceVector = async (jobDescription) => {
    
  const prompt = `
Given the following job description:

"${jobDescription}"

Rate the relevance of each club from 1 to 10 based on how useful the skills or experiences from each club would be for this job.

Clubs:
${CLUBS.map((club, idx) => `${idx + 1}. ${club}`).join('\n')}

Return the result in JSON format: { "<Club Name>": <score> }
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    // console.log(response);
    const cleaned = response.replace(/```json|```/g, "").trim();
    // console.log("cleaned",cleaned)
    return cleaned;
  } catch (err) {
    console.error("❌ Error in getRelevanceVector:", err);
    throw err;
  }
};

// Export the function
module.exports = { getRelevanceVector };

// Optional: verify which models are available under v1
if (require.main === module) {
  (async () => {
    try {
      const models = await genAI.listModels();
      console.log("Available models:", models);
    } catch (e) {
      console.error("Error listing models:", e);
    }
  })();
}

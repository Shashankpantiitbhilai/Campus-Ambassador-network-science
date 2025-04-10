const express = require("express");
const router = express.Router();
const { getRelevanceVector } = require("../utils/geminiAgent");

router.post("/relevance", async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const relevanceVector = await getRelevanceVector(jobDescription);
    console.log("relevence",relevanceVector)
    res.json(relevanceVector);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

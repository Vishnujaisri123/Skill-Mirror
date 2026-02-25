import Interview from "../models/Interview.js";
import {
  generateQuestions,
  evaluateInterview,
} from "../services/ai.service.js";

/**
 * ▶ START INTERVIEW
 * Creates a new interview session and returns the first question
 */
export const startInterview = async (req, res) => {
  try {
    const { skill, difficulty } = req.body;

    if (!skill) {
      return res.status(400).json({ message: "Skill is required" });
    }
    if (!difficulty) {
      return res.status(400).json({ message: "Difficulty is required" });
    }

    // 🤖 Generate AI questions
    const questions = await generateQuestions(skill, difficulty, 5);

    // 🧠 Create interview session
    const interview = await Interview.create({
      skill,
      questions,
      totalQuestions: questions.length,
      currentIndex: 0,
      answers: [],
      finished: false,
    });

    // ✅ Return first question
    res.json({
      interviewId: interview._id,
      question: interview.questions[0],
    });
  } catch (error) {
    console.error("START INTERVIEW ERROR:", error);
    res.status(500).json({ message: "Failed to start interview" });
  }
};

/**
 * ▶ SUBMIT ANSWER
 * Saves answer, returns next question OR final result
 */
export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;

    if (!interviewId || !answer) {
      return res.status(400).json({
        message: "Interview ID and answer are required",
      });
    }

    const interview = await Interview.findById(interviewId);

    if (!interview || interview.finished) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 💾 Save answer
    interview.answers.push(answer);
    interview.currentIndex += 1;

    // ▶ MORE QUESTIONS LEFT
    if (interview.currentIndex < interview.totalQuestions) {
      await interview.save();

      return res.json({
        question: interview.questions[interview.currentIndex],
      });
    }

    // ▶ FINISH INTERVIEW
    const qaPairs = interview.questions.map((q, i) => ({
      q,
      a: interview.answers[i],
    }));

    // 🤖 AI evaluation
    const result = await evaluateInterview(interview.skill, qaPairs);

    interview.finished = true;
    interview.result = result;

    await interview.save();

    // 🆕 SAVE INTERVIEW HISTORY (PER USER)

    // ✅ SEND FINAL RESPONSE
    res.json({
      done: true,
      result,
    });
  } catch (error) {
    console.error("SUBMIT ANSWER ERROR:", error);
    res.status(500).json({ message: "Failed to submit answer" });
  }
};

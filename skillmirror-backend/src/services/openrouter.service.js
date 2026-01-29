/* eslint-disable no-undef */
/* eslint-env node */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "openai/gpt-4o-mini";

if (!OPENROUTER_API_KEY) {
  throw new Error("❌ OPENROUTER_API_KEY is missing in .env");
}

// --------------------------------------------------
// 🔹 Helper: Clean & Parse JSON safely
// --------------------------------------------------
function safeJsonParse(raw) {
  if (!raw) throw new Error("Empty response from OpenRouter");

  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("❌ OpenRouter returned invalid JSON:");
    console.error(cleaned);
    throw new Error("Invalid JSON returned by OpenRouter");
  }
}

// --------------------------------------------------
// 🧠 Generate Interview Questions
// --------------------------------------------------
export async function generateQuestions(skill, count = 5) {
  const prompt = `
Generate ${count} interview questions for ${skill}.

Rules:
- Short, clear, interview-style questions
- No numbering
- No markdown
- One question per line
- Plain text only
`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";

  return text
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean);
}

// --------------------------------------------------
// 📊 Evaluate Interview Answers
// --------------------------------------------------
export async function evaluateInterview(skill, qaPairs) {
  const prompt = `
Evaluate the following ${skill} interview.

STRICT RULES:
- Return ONLY raw JSON
- DO NOT use markdown
- DO NOT wrap in triple backticks
- DO NOT add explanation text

JSON format:
{
  "score": number between 0 and 100,
  "strengths": string[],
  "gaps": string[]
}

Interview Q&A:
${qaPairs
  .map((x, i) => `Question ${i + 1}: ${x.q}\nAnswer ${i + 1}: ${x.a}`)
  .join("\n\n")}
`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content?.trim();

  return safeJsonParse(raw);
}

// --------------------------------------------------
// 🛠️ Generate Improvement Plan
// --------------------------------------------------
export async function generatePlan({ skill, score, strengths, gaps }) {
  const prompt = `
You are an expert technical mentor.

Create a detailed improvement plan for a ${skill} interview candidate.

Candidate profile:
- Score: ${score}/100
- Strengths: ${strengths.join(", ")}
- Weak areas: ${gaps.join(", ")}

Rules:
- Return ONLY valid JSON
- No markdown
- No explanations outside JSON
- Output an array called "plan"
- Each plan item must include:
  - title
  - priority (High / Medium / Low)
  - why (1 sentence)
  - actions (array of 3 short steps)
  - practice (1 practical task)
  - time (estimated effort)
  - impact (confidence improvement)

JSON format:
{
  "plan": [ ... ]
}
`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    }),
  });

  const data = await res.json();
  let raw = data.choices[0].message.content.trim();

  if (raw.startsWith("```")) {
    raw = raw.replace(/```json|```/g, "").trim();
  }

  return JSON.parse(raw).plan;
}

// // /* eslint-disable no-undef */
// // /* eslint-env node */

// // import fetch from "node-fetch";

// // const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// // const MODEL = "openai/gpt-4o-mini";

// // if (!OPENROUTER_API_KEY) {
// //   throw new Error("❌ OPENROUTER_API_KEY is missing in .env");
// // }

// // // --------------------------------------------------
// // // 🔹 Helper: Clean & Parse JSON safely (GLOBAL)
// // // --------------------------------------------------
// // function safeJsonParse(raw) {
// //   if (!raw) throw new Error("Empty response from OpenRouter");

// //   const cleaned = raw
// //     .replace(/```json/gi, "")
// //     .replace(/```/g, "")
// //     .trim();

// //   try {
// //     return JSON.parse(cleaned);
// //   } catch (err) {
// //     console.error("❌ OpenRouter returned invalid JSON:");
// //     console.error(cleaned);
// //     throw err;
// //   }
// // }

// // // --------------------------------------------------
// // // 🧠 Generate Interview Questions (SAFE & CONSISTENT)
// // // --------------------------------------------------
// // export async function generateQuestions(skill, count = 5) {
// //   const prompt = `
// // Generate ${count} interview questions for ${skill}.

// // Return ONLY JSON in this exact format:
// // {
// //   "questions": ["question 1", "question 2"]
// // }

// // Rules:
// // - No markdown
// // - No explanations
// // - No extra text
// // `;

// //   const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
// //     method: "POST",
// //     headers: {
// //       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify({
// //       model: MODEL,
// //       messages: [{ role: "user", content: prompt }],
// //       temperature: 0.4,
// //     }),
// //   });

// //   if (!res.ok) {
// //     throw new Error(`OpenRouter error: ${res.status}`);
// //   }

// //   const data = await res.json();
// //   const raw = data?.choices?.[0]?.message?.content;

// //   const parsed = safeJsonParse(raw);

// //   if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
// //     throw new Error("AI returned no questions");
// //   }

// //   return parsed.questions.slice(0, count);
// // }

// // // --------------------------------------------------
// // // 📊 Evaluate Interview Answers (SAFE)
// // // --------------------------------------------------
// // export async function evaluateInterview(skill, qaPairs) {
// //   const prompt = `
// // Evaluate the following ${skill} interview.

// // Return ONLY JSON in this format:
// // {
// //   "score": number between 0 and 100,
// //   "strengths": string[],
// //   "gaps": string[]
// // }

// // Interview Q&A:
// // ${qaPairs
// //   .map((x, i) => `Question ${i + 1}: ${x.q}\nAnswer ${i + 1}: ${x.a}`)
// //   .join("\n\n")}
// // `;

// //   const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
// //     method: "POST",
// //     headers: {
// //       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify({
// //       model: MODEL,
// //       messages: [{ role: "user", content: prompt }],
// //       temperature: 0.2,
// //     }),
// //   });

// //   if (!res.ok) {
// //     throw new Error(`OpenRouter error: ${res.status}`);
// //   }

// //   const data = await res.json();
// //   const raw = data?.choices?.[0]?.message?.content;

// //   return safeJsonParse(raw);
// // }

// // // --------------------------------------------------
// // // 🛠️ Generate Improvement Plan (SAFE)
// // // --------------------------------------------------
// // export async function generatePlan({ skill, score, strengths, gaps }) {
// //   const prompt = `
// // Create an improvement plan for a ${skill} interview candidate.

// // Return ONLY JSON in this format:
// // {
// //   "plan": [
// //     {
// //       "title": "",
// //       "priority": "High | Medium | Low",
// //       "why": "",
// //       "actions": ["", "", ""],
// //       "practice": "",
// //       "time": "",
// //       "impact": ""
// //     }
// //   ]
// // }

// // Candidate profile:
// // - Score: ${score}
// // - Strengths: ${strengths.join(", ")}
// // - Gaps: ${gaps.join(", ")}
// // `;

// //   const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
// //     method: "POST",
// //     headers: {
// //       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
// //       "Content-Type": "application/json",
// //     },
// //     body: JSON.stringify({
// //       model: MODEL,
// //       messages: [{ role: "user", content: prompt }],
// //       temperature: 0.35,
// //     }),
// //   });

// //   if (!res.ok) {
// //     throw new Error(`OpenRouter error: ${res.status}`);
// //   }

// //   const data = await res.json();
// //   const raw = data?.choices?.[0]?.message?.content;

// //   const parsed = safeJsonParse(raw);

// //   if (!Array.isArray(parsed.plan)) {
// //     throw new Error("AI returned invalid improvement plan");
// //   }

// //   return parsed.plan;
// // }

// /* eslint-disable no-undef */
// /* eslint-env node */

// import fetch from "node-fetch";

// // ---------------- MOCK HELPERS ----------------
// function mockQuestions(skill, count = 5) {
//   return Array.from(
//     { length: count },
//     (_, i) => `Mock ${skill} interview question ${i + 1}`,
//   );
// }

// function mockEvaluation() {
//   return {
//     score: 72,
//     strengths: [
//       "Conceptual understanding",
//       "Clear explanations",
//       "Good terminology usage",
//     ],
//     gaps: ["Edge cases", "Performance considerations", "Real-world examples"],
//   };
// }

// function mockPlan(skill) {
//   return [
//     {
//       title: `Strengthen ${skill} fundamentals`,
//       priority: "High",
//       why: "Some concepts lacked depth.",
//       actions: [
//         "Revise fundamentals",
//         "Explain concepts aloud",
//         "Practice interview questions",
//       ],
//       practice: "Build a small demo project",
//       time: "2–3 hours",
//       impact: "Improves confidence",
//     },
//   ];
// }

// // ---------------- UTIL ----------------
// function safeJsonParse(raw) {
//   if (!raw) throw new Error("Empty AI response");

//   const cleaned = raw
//     .replace(/```json/gi, "")
//     .replace(/```/g, "")
//     .trim();

//   return JSON.parse(cleaned);
// }

// // ---------------- QUESTIONS ----------------
// export async function generateQuestions(skill, count = 5) {
//   const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

//   if (USE_MOCK_AI) {
//     console.log("🧪 MOCK MODE: questions");
//     return mockQuestions(skill, count);
//   }

//   const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
//   if (!OPENROUTER_API_KEY) {
//     throw new Error("OPENROUTER_API_KEY missing");
//   }

//   const prompt = `
// Return ONLY JSON:
// { "questions": ["Q1", "Q2"] }

// Generate ${count} interview questions for ${skill}.
// `;

//   const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${OPENROUTER_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: "deepseek/deepseek-chat",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.4,
//     }),
//   });

//   const data = await res.json();
//   const raw = data?.choices?.[0]?.message?.content;

//   const parsed = safeJsonParse(raw);

//   if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
//     throw new Error("AI returned invalid questions");
//   }

//   return parsed.questions.slice(0, count);
// }

// // ---------------- EVALUATION ----------------
// export async function evaluateInterview() {
//   const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

//   if (USE_MOCK_AI) {
//     console.log("🧪 MOCK MODE: evaluation");
//     return mockEvaluation();
//   }

//   throw new Error("Real evaluation disabled without credits");
// }

// // ---------------- PLAN ----------------
// export async function generatePlan({ skill }) {
//   const USE_MOCK_AI = process.env.USE_MOCK_AI === "true";

//   if (USE_MOCK_AI) {
//     console.log("🧪 MOCK MODE: plan");
//     return mockPlan(skill);
//   }

//   throw new Error("Real plan disabled without credits");
// }

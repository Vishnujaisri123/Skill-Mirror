/* eslint-disable no-undef */
/* eslint-env node */


const MODEL = "llama-3.3-70b-versatile";

// --------------------------------------------------
// 🔹 Helper: Clean & Parse JSON safely
// --------------------------------------------------
function safeJsonParse(raw) {
  if (!raw) throw new Error("Empty response from Groq");

  const cleaned = raw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("❌ Groq returned invalid JSON:");
    console.error(cleaned);
    throw new Error("Invalid JSON returned by Groq");
  }
}

// --------------------------------------------------
// 🧠 Generate Interview Questions
// --------------------------------------------------
export async function generateQuestions(skill, difficulty, count = 5) {
  // Create a massive random hash to force the LLM out of its semantic caching
  const randomHash = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  
  // Strictly differentiate instructions based on the requested difficulty
  let levelRules = "";
  let forbidden = "";

  if (difficulty.toLowerCase() === "beginner") {
    levelRules = `
    - Focus: Syntax, terminology, basic CLI commands, and 101-level concepts.
    - Style: "What does this do?", "How do you write X?", "Define Y."
    - Target: Someone who started learning last week.
    `;
    forbidden = "DO NOT ask about: Design patterns, performance tuning, architecture, security headers, scaling, distributed systems, or internal memory management.";
  } else if (difficulty.toLowerCase() === "intermediate") {
    levelRules = `
    - Focus: Real-world usage, common libraries, debugging, state flow, and basic performance.
    - Style: "How would you handle X scenario?", "What happens if Y happens?", "Compare method A vs method B in context."
    - Target: Someone with 1-2 years of experience.
    `;
    forbidden = "DO NOT ask about: Basic syntax, 'What is X' definitions, OR super-advanced distributed system scaling/internal engine source code.";
  } else {
    // Advanced
    levelRules = `
    - Focus: System design, high-concurrency, security, internals, complex edge cases, and optimization.
    - Style: "Design a system that...", "Explain the internal execution flow of...", "What are the trade-offs of using X at a scale of 1M users?"
    - Target: Senior Engineers / Architects.
    `;
    forbidden = "DO NOT ask: Basic definitions, simple feature implementation, or common interview tropes like 'How do you center a div'.";
  }

  const prompt = `
You are a High-Stakes Technical Interviewer. Generate ${count} ${difficulty.toUpperCase()} questions for ${skill}.

STEP 1: Identify 5 DISTINCT, non-overlapping sub-topics within ${skill} that are strictly ${difficulty} level.
STEP 2: For each sub-topic, formulate a highly innovative and practical question.

CONSTRAINTS:
- LEVEL RULES: ${levelRules}
- FORBIDDEN: ${forbidden}
- ABSOLUTE UNIQUENESS: I will penalize you if you give standard questions. Use unique scenarios.
- NO PREAMBLE: Start immediately with the first question.
- ENTROPY: ${randomHash}
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.95, // Max temperature for maximum unpredictability
        top_p: 0.95, // High top_p to evaluate a wide range of tokens
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
You are an expert technical interviewer evaluating a candidate for a ${skill} role.

Evaluate the following interview Q&A carefully to calculate a highly accurate "Confidence & Competence Accuracy" score. 
Base your 0-100 score precisely on this rubric:
1. Technical Correctness (40%): Are the factual claims completely correct?
2. Depth of Knowledge (40%): Did they explain the 'why' and 'how', showing deep understanding?
3. Clarity (20%): Is the communication clear, concise, and professional?

STRICT RULES:
- Return ONLY raw JSON
- DO NOT use markdown
- DO NOT wrap in triple backticks
- DO NOT add explanation text

JSON format:
{
  "score": number between 0 and 100, // The final highly accurate accuracy score
  "strengths": string[], // Top 2 skills demonstrated
  "gaps": string[] // Top 2 areas needing improvement
}

Interview Q&A:
${qaPairs
  .map((x, i) => `Question ${i + 1}: ${x.q}\nAnswer ${i + 1}: ${x.a}`)
  .join("\n\n")}
`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1, // Very low temperature for highly deterministic, accurate grading
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

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
    }),
  });

  const data = await res.json();
  let raw = data.choices?.[0]?.message?.content?.trim();

  if (raw && raw.startsWith("```")) {
    raw = raw.replace(/```json|```/g, "").trim();
  }

  const parsed = safeJsonParse(raw);
  return parsed.plan || parsed;
}

import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Interview.css";

import useTextToSpeech from "../hooks/useTextToSpeech";
import useSpeechToText from "../hooks/useSpeechToText";
import Waveform from "../components/Waveform";
import RoboIndicator from "../components/RoboIndicator";

import { useAssessment } from "../context/useAssessment";

export default function Interview() {
  const navigate = useNavigate();

  const {
    skill,
    difficulty,
    interviewId,
    currentQuestion,
    setCurrentQuestion,
    questions,
    totalQuestions,
    setResult,
  } = useAssessment();

  // 🧠 State
  const [questionText, setQuestionText] = useState("Loading first question...");
  const [loading, setLoading] = useState(false);
  
  const wasSpeaking = useRef(false);

  // 🎙️ Voice hooks
  const { speak, stop, speaking } = useTextToSpeech();
  const { transcript, listening, startListening, stopListening, clearTranscript } =
    useSpeechToText();

  // 🚫 Guard: no skill or interview → home
  useEffect(() => {
    if (!skill || !interviewId) {
      navigate("/");
    }
  }, [skill, interviewId, navigate]);

  // 🟢 SYNC INITIAL QUESTION
  useEffect(() => {
    if (questions.length > 0 && questionText === "Loading first question...") {
      setQuestionText(questions[0]);
    }
  }, [questions, questionText]);

  // 🗣️ AUTO-READ QUESTION
  useEffect(() => {
    if (
      questionText &&
      !questionText.includes("Loading") &&
      !questionText.includes("Failed") &&
      !questionText.includes("Error")
    ) {
      speak(questionText);
    }
  }, [questionText, speak]);

  // 🔄 AUTO-LISTEN AFTER AI SPEAKS
  useEffect(() => {
    if (speaking) {
      wasSpeaking.current = true;
    } else if (wasSpeaking.current && !speaking) {
      wasSpeaking.current = false;
      // Start listening instantly after AI finishes
      if (!loading) {
        startListening();
      }
    }
  }, [speaking, startListening, loading]);

  // ➡️ NEXT BUTTON HANDLER (Submit Answer)
  const handleNext = async () => {
    const currentAnswer = transcript.trim();
    if (!currentAnswer) return;

    stopListening();
    stop(); // cancel ai just in case
    clearTranscript();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/interview/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId,
          answer: currentAnswer,
        }),
      });

      const data = await res.json();

      // 🎉 INTERVIEW FINISHED
      if (data.done) {
        setResult(data.result);
        navigate(`/result/${skill}`);
        return;
      }

      // ➡️ NEXT QUESTION
      setQuestionText(data.question);
      setCurrentQuestion((prev) => prev + 1);
    } catch {
      setQuestionText("Error loading next question");
    } finally {
      setLoading(false);
    }
  };

  // 🎤 IMMERSIVE VOICE MODE UI
  return (
    <div className="interview-page voice-mode glow-bg">
      <div className="interview-header minimal-header">
        <p className="question-count">
          Question {currentQuestion} / {totalQuestions}
        </p>
        <button className="cancel-btn minimal" onClick={() => { stop(); stopListening(); navigate("/"); }}>
          End
        </button>
      </div>

      <div className="voice-core">
        {/* Helper Subtitle */}
        <div className="status-text">
          {loading ? "Thinking..." : speaking ? "AI is speaking..." : listening ? "Listening..." : "Processing..."}
        </div>

        {/* AI Question Box */}
        <div className="chat-box ai-chat-box">
          <span className="chat-label">Agent</span>
          <h3 className="ai-question-text">{questionText}</h3>
        </div>

        {/* The beautiful pulsating center */}
        <div className={`central-visual ${speaking ? 'is-speaking' : listening ? 'is-listening' : 'is-processing'}`}>
          <RoboIndicator active={speaking || listening} />
          <Waveform active={speaking || listening} />
        </div>

        {/* Live User Transcript Box */}
        <div className={`chat-box user-chat-box ${listening ? 'is-listening-border' : ''}`}>
             <span className="chat-label">You {listening && "(Listening...)"}</span>
             <div className="live-transcript">
               {transcript ? `"${transcript}"` : <span className="placeholder-text">Waiting for you to speak...</span>}
             </div>
        </div>
      </div>

      <div className="voice-footer">
         <button className={`tap-submit-btn ${transcript.trim() ? 'active' : ''}`} onClick={handleNext} disabled={loading || !transcript.trim()}>
            {loading ? "Sending..." : "Tap to Submit Answer"}
         </button>
      </div>
    </div>
  );
}

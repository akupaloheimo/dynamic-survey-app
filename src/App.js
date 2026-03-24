import "./App.css";
import gemini from "./gemini";
import { useState, useEffect } from "react";

function App() {
  const [questions] = useState([
    "Describe a hobby or activity that you do regularly, and what it typically involves?",
    "What motivates you to do this activity, and what does it mean to you personally?",
    "Can you walk me through a recent occasion when you engaged in this activity, including what you did and how you experienced it?",
    "What challenges or difficulties, if any, have you encountered in this activity?",
    "How has your engagement with this activity changed over time?",
  ]);

  const [responses, setResponses] = useState({});
  const [followUps, setFollowUps] = useState({});
  const [loading, setLoading] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [followUpResponses, setFollowUpResponses] = useState({});
  const [completedQuestions, setCompletedQuestions] = useState(new Set());
  const [submittedResponses, setSubmittedResponses] = useState(new Set());
  const [submittedFollowUps, setSubmittedFollowUps] = useState(new Set());

  const totalQuestions = questions.length * 2;
  const answeredQuestions = submittedResponses.size + submittedFollowUps.size;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  const handleQuestionSubmit = async (questionIndex, answer) => {
    setResponses((prev) => ({ ...prev, [questionIndex]: answer }));
    setSubmittedResponses((prev) => new Set([...prev, questionIndex]));

    setLoading((prev) => ({ ...prev, [questionIndex]: true }));

    const prompt = `We are doing a survey. Pretend you are a researcher trying to get better data from the surveyee. 
                    Ask one clear follow-up question based on the answer. 
                    Question: ${questions[questionIndex]} Answer: ${answer}`;

    try {
      const followUp = await gemini(prompt);
      setFollowUps((prev) => ({ ...prev, [questionIndex]: followUp }));
    } catch (error) {
      console.error("Failed to generate follow-up question.", error);
      setFollowUps((prev) => ({
        ...prev,
        [questionIndex]: "Sorry, we couldn't generate a follow-up question.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [questionIndex]: false }));
    }
  };

  const scrollToNextQuestion = (currentIndex) => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      const nextElement = document.getElementById(`question-${nextIndex}`);
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handleFollowUpSubmit = (questionIndex, followUpAnswer) => {
    setFollowUpResponses((prev) => ({
      ...prev,
      [questionIndex]: followUpAnswer,
    }));
    setSubmittedFollowUps((prev) => new Set([...prev, questionIndex]));
    setCompletedQuestions((prev) => new Set([...prev, questionIndex]));

    scrollToNextQuestion(questionIndex);
    saveProgressToStorage(questionIndex, followUpAnswer);
  };

  const saveProgressToStorage = (
    currentQuestionIndex,
    currentFollowUpAnswer,
  ) => {
    const updatedFollowUpResponses = {
      ...followUpResponses,
      [currentQuestionIndex]: currentFollowUpAnswer,
    };

    const progress = {
      responses,
      followUps,
      followUpResponses: updatedFollowUpResponses,
      completedQuestions: Array.from(completedQuestions),
      submittedResponses: Array.from(submittedResponses),
      submittedFollowUps: Array.from(
        new Set([...submittedFollowUps, currentQuestionIndex]),
      ),
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("survey-progress", JSON.stringify(progress));
  };

  // const loadProgressFromStorage = () => {
  //   const saved = localStorage.getItem("survey-progress");
  //   if (saved) {
  //     const progress = JSON.parse(saved);
  //     setResponses(progress.responses || {});
  //     setFollowUps(progress.followUps || {});
  //     setFollowUpResponses(progress.followUpResponses || {});
  //     setCompletedQuestions(new Set(progress.completedQuestions || []));
  //     setSubmittedResponses(new Set(progress.submittedResponses || []));
  //     setSubmittedFollowUps(new Set(progress.submittedFollowUps || []));
  //   }
  // };

  useEffect(() => {
    localStorage.setItem(
      "surveyProgress",
      JSON.stringify({
        responses,
        followUps,
        followUpResponses,
        currentQuestion,
      }),
    );
  }, [responses, followUps, followUpResponses, currentQuestion]);

  useEffect(() => {
    const saved = localStorage.getItem("surveyProgress");
    if (saved) {
      const {
        responses: savedResponses,
        followUps: savedFollowUps,
        followUpResponses: savedFollowUpResponses,
        currentQuestion: savedCurrent,
      } = JSON.parse(saved);
      setResponses(savedResponses || {});
      setFollowUps(savedFollowUps || {});
      setFollowUpResponses(savedFollowUpResponses || {});
      setCurrentQuestion(savedCurrent || 0);
    }
  }, []);

  return (
    <div className="App">
      <header>
        <h1 style={{ paddingTop: "64px" }}>
          Dynamic AI assisted Survey; a research study
        </h1>
      </header>
      <div className="body">
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {answeredQuestions} of {totalQuestions} questions completed (
            {Math.round(progressPercentage)}%)
          </p>
        </div>
        {questions.map((question, index) => {
          const isCompleted = completedQuestions.has(index);
          const hasResponse = !!responses[index];
          const hasFollowUp = !!followUps[index];
          const hasFollowUpResponse = submittedFollowUps.has(index);

          return (
            <div
              key={index}
              className="question-section"
              id={`question-${index}`}
            >
              <div className={`question-box ${isCompleted ? "completed" : ""}`}>
                <div className="question-header">
                  <h2>
                    Question {index + 1} of {questions.length}
                  </h2>
                  {isCompleted && (
                    <span className="completed-badge">✓ Completed</span>
                  )}
                </div>

                <p className="question-text">{question}</p>

                <div className="input-group">
                  <input
                    className="main-input"
                    placeholder="Write your answer here..."
                    value={responses[index] || ""}
                    onChange={(e) =>
                      setResponses((prev) => ({
                        ...prev,
                        [index]: e.target.value,
                      }))
                    }
                    disabled={hasFollowUp}
                  />

                  <button
                    className={`submit-button ${hasResponse ? "active" : "disabled"}`}
                    onClick={() =>
                      handleQuestionSubmit(index, responses[index])
                    }
                    disabled={
                      !responses[index] || loading[index] || hasFollowUp
                    }
                  >
                    {loading[index]
                      ? "Generating..."
                      : hasFollowUp
                        ? "Submitted"
                        : "Submit"}
                  </button>
                </div>

                {loading[index] && (
                  <div className="spinner-container">
                    <div className="spinner"></div>
                    <p style={{ marginLeft: "10px" }}>
                      Generating follow-up question...
                    </p>
                  </div>
                )}

                {hasFollowUp && !loading[index] && (
                  <div className="follow-up-section">
                    <h4>Follow-up Question:</h4>
                    <p className="follow-up-question">{followUps[index]}</p>

                    <div className="input-group">
                      <input
                        className="followup-input"
                        placeholder="Your follow-up answer..."
                        value={followUpResponses[index] || ""}
                        onChange={(e) =>
                          setFollowUpResponses((prev) => ({
                            ...prev,
                            [index]: e.target.value,
                          }))
                        }
                        disabled={hasFollowUpResponse}
                      />

                      <button
                        className={`submit-button ${followUpResponses[index] ? "active" : "disabled"}`}
                        onClick={() =>
                          handleFollowUpSubmit(index, followUpResponses[index])
                        }
                        disabled={
                          !followUpResponses[index] || hasFollowUpResponse
                        }
                      >
                        {hasFollowUpResponse ? "Submitted" : "Submit Follow-up"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="gemini-image">
                  <span className="gemini-image-text">
                    Follow up question generated with
                  </span>
                  <a
                    href="https://ai.google.dev/gemini-api/docs/models"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      className="gemini-logo"
                      src="/gemini-image.png"
                      alt="Gemini API"
                    />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
        {completedQuestions.size === questions.length && (
          <div className="summary-section">
            <div className="question-box summary-box">
              <h2>Survey Complete!</h2>
              <p>
                Thank you for completing our survey. Here's a summary of your
                responses:
              </p>

              {questions.map((question, index) => (
                <div key={index} className="summary-item">
                  <h4>
                    Q{index + 1}: {question}
                  </h4>
                  <p>
                    <strong>Answer:</strong> {responses[index]}
                  </p>
                  <p>
                    <strong>Follow-up:</strong> {followUps[index]}
                  </p>
                  <p>
                    <strong>Follow-up Answer:</strong>{" "}
                    {followUpResponses[index]}
                  </p>
                </div>
              ))}

              <button
                className="download-button"
                onClick={() => {
                  const data = {
                    questions,
                    responses,
                    followUps,
                    followUpResponses,
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "survey-responses.json";
                  a.click();
                }}
              >
                Download Responses
              </button>
              <button
                className="submit-button"
                onClick={() => alert("Responses submitted!")}
              >
                Send answers
              </button>
            </div>
          </div>
        )}
      </div>
      <footer>
        <p>
          Made by Aku Paloheimo and Oona Tujula for research purposes. Follow-up
          questions generated with{" "}
          <a
            href="https://ai.google.dev/gemini-api/docs/models"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gemini API
          </a>
        </p>
        <p>
          To contact us, email{" "}
          <a href="mailto:aku.paloheimo@aalto.fi">aku.paloheimo@aalto.fi</a> or{" "}
          <a href="mailto:oona.tujula@aalto.fi">oona.tujula@aalto.fi</a>
        </p>
      </footer>
    </div>
  );
}

export default App;

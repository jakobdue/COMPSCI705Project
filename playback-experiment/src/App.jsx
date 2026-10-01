import { useRef, useState } from "react";
import "./App.css";

function App() {
  const [participantId, setParticipantId] = useState("");
  const [group, setGroup] = useState("group1");
  const [started, setStarted] = useState(false);

  const [conditionIndex, setConditionIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const [promptTimes, setPromptTimes] = useState([]);
  const [triggeredPrompts, setTriggeredPrompts] = useState([]);
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(null);

  const [promptAnswer, setPromptAnswer] = useState(null);

  const [results, setResults] = useState([]);

  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const [finished, setFinished] = useState(false);

  const videoRef = useRef(null);

  const conditions = {
    group1: [
      {
        id: "video2",
        video: "/videos/video2.mp4",
        speed: 1.5,
        title: "How to Talk to the Worst Parts of Yourself",
      },
      {
        id: "video1",
        video: "/videos/video1.mp4",
        speed: 1.0,
        title: "What Makes a Good Life?",
      },
    ],

    group2: [
      {
        id: "video2",
        video: "/videos/video2.mp4",
        speed: 1.0,
        title: "How to Talk to the Worst Parts of Yourself",
      },
      {
        id: "video1",
        video: "/videos/video1.mp4",
        speed: 1.5,
        title: "What Makes a Good Life?",
      },
    ],
  };

  const currentCondition = conditions[group][conditionIndex];

  const video1Questions = [
    {
      question:
        "What made the Harvard Study of Adult Development unusual?",
      options: [
        "It studied only people over the age of 80",
        "It compared people from several different countries",
        "It followed participants over many decades of their lives",
        "It relied only on participants remembering their childhood",
      ],
      correctAnswer: 2,
    },
    {
      question:
        "What was the main conclusion of the Harvard Study of Adult Development presented in the talk?",
      options: [
        "Financial success is the strongest predictor of happiness",
        "Good relationships help keep people happier and healthier",
        "Physical exercise is more important than social interaction",
        "Career achievement is the main source of long-term well-being",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "According to the talk, what matters most about a person's relationships?",
      options: [
        "The total number of friends they have",
        "Whether they are married",
        "How often they meet other people",
        "The quality of their close relationships",
      ],
      correctAnswer: 3,
    },
    {
      question:
        "What characteristic at age 50 was associated with being healthier at age 80?",
      options: [
        "Having low cholesterol",
        "Being satisfied with one's relationships",
        "Having a high income",
        "Exercising regularly",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "What does the study suggest good relationships can help protect in older age, in addition to physical health?",
      options: [
        "Memory and brain functioning",
        "Eyesight",
        "Hearing",
        "Physical strength",
      ],
      correctAnswer: 0,
    },
  ];

  const video2Questions = [
    {
      question:
        "What experience inspired Karen Faith's approach to dealing with different parts of herself?",
      options: [
        "Teaching university students",
        "Moderating focus groups",
        "Studying psychology",
        "Working as a therapist",
      ],
      correctAnswer: 1,
    },
    {
      question: 'What does Faith mean by "unconditional welcome"?',
      options: [
        "Agreeing with everything another person says",
        "Ignoring negative thoughts and emotions",
        "Accepting someone as they are in the moment without first judging whether they deserve it",
        "Trying to change someone's beliefs through empathy",
      ],
      correctAnswer: 2,
    },
    {
      question:
        "How did Faith respond differently when a distressed inner voice told her that it wanted to die?",
      options: [
        "She tried harder to suppress it",
        "She distracted herself from it",
        "She listened to it while setting boundaries on whether she would obey it",
        "She tried to prove that its thoughts were irrational",
      ],
      correctAnswer: 2,
    },
    {
      question:
        "What metaphor does Faith eventually use to describe the different parts of herself?",
      options: [
        "A broken mirror",
        "A prism producing a full spectrum",
        "A puzzle with missing pieces",
        "A crowded theatre",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "What is one of the main ideas Faith presents about self-acceptance?",
      options: [
        "Difficult thoughts must disappear before someone can be happy",
        "People must completely love themselves before they can love others",
        "Different internal perspectives can be listened to with honesty, boundaries, kindness, and gratitude",
        "Negative parts of the self should be replaced with more positive ones",
      ],
      correctAnswer: 2,
    },
  ];

  const currentQuestions =
    currentCondition?.id === "video1"
      ? video1Questions
      : video2Questions;

  function generatePromptTimes(duration) {
    const quarter = duration / 4;
    const buffer = 15;

    return [0, 1, 2, 3].map((quarterIndex) => {
      const start = quarterIndex * quarter + buffer;
      const end = (quarterIndex + 1) * quarter - buffer;

      return start + Math.random() * (end - start);
    });
  }

  function answerIndexToLetter(index) {
    if (index === 0) return "A";
    if (index === 1) return "B";
    if (index === 2) return "C";
    if (index === 3) return "D";
    return "";
  }

  function roundTime(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    return Number(value).toFixed(2);
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;

    if (!video) return;

    video.playbackRate = currentCondition.speed;

    const times = generatePromptTimes(video.duration);

    setPromptTimes(times);
    setTriggeredPrompts([]);

    const timingResult = {
      type: "prompt-timing",
      participantId,
      group,
      conditionNumber: conditionIndex + 1,
      video: currentCondition.id,
      videoTitle: currentCondition.title,
      speed: currentCondition.speed,
      videoDuration: roundTime(video.duration),
      prompt1Scheduled: roundTime(times[0]),
      prompt2Scheduled: roundTime(times[1]),
      prompt3Scheduled: roundTime(times[2]),
      prompt4Scheduled: roundTime(times[3]),
    };

    setResults((previous) => [...previous, timingResult]);

    console.log("Video:", currentCondition.title);
    console.log("Speed:", currentCondition.speed);
    console.log("Video duration:", roundTime(video.duration));
    console.log(
      "Prompt times:",
      times.map((time) => roundTime(time))
    );
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video || showPrompt) return;

    for (let index = 0; index < promptTimes.length; index++) {
      const promptTime = promptTimes[index];
      const alreadyTriggered = triggeredPrompts.includes(index);

      if (!alreadyTriggered && video.currentTime >= promptTime) {
        video.pause();

        setTriggeredPrompts((previous) => [
          ...previous,
          index,
        ]);

        setCurrentPromptIndex(index);
        setShowPrompt(true);

        break;
      }
    }
  }

  function savePromptResponse(mindWandering, related = "") {
    const video = videoRef.current;

    const response = {
      type: "mind-wandering",
      participantId,
      group,
      conditionNumber: conditionIndex + 1,
      video: currentCondition.id,
      videoTitle: currentCondition.title,
      speed: currentCondition.speed,
      promptNumber: currentPromptIndex + 1,
      scheduledPromptTime: roundTime(
        promptTimes[currentPromptIndex]
      ),
      actualPromptTime: roundTime(video.currentTime),
      mindWandering,
      related,
    };

    setResults((previous) => [...previous, response]);

    console.log("Saved prompt response:", response);

    setPromptAnswer(null);
    setShowPrompt(false);
    setCurrentPromptIndex(null);

    video.play();
  }

  function handleVideoEnded() {
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function handleQuizAnswer(questionIndex, optionIndex) {
    setQuizAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));
  }

  function submitQuiz() {
    let score = 0;

    currentQuestions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        score += 1;
      }
    });

    const quizResult = {
      type: "quiz",
      participantId,
      group,
      conditionNumber: conditionIndex + 1,
      video: currentCondition.id,
      videoTitle: currentCondition.title,
      speed: currentCondition.speed,
      score,
      q1Answer: answerIndexToLetter(quizAnswers[0]),
      q2Answer: answerIndexToLetter(quizAnswers[1]),
      q3Answer: answerIndexToLetter(quizAnswers[2]),
      q4Answer: answerIndexToLetter(quizAnswers[3]),
      q5Answer: answerIndexToLetter(quizAnswers[4]),
    };

    setResults((previous) => [...previous, quizResult]);

    setQuizSubmitted(true);

    console.log("Quiz result:", quizResult);
  }

  function continueAfterQuiz() {
    const isLastCondition = conditionIndex === 1;

    if (isLastCondition) {
      setShowQuiz(false);
      setFinished(true);
      return;
    }

    setConditionIndex((previous) => previous + 1);

    setShowInstructions(true);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);

    setPromptTimes([]);
    setTriggeredPrompts([]);
    setPromptAnswer(null);
    setShowPrompt(false);
    setCurrentPromptIndex(null);
  }

  function escapeCsvValue(value) {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  function downloadResults() {
    if (results.length === 0) {
      alert("No results to download.");
      return;
    }

    const columns = [
      "type",
      "participantId",
      "group",
      "conditionNumber",
      "video",
      "videoTitle",
      "speed",

      "videoDuration",
      "prompt1Scheduled",
      "prompt2Scheduled",
      "prompt3Scheduled",
      "prompt4Scheduled",

      "promptNumber",
      "scheduledPromptTime",
      "actualPromptTime",
      "mindWandering",
      "related",

      "score",
      "q1Answer",
      "q2Answer",
      "q3Answer",
      "q4Answer",
      "q5Answer",
    ];

    const header = columns.join(",");

    const rows = results.map((result) =>
      columns
        .map((column) => escapeCsvValue(result[column]))
        .join(",")
    );

    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${participantId}_results.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  if (finished) {
    return (
      <div className="app">
        <div className="card">
          <h1>Experiment completed</h1>

          <p>Thank you for participating.</p>

          <button onClick={downloadResults}>
            Download results
          </button>
        </div>
      </div>
    );
  }

  if (started && showQuiz) {
    return (
      <div className="app">
        <div className="quiz-container">
          <h1>Comprehension Quiz</h1>

          <p>{currentCondition.title}</p>

          {!quizSubmitted ? (
            <>
              {currentQuestions.map(
                (question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="quiz-question"
                  >
                    <h3>
                      {questionIndex + 1}.{" "}
                      {question.question}
                    </h3>

                    {question.options.map(
                      (option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="quiz-option"
                        >
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            checked={
                              quizAnswers[
                                questionIndex
                              ] === optionIndex
                            }
                            onChange={() =>
                              handleQuizAnswer(
                                questionIndex,
                                optionIndex
                              )
                            }
                          />

                          {option}
                        </label>
                      )
                    )}
                  </div>
                )
              )}

              <button
                onClick={submitQuiz}
                disabled={
                  Object.keys(quizAnswers).length !==
                  currentQuestions.length
                }
              >
                Submit quiz
              </button>
            </>
          ) : (
            <div>
              <h2>Quiz completed</h2>

              <p>Your responses have been recorded.</p>

              <button onClick={continueAfterQuiz}>
                {conditionIndex === 1
                  ? "Finish experiment"
                  : "Continue to next video"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (started && showInstructions) {
    return (
      <div className="app">
        <div className="card">
          <h1>Video {conditionIndex + 1} of 2</h1>

          <h2>{currentCondition.title}</h2>

          <p>Please watch the entire video carefully.</p>

          <p>
            During the video, you will occasionally be asked
            whether you were mind-wandering.
          </p>

          <p>
            Please do not take notes, skip forward or backward,
            or change the playback speed.
          </p>

          <p>
            After the video, you will complete a short
            comprehension quiz.
          </p>

          <button
            onClick={() => setShowInstructions(false)}
          >
            Start video
          </button>
        </div>
      </div>
    );
  }

  if (started) {
    return (
      <div className="app">
        <div className="video-container">
          <h1>{currentCondition.title}</h1>

          <p>Participant: {participantId}</p>

          <p>Condition {conditionIndex + 1} of 2</p>

          <video
            key={`${currentCondition.id}-${conditionIndex}`}
            ref={videoRef}
            src={currentCondition.video}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
          />

          {showPrompt && (
            <div className="prompt-overlay">
              <div className="prompt-box">
                {!promptAnswer && (
                  <>
                    <h2>
                      Mind-wandering prompt{" "}
                      {currentPromptIndex + 1}
                    </h2>

                    <p>
                      {currentPromptIndex === 0
                        ? "Did you mind-wander so far?"
                        : "Did you mind-wander since the last prompt?"}
                    </p>

                    <button
                      onClick={() => setPromptAnswer("yes")}
                    >
                      Yes
                    </button>

                    <button
                      onClick={() =>
                        savePromptResponse(false)
                      }
                    >
                      No
                    </button>
                  </>
                )}

                {promptAnswer === "yes" && (
                  <>
                    <h2>Mind-wandering</h2>

                    <p>
                      Were your thoughts related or unrelated to
                      the lecture?
                    </p>

                    <button
                      onClick={() =>
                        savePromptResponse(
                          true,
                          "related"
                        )
                      }
                    >
                      Related to the lecture
                    </button>

                    <button
                      onClick={() =>
                        savePromptResponse(
                          true,
                          "unrelated"
                        )
                      }
                    >
                      Unrelated to the lecture
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="card">
        <h1>Playback Speed Experiment</h1>

        <label>
          Participant ID
          <input
            type="text"
            value={participantId}
            onChange={(e) =>
              setParticipantId(e.target.value)
            }
            placeholder="e.g. P01"
          />
        </label>

        <label>
          Experimental group
          <select
            value={group}
            onChange={(e) =>
              setGroup(e.target.value)
            }
          >
            <option value="group1">
              Group 1
            </option>

            <option value="group2">
              Group 2
            </option>
          </select>
        </label>

        <button
          onClick={() => {
            setStarted(true);
            setShowInstructions(true);
          }}
          disabled={!participantId.trim()}
        >
          Start experiment
        </button>
      </div>
    </div>
  );
}

export default App;
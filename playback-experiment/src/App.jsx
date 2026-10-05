import { useRef, useState } from "react";
import "./App.css";

// Number of comprehension questions per video (used for the CSV columns).
const QUIZ_QUESTION_COUNT = 10;

// Test mode: open the app with ?test in the URL
// (e.g. http://localhost:5173/?test) to get a "Skip to next probe"
// button. Dragging the progress bar is still blocked, so the button
// is the only way to skip. Participants never see this.
const TEST_MODE = new URLSearchParams(window.location.search).has("test");

// Post-experiment questionnaire (free-text answers, saved to the results CSV).
const QUESTIONNAIRE = [
  {
    id: "playbackSpeedFocus",
    title: "1. Playback speed & focus",
    prompt:
      "How did the two playback speeds (1.0x and 1.5x) feel to you? Did one speed make it easier or harder to maintain focus?",
  },
  {
    id: "mindWanderingTriggers",
    title: "2. Mind-wandering triggers",
    prompt:
      "When you caught your mind wandering, what do you feel triggered it? (e.g., video speed, topic interest, external distractions, internal thoughts)",
  },
  {
    id: "popupProbes",
    title: "3. Pop-up probes",
    prompt:
      "Did the on-screen pop-up questions disrupt your concentration or alter how you watched the videos?",
  },
  {
    id: "studyConstraints",
    title: "4. Study constraints",
    prompt:
      "How did the requirement to watch without pausing or taking notes affect how you tried to pay attention?",
  },
];

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

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});

  const [finished, setFinished] = useState(false);

  // State for the custom video controls (the browser's own controls are
  // hidden so participants can't drag the progress bar).
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoTime, setVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const videoRef = useRef(null);

  // Furthest point the participant has legitimately watched to.
  // Used to stop them seeking forward (which would skip probes)
  // or backward (which would let them re-watch).
  const maxWatchedTimeRef = useRef(0);

  // Probes already shown for the current video. Kept in a ref (not just
  // state) because the browser can fire several timeupdate events before
  // React re-renders, which previously recorded the same probe twice.
  const triggeredRef = useRef(new Set());
  const promptOpenRef = useRef(false);

  // Test mode: true after "Skip" is clicked, until that probe is answered.
  const [skipPending, setSkipPending] = useState(false);

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
    {
      question:
        "Where were the participants for the study originally recruited?",
      options: [
        "Cambridge & Boston",
        "Boston & New York City",
        "Lowell & Springfield",
        "Springfield & Boston",
      ],
      correctAnswer: 0,
    },
    {
      question:
        "What is one reason that studies like this are rare?",
      options: [
        "No public interest in studies that follow one person for their lifetime",
        "Participants not willing to participate in a study for their lifetime",
        "Funding for the research dries up",
        "Researchers with the necessary expertise are unavailable",
      ],
      correctAnswer: 2,
    },
    {
      question:
        "Which decade did the study begin?",
      options: [
        "1920s",
        "1930s",
        "1940s",
        "1950s",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "Is the study qualitative or quantitative or mixed methods?",
      options: [
        "Qualitative",
        "Quantitative",
        "Mixed Methods",
        "None of the Above",
      ],
      correctAnswer: 2,
    },
    {
      question:
        "What year was this video posted?",
      options: [
        "2010",
        "2015",
        "2020",
        "2025",
      ],
      correctAnswer: 1,
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
    {
      question:
        "How did Faith realize that her observational skill\u2014noticing body language, micro-expressions, and tonal shifts\u2014was actually a symptom of complex post-traumatic stress?",
      options: [
        "A therapist diagnosed her during a hypnotherapy session.",
        "Her supervisor noticed her detailed meeting notes during a temp job.",
        "She analyzed her own hypervigilance while shadowing research subjects.",
        "She realized it after attempting the live honeybee acupuncture treatment.",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "During her interaction with the vaccine-hesitant research participant, what specific technique enabled Faith to access \"unconditional welcome\" when standard researcher neutrality failed?",
      options: [
        "Offering a compassionate verbal validation before asking about her childhood.",
        "Visualizing an inflating soap bubble around both of them using New Age techniques.",
        "Silencing her internal judgment by ignoring the woman's cigarette ash and fries.",
        "Reciting her morning focus group opening script out loud.",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "According to the transcript, how does Faith's closing statement to her internal \"selves\" differ from how she closes an actual focus group?",
      options: [
        "She offers parking validation and cash signatures to her focus group, but expresses love and gratitude to her internal selves.",
        "She asks the focus group for feedback, but sets strict boundary agreements with her internal selves.",
        "She closes the focus group with silence, but uses a New Age breathing technique with her internal selves.",
        "She thanks the focus group for being present, but reminds her internal selves to make reasonable requests.",
      ],
      correctAnswer: 0,
    },
    {
      question:
        "Which treatment or therapy did Karen Faith explicitly state she passed on (did not try)?",
      options: [
        "Soul retrieval",
        "Live honeybee acupuncture",
        "Drinking special tea with a shaman",
        "Hypnotherapy",
      ],
      correctAnswer: 1,
    },
    {
      question:
        "According to Faith, how should someone understand the intention behind their negative or \"whiny, shamey\" inner voice?",
      options: [
        "It is an irrational cognitive distortion that needs to be systematically silenced and replaced.",
        "It is a symptom of trauma that functions solely to sabotage personal progress.",
        "It is trying to help in its own weird way and can reveal what it needs to feel better if accepted in the moment.",
        "It represents a fundamental flaw in character that can only be resolved through professional therapy.",
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
    video.volume = volume;
    maxWatchedTimeRef.current = 0;
    setVideoDuration(video.duration);
    setVideoTime(0);
    setIsPlaying(false);
    triggeredRef.current = new Set();
    promptOpenRef.current = false;
    setSkipPending(false);

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

    if (!video) return;

    setVideoTime(video.currentTime);

    // Never trigger probes in the middle of a seek.
    if (video.seeking) return;

    if (!video.seeking) {
      maxWatchedTimeRef.current = Math.max(
        maxWatchedTimeRef.current,
        video.currentTime
      );
    }

    if (promptOpenRef.current) return;

    for (let index = 0; index < promptTimes.length; index++) {
      const promptTime = promptTimes[index];
      const alreadyTriggered = triggeredRef.current.has(index);

      if (!alreadyTriggered && video.currentTime >= promptTime) {
        video.pause();

        triggeredRef.current.add(index);
        promptOpenRef.current = true;

        setTriggeredPrompts([...triggeredRef.current]);

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
    promptOpenRef.current = false;
    setSkipPending(false);

    // If the video has already reached the end, go to the quiz
    // instead of calling play(), which would restart the video
    // from the beginning.
    if (video.ended) {
      goToQuiz();
      return;
    }

    video.play();
  }

  function goToQuiz() {
    setShowQuiz(true);
    setQuizAnswers({});
    setQuizSubmitted(false);
  }

  function handleVideoEnded() {
    // A probe is still waiting for an answer: let the participant
    // answer it first. savePromptResponse() then moves on to the quiz.
    if (promptOpenRef.current) return;

    goToQuiz();
  }

  function handleSeeking() {
    const video = videoRef.current;

    if (!video) return;

    const allowedTime = maxWatchedTimeRef.current;

    // Small tolerance so normal playback isn't affected.
    if (Math.abs(video.currentTime - allowedTime) > 1) {
      video.currentTime = allowedTime;
    }
  }

  // Test mode only: jump to 2 seconds before the next probe
  // (or near the end once all probes are done).
  function skipToNextProbe() {
    const video = videoRef.current;

    if (!video || skipPending || promptOpenRef.current) return;

    setSkipPending(true);

    const nextIndex = promptTimes.findIndex(
      (_, index) => !triggeredRef.current.has(index)
    );

    const target =
      nextIndex === -1
        ? video.duration - 2
        : promptTimes[nextIndex] - 2;

    const newTime = Math.max(target, video.currentTime);

    // Allow this jump past the seek block before moving the video.
    maxWatchedTimeRef.current = newTime;
    video.currentTime = newTime;
    video.play();
  }

  function togglePlay() {
    const video = videoRef.current;

    if (!video || promptOpenRef.current) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function handleVolumeChange(e) {
    const newVolume = Number(e.target.value);

    setVolume(newVolume);

    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }

  function formatClock(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  function handleRateChange() {
    const video = videoRef.current;

    if (video && video.playbackRate !== currentCondition.speed) {
      video.playbackRate = currentCondition.speed;
    }
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
      ...Object.fromEntries(
        currentQuestions.map((_, index) => [
          `q${index + 1}Answer`,
          answerIndexToLetter(quizAnswers[index]),
        ])
      ),
    };

    setResults((previous) => [...previous, quizResult]);

    setQuizSubmitted(true);

    console.log("Quiz result:", quizResult);
  }

  function continueAfterQuiz() {
    const isLastCondition = conditionIndex === 1;

    if (isLastCondition) {
      setShowQuiz(false);
      setShowQuestionnaire(true);
      return;
    }

    setConditionIndex((previous) => previous + 1);

    setShowInstructions(true);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);

    setPromptTimes([]);
    setTriggeredPrompts([]);
    triggeredRef.current = new Set();
    promptOpenRef.current = false;
    setSkipPending(false);
    setPromptAnswer(null);
    setShowPrompt(false);
    setCurrentPromptIndex(null);
  }

  function submitQuestionnaire() {
    const questionnaireResult = {
      type: "questionnaire",
      participantId,
      group,
      ...Object.fromEntries(
        QUESTIONNAIRE.map((item) => [
          item.id,
          (questionnaireAnswers[item.id] || "").trim(),
        ])
      ),
    };

    setResults((previous) => [...previous, questionnaireResult]);

    console.log("Questionnaire result:", questionnaireResult);

    setShowQuestionnaire(false);
    setFinished(true);
  }

  function escapeCsvValue(value) {
    if (value === null || value === undefined) {
      return "";
    }

    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n") ||
      stringValue.includes("\r")
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
      ...Array.from(
        { length: QUIZ_QUESTION_COUNT },
        (_, index) => `q${index + 1}Answer`
      ),

      ...QUESTIONNAIRE.map((item) => item.id),
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

  if (started && showQuestionnaire) {
    const allAnswered = QUESTIONNAIRE.every(
      (item) => (questionnaireAnswers[item.id] || "").trim() !== ""
    );

    return (
      <div className="app">
        <div className="quiz-container">
          <h1>Your Experience</h1>

          <p>
            Thank you for completing both video sessions! Please
            take a moment to share your experience below. Your
            honest feedback is invaluable for our research.
          </p>

          {QUESTIONNAIRE.map((item) => (
            <div key={item.id} className="quiz-question">
              <h3>{item.title}</h3>

              <label
                htmlFor={`questionnaire-${item.id}`}
                className="questionnaire-prompt"
              >
                {item.prompt}
              </label>

              <textarea
                id={`questionnaire-${item.id}`}
                className="questionnaire-answer"
                rows={4}
                value={questionnaireAnswers[item.id] || ""}
                onChange={(e) =>
                  setQuestionnaireAnswers((previous) => ({
                    ...previous,
                    [item.id]: e.target.value,
                  }))
                }
              />
            </div>
          ))}

          <button
            onClick={submitQuestionnaire}
            disabled={!allAnswered}
          >
            Submit and finish
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
                  ? "Continue to final questions"
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
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            onClick={togglePlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onSeeking={handleSeeking}
            onRateChange={handleRateChange}
            onEnded={handleVideoEnded}
          />

          <div className="video-controls">
            <button
              className="play-button"
              onClick={togglePlay}
              disabled={showPrompt}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>

            {/* Display only: participants can't click or drag this. */}
            <div className="progress-track" aria-hidden="true">
              <div
                className="progress-fill"
                style={{
                  width: videoDuration
                    ? `${(videoTime / videoDuration) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <span className="video-clock">
              {formatClock(videoTime)} / {formatClock(videoDuration)}
            </span>

            <label className="volume-control">
              Volume
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
              />
            </label>
          </div>

          {TEST_MODE && (
            <div className="test-mode-bar">
              <strong>TEST MODE</strong>
              <button
                onClick={skipToNextProbe}
                disabled={skipPending || showPrompt}
              >
                {triggeredPrompts.length < promptTimes.length
                  ? skipPending
                    ? "Waiting for probe..."
                    : `Skip to probe ${triggeredPrompts.length + 1}`
                  : skipPending
                    ? "Skipping to end..."
                    : "Skip to end of video"}
              </button>
            </div>
          )}

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

        {TEST_MODE && (
          <p className="test-mode-note">
            Test mode is on. Don't use this for real participants.
          </p>
        )}

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
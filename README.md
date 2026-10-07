# Playback Speed Experiment

This README contains the information needed to install, run, and quickly demo the implementation.

## Quick Overview

The application is a React/Vite web application for a two-condition video experiment. It:

- plays two local videos;
- automatically applies either 1.0x or 1.5x playback speed;
- uses two counterbalanced groups;
- pauses each video four times for randomized mind-wandering prompts;
- asks whether reported mind-wandering was related or unrelated to the lecture;
- presents a 10-question comprehension quiz after each video; and
- exports the recorded data as a CSV file.
- Asks four-question post-experiment feedback questions.

## Online Version 
The application is currently hosted online on this domain: https://compsci-705-project.vercel.app/

## System Requirements

- Windows 10/11, macOS, or equivalent desktop operating system
- Node.js
- npm
- A modern browser such as Google Chrome, Microsoft Edge, or Firefox


## Required Project Files

The project should contain at least:

```text
playback-experiment/
├── src/
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── public/
│   └── videos/
│       ├── video1.mp4
│       └── video2.mp4
├── package.json
├── package-lock.json
└── vite.config.js
```

Download the videos from Google Drive:

### Video 1

**What Makes a Good Life? Lessons from the Longest Study on Happiness**  
Robert Waldinger

[Download Video 1](https://drive.google.com/file/d/19K0lK-Nd5qEqWCBlIbtPSlfJnES90wEB/view?usp=sharing)

### Video 2

**How to Talk to the Worst Parts of Yourself**  
Karen Faith

[Download Video 2](https://drive.google.com/file/d/1Tn4FLzQcqpaz4qTXzWXF9TApDxOCfsvH/view?usp=sharing)

After downloading the videos, place them in:

```text
public/videos/
```

## The path to the videos
If you run the app locally you have to change the path to the videos in App.jsx to the local folder: "videos/video1.mp4" and "videos/video2.mp4"

## Install

Open a terminal in the project folder and run:

```bash
npm install
```

All JavaScript dependencies are defined in `package.json` and `package-lock.json`.

## Run

Start the application with:

```bash
npm run dev
```

Vite will display a local address, usually:

```text
http://localhost:5173/
```

Open that address in a browser and keep the terminal running while using the application.

## Production Build

To create a production build:

```bash
npm run build
```

The compiled output will be created in:

```text
dist/
```

To preview the production build locally:

```bash
npm run preview
```

## Quick Demo

1. Run the application with `npm run dev`.
2. Open the localhost address shown by Vite.
3. Enter a test participant ID such as `TEST01`.
4. Select `Group 1`.
5. Click **Start experiment**.
6. Read the instruction screen and click **Start video**.
7. Promp answers:
   - **No** - the response is saved and the video resumes.
   - **Yes -> Related to the lecture** - the response is saved and the video resumes.
   - **Yes -> Unrelated to the lecture** - the response is saved and the video resumes.
8. Move close to the end of the video and allow it to finish.
9. Complete the 10-question quiz.
10. Continue to the second video and repeat.
11. Finish the experiment.
12. Click **Download results**.
13. A file such as `TEST01_results.csv` is downloaded.

For a complete description of the implementation, experiment preparation, data output, design decisions, limitations, and testing, see `Implementation_Documentation.docx`.

const quizData = [
    { q: "Which of the following is a classic example of an IoT device?", options: ["A calculator", "A smart refrigerator", "A non-connected desk lamp", "A standard analog watch"], correct: 1 },
    { q: "What is a common security risk for IoT devices?", options: ["High battery life", "Using default passwords like 'admin'", "Automatic software updates", "Too much encryption"], correct: 1 },
    { q: "To improve IoT security, users should:", options: ["Disable all Wi-Fi", "Share passwords with neighbors", "Keep firmware updated", "Keep default factory settings"], correct: 2 },
    { q: "A firewall acts like a:", options: ["Computer battery", "Security guard at a door", "Cleaning tool", "Search engine"], correct: 1 },
    { q: "Which type of firewall protects an entire network from the router?", options: ["Software Firewall", "Hardware Firewall", "Virtual Firewall", "Application Firewall"], correct: 1 },
    { q: "Converting data into a secret form for security is called:", options: ["Encoding", "Decoding", "Encryption", "Compressing"], correct: 2 },
    { q: "What is the difference between Authentication and Authorization?", options: ["They are exactly the same.", "Authentication is 'Who are you?'; Authorization is 'What can you do?'", "Authentication is for hardware; Authorization is for software.", "Both are types of firewalls."], correct: 1 },
    { q: "Why do computers use binary (0s and 1s)?", options: ["To make it harder for humans to read.", "Because computers only understand electronic signals (on/off).", "To save electricity.", "Because images cannot be stored."], correct: 1 },
    { q: "Which of these is a text encoding standard?", options: ["MP3", "JPEG", "Unicode", "AVI"], correct: 2 },
    { q: "Encoding is NOT Encryption. Why?", options: ["Encoding is for security.", "Encoding is for compatibility/format; Encryption is for secrecy.", "Encryption is faster than encoding.", "Encoding uses passwords."], correct: 1 },
    { q: "Software 'deteriorates' instead of 'wearing out' because:", options: ["It gets rusty.", "It collects design flaws and update errors over time.", "The physical disk breaks.", "Software is built on an assembly line."], correct: 1 },
    { q: "What does 'Modular' software mean?", options: ["It is very expensive.", "It is made of independent units that can be tested separately.", "It cannot be changed.", "It is invisible."], correct: 1 },
    { q: "Which factor refers to the relationship between time and cost in development?", options: ["Project Complexity", "Team Expertise", "Time & Budget", "User Involvement"], correct: 2 },
    { q: "What is the first step of the SDLC?", options: ["Coding", "Testing", "Planning & Analysis", "Deployment"], correct: 2 },
    { q: "In which SDLC phase are 'bugs' (errors) found and fixed?", options: ["Design", "Testing", "Maintenance", "Deployment"], correct: 1 },
    { q: "Which model is best for a fast-paced startup that welcomes change?", options: ["Waterfall", "Agile", "V-Model", "Spiral"], correct: 1 },
    { q: "The Spiral Model is primarily focused on:", options: ["Speed", "Low cost", "Risk Analysis", "Linear progress"], correct: 2 },
    { q: "In HCI, what does 'UX' stand for?", options: ["User Integration", "User Experience", "Universal X-ray", "User Exit"], correct: 1 },
    { q: "Ensuring that people with disabilities can use software is called:", options: ["Consistency", "Accessibility", "Encoding", "Modularization"], correct: 1 },
    { q: "What is the first step in solving a development exercise?", options: ["Writing code", "Problem Analysis (What is the input/output?)", "Documentation", "Selling the app"], correct: 1 }
];

const scenarios = [
    { title: "Smart Pet Feeder", desc: "An IoT device that feeds cats via a mobile app." },
    { title: "School Library App", desc: "A system to track borrowed books and student IDs." },
    { title: "Smart Hospital Bed", desc: "Sensors that monitor patient heart rates and send alerts." },
    { title: "Weather Drone", desc: "A drone that collects humidity data and sends it to a server." },
    { title: "Smart Parking", desc: "Sensors in the ground that show free spots on a city map." }
];

let userData = { fname: "", lname: "", classInfo: "" };
let currentQ = 0;
let mcqScore = 0;
let sessionResults = [];
let totalStartTime, questionStartTime;
let timerInterval;
let selectedScenario = null;

const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const resultScreen = document.getElementById('result-screen');

document.getElementById('start-btn').onclick = startQuiz;
document.getElementById('next-btn').onclick = nextQuestion;
document.getElementById('submit-scenario-btn').onclick = finishQuiz;

function startQuiz() {
    userData.fname = document.getElementById('fname').value.trim();
    userData.lname = document.getElementById('lname').value.trim();
    userData.classInfo = document.getElementById('class-info').value.trim();

    if (!userData.fname || !userData.lname || !userData.classInfo) {
        alert("Please fill in all fields!");
        return;
    }

    loginScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    
    totalStartTime = Date.now();
    loadQuestion();
}

function loadQuestion() {
    const q = quizData[currentQ];
    document.getElementById('q-count').innerText = `${currentQ + 1}/${quizData.length}`;
    document.getElementById('question-text').innerText = q.q;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => selectOption(i, btn);
        grid.appendChild(btn);
    });

    document.getElementById('next-btn').classList.add('hidden');
    questionStartTime = Date.now();
    startTimer();
}

function startTimer() {
    clearInterval(timerInterval);
    let sec = 0;
    document.getElementById('q-timer').innerText = '0s';
    timerInterval = setInterval(() => {
        sec++;
        document.getElementById('q-timer').innerText = sec + 's';
    }, 1000);
}

function selectOption(index, btn) {
    const all = document.querySelectorAll('.option-btn');
    all.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    sessionResults[currentQ] = {
        selected: index,
        timeSpent: Math.round((Date.now() - questionStartTime) / 1000)
    };
    
    document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
    if (sessionResults[currentQ].selected === quizData[currentQ].correct) {
        mcqScore += 4;
    }

    currentQ++;
    if (currentQ < quizData.length) {
        loadQuestion();
    } else {
        showScenario();
    }
}

function showScenario() {
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    scenarioScreen.classList.remove('hidden');
    
    selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    document.getElementById('scenario-title').innerText = "Chosen Scenario: " + selectedScenario.title;
    document.getElementById('scenario-desc').innerText = selectedScenario.desc;
}

function finishQuiz() {
    const secAns = document.getElementById('ans-security').value.trim();
    const sdlcAns = document.getElementById('ans-sdlc').value.trim();
    const hciAns = document.getElementById('ans-hci').value.trim();

    if (!secAns || !sdlcAns || !hciAns) {
        alert("Please answer all scenario questions!");
        return;
    }

    scenarioScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const totalTime = Math.round((Date.now() - totalStartTime) / 1000);

    // Update UI Summary
    document.getElementById('final-score').innerText = mcqScore + " / 80 (MCQ Part)";
    document.getElementById('correct-count').innerText = `${mcqScore/4}/${quizData.length}`;
    document.getElementById('total-time').innerText = totalTime + 's';

    // Build Detailed Table
    const tbody = document.getElementById('details-body');
    tbody.innerHTML = '';
    
    const detailedData = quizData.map((q, i) => {
        const res = sessionResults[i];
        const isCorrect = res.selected === q.correct;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i+1}</td>
            <td><span class="badge ${isCorrect ? 'badge-success' : 'badge-error'}">${isCorrect ? 'Correct' : 'Incorrect'}</span></td>
            <td>${q.options[res.selected]}</td>
            <td>${res.timeSpent}s</td>
        `;
        tbody.appendChild(tr);

        return {
            question: q.q,
            userAnswer: q.options[res.selected],
            isCorrect: isCorrect,
            time: res.timeSpent
        };
    });

    const scenarioAnswers = {
        title: selectedScenario.title,
        security: secAns,
        sdlc: sdlcAns,
        hci: hciAns
    };

    saveToDatabase(mcqScore, totalTime, detailedData, scenarioAnswers);
}

function saveToDatabase(scorePerc, totalTime, detailedData, scenarioAnswers) {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        const db = firebase.database();
        const newEntryRef = db.ref('quiz_results').push();
        newEntryRef.set({
            user: userData,
            mcqScore: scorePerc,
            totalScore: scorePerc, // Starts as MCQ score only
            scenarioScore: 0,
            isGraded: false,
            totalTime: totalTime,
            details: detailedData,
            scenario: scenarioAnswers,
            timestamp: new Date().toISOString()
        }).then(() => console.log("Data saved to Firebase"));
    }
}



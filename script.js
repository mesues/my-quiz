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
let sessionResults = Array(quizData.length).fill(null);
let totalStartTime;
let timerInterval;
let selectedScenario = null;

const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const resultScreen = document.getElementById('result-screen');

document.getElementById('start-btn').onclick = startQuiz;
document.getElementById('prev-btn').onclick = function() { 
    if(currentQ > 0) { currentQ--; loadQuestion(); } 
};
document.getElementById('next-btn').onclick = function() { 
    if(currentQ < quizData.length - 1) { currentQ++; loadQuestion(); } 
    else { showScenario(); } 
};
document.getElementById('submit-scenario-btn').onclick = finishQuiz;

function startQuiz() {
    userData.fname = document.getElementById('fname').value.trim();
    userData.lname = document.getElementById('lname').value.trim();
    userData.classInfo = document.getElementById('class-info').value.trim();
    if (!userData.fname || !userData.lname || !userData.classInfo) { alert("Please fill in all fields!"); return; }
    loginScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    totalStartTime = Date.now();
    loadQuestion();
    startGlobalTimer();
}

function startGlobalTimer() {
    let sec = 0;
    timerInterval = setInterval(() => {
        sec++;
        document.getElementById('q-timer').innerText = sec + 's';
    }, 1000);
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
        if(sessionResults[currentQ] && sessionResults[currentQ].selected === i) btn.classList.add('selected');
        btn.innerText = opt;
        btn.onclick = () => selectOption(i);
        grid.appendChild(btn);
    });
}

function selectOption(index) {
    sessionResults[currentQ] = { selected: index };
    loadQuestion();
    setTimeout(() => {
        if(currentQ < quizData.length - 1) {
            currentQ++;
            loadQuestion();
        } else {
            showScenario();
        }
    }, 300);
}

function showScenario() {
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    scenarioScreen.classList.remove('hidden');
    selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    document.getElementById('scenario-title').innerText = "Scenario: " + selectedScenario.title;
    document.getElementById('scenario-desc').innerText = selectedScenario.desc;
}

function getGrade(score) {
    if (score <= 10) return 4;
    if (score <= 15) return 5;
    if (score <= 20) return 6;
    if (score <= 25) return 7;
    if (score <= 30) return 8;
    if (score <= 36) return 9;
    return 10;
}

function finishQuiz() {
    const scenarioAns = {
        title: selectedScenario.title,
        security: document.getElementById('ans-security').value.trim(),
        sdlc: document.getElementById('ans-sdlc').value.trim(),
        hci: document.getElementById('ans-hci').value.trim()
    };

    if(!scenarioAns.security || !scenarioAns.sdlc || !scenarioAns.hci) { 
        alert("Please complete Scenario questions!"); 
        return; 
    }

    scenarioScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    let correctCount = 0;
    const detailedData = quizData.map((q, i) => {
        const userSel = sessionResults[i] ? sessionResults[i].selected : -1;
        const isCorrect = userSel === q.correct;
        if(isCorrect) correctCount++;
        return {
            question: q.q,
            options: q.options,
            userAnswer: userSel !== -1 ? q.options[userSel] : "No Answer",
            correctAnswer: q.options[q.correct],
            isCorrect: isCorrect
        };
    });

    const mcqScore = correctCount * 1.5;
    const currentGrade = getGrade(mcqScore);
    const totalTime = Math.round((Date.now() - totalStartTime) / 1000);

    document.getElementById('final-score').innerText = mcqScore + " (Grade: " + currentGrade + ")";
    document.getElementById('total-time').innerText = totalTime + 's';

    saveToDatabase(mcqScore, currentGrade, totalTime, detailedData, scenarioAns);
}

function saveToDatabase(mcqScore, currentGrade, totalTime, details, scenario) {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        firebase.database().ref('quiz_results').push({
            user: userData,
            mcqScore: mcqScore,
            totalScore: mcqScore, 
            mcqGrade: currentGrade,
            totalGrade: currentGrade,
            scenarioScore: 0,
            isGraded: false,
            totalTime: totalTime,
            details: details,
            scenario: scenario,
            timestamp: new Date().toISOString()
        }).then(() => {
            console.log("Results successfully saved.");
        }).catch((err) => {
            console.error("Error saving results:", err);
        });
    }
}

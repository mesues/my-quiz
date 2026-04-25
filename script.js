let quizData = [];
let scenarios = [];
let userData = { fname: "", lname: "", classInfo: "" };
let currentQ = 0;
let sessionResults = {}; // Object to store answers by original question index
let totalStartTime;
let timerInterval;
let selectedScenario = null;
let displayOrder = []; // Array of shuffled question indices

// Helper to shuffle any array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initApp() {
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
        alert("System Configuration Error. Please contact teacher.");
        return;
    }
    const db = firebase.database();
    
    // Fetch Questions and Scenarios
    db.ref('questions').once('value').then(snap => { 
        quizData = snap.val(); 
        // Create an array [0, 1, 2, ... 19] and shuffle it
        displayOrder = shuffle([...Array(quizData.length).keys()]);
    });
    db.ref('scenarios').once('value').then(snap => { scenarios = snap.val(); });
}

const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const resultScreen = document.getElementById('result-screen');
const examHeader = document.getElementById('exam-header');

[document.getElementById('fname'), document.getElementById('lname'), document.getElementById('class-info')].forEach(el => {
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter') startQuiz(); });
});

document.getElementById('start-btn').onclick = startQuiz;
document.getElementById('prev-btn').onclick = () => { if(currentQ > 0) { currentQ--; loadQuestion(); } };
document.getElementById('next-btn').onclick = () => { if(currentQ < quizData.length - 1) { currentQ++; loadQuestion(); } else { showScenario(); } };
document.getElementById('submit-scenario-btn').onclick = finishQuiz;

function startQuiz() {
    userData.fname = document.getElementById('fname').value.trim();
    userData.lname = document.getElementById('lname').value.trim();
    userData.classInfo = document.getElementById('class-info').value.trim();

    if (!userData.fname || !userData.lname || !userData.classInfo || quizData.length === 0) {
        alert("Loading exam data, please wait a second...");
        return;
    }

    document.getElementById('header-student-name').innerText = userData.fname + " " + userData.lname;
    document.getElementById('header-class').innerText = userData.classInfo;
    
    loginScreen.classList.add('hidden');
    examHeader.classList.remove('hidden');
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
    const originalIndex = displayOrder[currentQ]; // Get the real question ID
    const q = quizData[originalIndex];
    
    document.getElementById('q-count').innerText = `${currentQ + 1}/${quizData.length}`;
    document.getElementById('question-text').innerText = q.q;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    // Create option objects that remember their original index
    let optionsWithMeta = q.options.map((opt, idx) => ({ text: opt, originalIdx: idx }));
    
    // Shuffle the options visually
    shuffle(optionsWithMeta);

    optionsWithMeta.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        
        // Check if student already answered THIS original question with THIS original option index
        if(sessionResults[originalIndex] === opt.originalIdx) {
            btn.classList.add('selected');
        }
        
        btn.innerText = opt.text;
        btn.onclick = () => selectOption(originalIndex, opt.originalIdx);
        grid.appendChild(btn);
    });
}

function selectOption(qIdx, optIdx) {
    sessionResults[qIdx] = optIdx; // Store answer against original question ID
    loadQuestion();
    
    setTimeout(() => {
        if(currentQ < quizData.length - 1) {
            currentQ++;
            loadQuestion();
        } else {
            showScenario();
        }
    }, 400);
}

function showScenario() {
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    scenarioScreen.classList.remove('hidden');
    selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    document.getElementById('scenario-title').innerText = "Scenario: " + selectedScenario.title;
    document.getElementById('scenario-desc').innerText = selectedScenario.desc;
}

function finishQuiz() {
    const scenarioAns = {
        title: selectedScenario.title,
        security: document.getElementById('ans-security').value.trim(),
        sdlc: document.getElementById('ans-sdlc').value.trim(),
        hci: document.getElementById('ans-hci').value.trim()
    };
    if(!scenarioAns.security || !scenarioAns.sdlc || !scenarioAns.hci) { alert("Please complete scenario!"); return; }

    scenarioScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const totalTime = Math.round((Date.now() - totalStartTime) / 1000);

    // CRITICAL: Remap the results to original 0-19 order for the Admin panel
    const finalChoices = quizData.map((q, i) => ({
        question: q.q,
        options: q.options,
        userAnswerIndex: sessionResults[i] !== undefined ? sessionResults[i] : -1
    }));

    saveToDatabase(totalTime, finalChoices, scenarioAns);
}

function saveToDatabase(totalTime, choices, scenario) {
    firebase.database().ref('quiz_results').push({
        user: userData,
        totalTime: totalTime,
        studentChoices: choices, 
        scenario: scenario,
        isGraded: false,
        timestamp: new Date().toISOString()
    });
}

window.onload = initApp;

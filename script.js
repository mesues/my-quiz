let quizData = [];
let scenarios = [];
let userData = { fname: "", lname: "", classInfo: "" };
let currentQ = 0;
let sessionResults = {}; 
let totalStartTime;
let timerInterval;
let selectedScenario = null;

// Pre-shuffled data for the session
let displayOrder = []; // [qIdx, qIdx, ...]
let optionShuffles = {}; // { qIdx: [optIdx, optIdx, ...] }

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initApp() {
    if (typeof firebase === 'undefined' || firebase.apps.length === 0) {
        alert("Configuration Error.");
        return;
    }
    const db = firebase.database();
    db.ref('questions').once('value').then(snap => { quizData = snap.val(); });
    db.ref('scenarios').once('value').then(snap => { scenarios = snap.val(); });
}

const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const scenarioScreen = document.getElementById('scenario-screen');
const resultScreen = document.getElementById('result-screen');
const examHeader = document.getElementById('exam-header');

document.getElementById('start-btn').onclick = startQuiz;
document.getElementById('prev-btn').onclick = () => { if(currentQ > 0) { currentQ--; loadQuestion(); } };
document.getElementById('next-btn').onclick = () => { 
    if(currentQ < quizData.length - 1) { 
        currentQ++; loadQuestion(); 
    } else { 
        confirmScenarioTransition(); 
    } 
};
document.getElementById('submit-scenario-btn').onclick = finishQuiz;

function confirmScenarioTransition() {
    const msg = "You are about to finish the Multiple Choice section and move to the Scenario Task.\n\n" +
                "Please review your answers now using the 'Previous' and 'Next' buttons if needed. " +
                "Once you proceed to the scenario, your choices for this section cannot be changed.\n\n" +
                "Ready to proceed?";
    
    if (confirm(msg)) {
        showScenario();
    }
}

function startQuiz() {
    userData.fname = document.getElementById('fname').value.trim();
    userData.lname = document.getElementById('lname').value.trim();
    userData.classInfo = document.getElementById('class-info').value.trim();

    if (!userData.fname || !userData.lname || !userData.classInfo || quizData.length === 0) {
        alert("Please wait or fill details.");
        return;
    }

    // 1. SHUFFLE EVERYTHING ONCE AT START
    displayOrder = shuffle([...Array(quizData.length).keys()]);
    
    // Shuffle options for each question once
    displayOrder.forEach(qIdx => {
        optionShuffles[qIdx] = shuffle([...Array(quizData[qIdx].options.length).keys()]);
    });

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
    const qIdx = displayOrder[currentQ];
    const q = quizData[qIdx];
    const optOrder = optionShuffles[qIdx];
    
    document.getElementById('q-count').innerText = `${currentQ + 1}/${quizData.length}`;
    document.getElementById('question-text').innerText = q.q;
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    
    optOrder.forEach((originalOptIdx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        if(sessionResults[qIdx] === originalOptIdx) btn.classList.add('selected');
        btn.innerText = q.options[originalOptIdx];
        btn.onclick = () => selectOption(qIdx, originalOptIdx);
        grid.appendChild(btn);
    });
}

function selectOption(qIdx, originalOptIdx) {
    sessionResults[qIdx] = originalOptIdx;
    loadQuestion(); // Visually update
    
    setTimeout(() => {
        if(currentQ < quizData.length - 1) {
            currentQ++;
            loadQuestion();
        } else {
            confirmScenarioTransition();
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
    if(!scenarioAns.security || !scenarioAns.sdlc || !scenarioAns.hci) { alert("Complete scenario!"); return; }

    scenarioScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const totalTime = Math.round((Date.now() - totalStartTime) / 1000);
    const finalChoices = quizData.map((q, i) => ({
        question: q.q,
        options: q.options,
        userAnswerIndex: sessionResults[i] !== undefined ? sessionResults[i] : -1
    }));

    firebase.database().ref('quiz_results').push({
        user: userData,
        totalTime: totalTime,
        studentChoices: finalChoices,
        scenario: scenarioAns,
        isGraded: false,
        timestamp: new Date().toISOString()
    });
}

window.onload = initApp;

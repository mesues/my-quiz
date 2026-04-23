const quizData = [
    {
        q: "Which sentence is grammatically correct?",
        options: ["He don't like apples.", "He doesn't like apples.", "He not like apples.", "He doesn't likes apples."],
        correct: 1
    },
    {
        q: "What is the past tense of the verb 'Go'?",
        options: ["Goed", "Gone", "Went", "Going"],
        correct: 2
    },
    {
        q: "I _____ been waiting for you for two hours.",
        options: ["has", "have", "am", "had"],
        correct: 1
    },
    {
        q: "Which word is an adjective?",
        options: ["Run", "Quickly", "Beautiful", "Table"],
        correct: 2
    },
    {
        q: "If it rains, we _____ stay at home.",
        options: ["would", "will", "did", "are"],
        correct: 1
    }
];

let userData = { fname: "", lname: "", classInfo: "" };
let currentQ = 0;
let score = 0;
let sessionResults = [];
let totalStartTime, questionStartTime;
let timerInterval;

// Elements
const loginScreen = document.getElementById('login-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

document.getElementById('start-btn').onclick = startQuiz;
document.getElementById('next-btn').onclick = nextQuestion;

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
        score++;
    }

    currentQ++;
    if (currentQ < quizData.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    clearInterval(timerInterval);
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    const totalTime = Math.round((Date.now() - totalStartTime) / 1000);
    const finalScorePerc = Math.round((score / quizData.length) * 100);

    // Update UI Summary
    document.getElementById('final-score').innerText = finalScorePerc + '%';
    document.getElementById('correct-count').innerText = `${score}/${quizData.length}`;
    document.getElementById('total-time').innerText = totalTime + 's';

    // Update Detailed Table
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

    saveToDatabase(finalScorePerc, totalTime, detailedData);
    sendEmail(finalScorePerc, totalTime);
}

function saveToDatabase(scorePerc, totalTime, detailedData) {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        const db = firebase.database();
        const newEntryRef = db.ref('quiz_results').push();
        newEntryRef.set({
            user: userData,
            score: scorePerc,
            totalTime: totalTime,
            details: detailedData,
            timestamp: new Date().toISOString()
        }).then(() => console.log("Data saved to Firebase"));
    }
}

function sendEmail(scorePerc, totalTime) {
    const emailPayload = {
        _subject: `New Quiz Result: ${userData.fname} ${userData.lname}`,
        Name: `${userData.fname} ${userData.lname}`,
        Class: userData.classInfo,
        Score: `${scorePerc}% (${score}/${quizData.length})`,
        TotalTime: `${totalTime} seconds`,
        _captcha: "false"
    };

    fetch("https://formsubmit.co/ajax/mesuesinformatike@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload)
    });
}

const quizData = [
    {
        question: "Türkiye'nin başkenti neresidir?",
        options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
        correct: 1
    },
    {
        question: "Dünyanın en yüksek dağı hangisidir?",
        options: ["Everest", "K2", "Lhotse", "Makalu"],
        correct: 0
    },
    {
        question: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?",
        options: ["Venüs", "Mars", "Jüpiter", "Satürn"],
        correct: 1
    },
    {
        question: "Suyun kimyasal formülü nedir?",
        options: ["CO2", "H2O", "O2", "CH4"],
        correct: 1
    },
    {
        question: "Mona Lisa tablosunu kim yapmıştır?",
        options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"],
        correct: 2
    }
];

let currentQuestion = 0;
let score = 0;
let userAnswers = [];

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const questionText = document.getElementById('question-text');
const optionsList = document.getElementById('options-list');
const nextBtn = document.getElementById('next-btn');
const scoreDisplay = document.getElementById('score-display');
const resultsSummary = document.getElementById('results-summary');

document.getElementById('start-btn').addEventListener('click', startQuiz);
nextBtn.addEventListener('click', handleNext);

function startQuiz() {
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    loadQuestion();
}

function loadQuestion() {
    const q = quizData[currentQuestion];
    questionText.innerText = `${currentQuestion + 1}. ${q.question}`;
    optionsList.innerHTML = '';
    
    q.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.innerText = option;
        btn.classList.add('option-btn');
        btn.addEventListener('click', () => selectOption(index, btn));
        optionsList.appendChild(btn);
    });
    
    nextBtn.classList.add('hidden');
}

function selectOption(index, btn) {
    const allBtns = optionsList.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    
    userAnswers[currentQuestion] = index;
    nextBtn.classList.remove('hidden');
}

function handleNext() {
    if (userAnswers[currentQuestion] === quizData[currentQuestion].correct) {
        score++;
    }
    
    currentQuestion++;
    
    if (currentQuestion < quizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    quizScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    
    const finalScore = (score / quizData.length) * 100;
    scoreDisplay.innerText = `%${finalScore} (${score}/${quizData.length})`;
    
    let emailData = {
        Skor: `%${finalScore} (${score}/${quizData.length})`,
        Tarih: new Date().toLocaleString()
    };

    resultsSummary.innerHTML = '';
    quizData.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.correct;
        const resultText = isCorrect ? 'Doğru' : 'Yanlış';
        
        const div = document.createElement('div');
        div.classList.add('result-item');
        div.innerHTML = `
            <p><strong>Soru:</strong> ${q.question}</p>
            <p><strong>Yanıtınız:</strong> ${q.options[userAnswers[i]]} 
               <span class="${isCorrect ? 'correct' : 'incorrect'}">
               (${resultText})
               </span>
            </p>
        `;
        resultsSummary.appendChild(div);

        emailData[`Soru_${i+1}`] = q.question;
        emailData[`Yanit_${i+1}`] = `${q.options[userAnswers[i]]} (${resultText})`;
    });

    sendEmail(emailData);
}

function sendEmail(data) {
    const toast = document.createElement('div');
    toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:5px; z-index:1000;";
    toast.innerText = "Sonuçlar merkeze iletiliyor...";
    document.body.appendChild(toast);

    fetch("https://formsubmit.co/ajax/mesuesinformatike@gmail.com", {
        method: "POST",
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            toast.innerText = "Sonuçlar başarıyla kaydedildi!";
            toast.style.background = "#27ae60";
        }
    })
    .catch(error => {
        console.error("Hata:", error);
        toast.innerText = "Bağlantı hatası!";
        toast.style.background = "#e74c3c";
    })
    .finally(() => {
        setTimeout(() => toast.remove(), 3000);
    });
}

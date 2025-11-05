const socket = io();

let currentQuestionData = null;
let quizStarted = false;

// DOM elements
const startQuizBtn = document.getElementById('start-quiz-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const endQuestionBtn = document.getElementById('end-question-btn');
const playerCount = document.getElementById('player-count');
const adminScore = document.getElementById('admin-score');
const adminTotal = document.getElementById('admin-total');
const statusText = document.getElementById('status-text');
const playersList = document.getElementById('players-list');
const currentQuestionSection = document.getElementById('current-question-section');
const resultsSection = document.getElementById('results-section');
const adminQuestionText = document.getElementById('admin-question-text');
const adminAlternatives = document.getElementById('admin-alternatives');
const correctAnswerDisplay = document.getElementById('correct-answer-display');
const answersReceived = document.getElementById('answers-received');
const adminResults = document.getElementById('admin-results');
const explanationText = document.getElementById('explanation-text');
const qrCodeContainer = document.getElementById('qr-code');
const playerUrl = document.getElementById('player-url');

// Connect to server as admin
socket.on('connect', () => {
    console.log('Admin connected');
    socket.emit('join-admin');
    generateQRCode();
});

// Generate QR code for player URL
function generateQRCode() {
    const url = window.location.origin;
    playerUrl.textContent = url;

    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, {
        text: url,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Quiz loaded status
socket.on('quiz-loaded', (data) => {
    if (data.loaded) {
        statusText.textContent = `Quiz laddad: ${data.title} (${data.totalQuestions} frågor)`;
        startQuizBtn.disabled = false;
    } else {
        statusText.textContent = 'Fel: quizfragor.json saknas eller kunde inte laddas';
        statusText.style.color = 'red';
        startQuizBtn.disabled = true;
    }
});

// Game state updates
socket.on('game-state', (state) => {
    adminScore.textContent = state.score;
    adminTotal.textContent = state.totalPoints || 9;

    if (state.gameWon) {
        statusText.textContent = 'SPELET ÄR VUNNET! 🎉';
        statusText.style.color = 'green';
        nextQuestionBtn.disabled = true;
        endQuestionBtn.disabled = true;
    }
});

// Players update
socket.on('players-update', (data) => {
    playerCount.textContent = data.playerCount;

    if (data.players.length === 0) {
        playersList.innerHTML = '<p class="empty-message">Inga spelare anslutna än</p>';
    } else {
        playersList.innerHTML = data.players.map(p =>
            `<div class="player-item">${p.name}</div>`
        ).join('');
    }
});

// Quiz started
socket.on('quiz-started', (data) => {
    quizStarted = true;
    statusText.textContent = `Quiz startad: ${data.title}`;
    startQuizBtn.disabled = true;
    nextQuestionBtn.disabled = false;
});

// New question sent
socket.on('new-question', (data) => {
    currentQuestionData = data;
    currentQuestionSection.style.display = 'block';
    resultsSection.style.display = 'none';

    adminQuestionText.textContent = `Fråga ${data.questionNumber}: ${data.question}`;

    adminAlternatives.innerHTML = data.alternatives.map((alt, idx) =>
        `<div class="alternative-item">${idx + 1}. ${alt}</div>`
    ).join('');

    // Note: We'll need to fetch correct answer from server or store it
    correctAnswerDisplay.textContent = '(dold tills frågan avslutas)';
    answersReceived.textContent = '0';

    nextQuestionBtn.disabled = true;
    endQuestionBtn.disabled = false;
});

// Answer count update
socket.on('answer-count', (count) => {
    answersReceived.textContent = count;
});

// Question results
socket.on('question-results', (results) => {
    currentQuestionSection.style.display = 'none';
    resultsSection.style.display = 'block';

    // Update score
    adminScore.textContent = results.newScore;

    // Display results
    const statsHtml = results.answerCounts.map((count, idx) => {
        const isCorrect = idx === results.correctAnswer;
        const percentage = results.totalAnswers > 0 ? (count / results.totalAnswers * 100).toFixed(1) : 0;

        return `
            <div class="result-bar ${isCorrect ? 'correct' : ''}">
                <span class="result-label">Alt ${idx + 1}</span>
                <div class="result-fill" style="width: ${percentage}%"></div>
                <span class="result-count">${count} (${percentage}%)</span>
            </div>
        `;
    }).join('');

    adminResults.innerHTML = `
        <div class="results-summary">
            <p><strong>Rätt svar:</strong> Alternativ ${results.correctAnswer + 1}</p>
            <p><strong>Antal rätt:</strong> ${results.correctCount} / ${results.totalAnswers}</p>
            <p><strong>Majoritet rätt:</strong> ${results.majorityCorrect ? 'JA ✓' : 'NEJ ✗'}</p>
            <p class="score-change ${results.scoreChange > 0 ? 'positive' : 'negative'}">
                <strong>Poängförändring:</strong> ${results.scoreChange > 0 ? '+' : ''}${results.scoreChange}
            </p>
        </div>
        <div class="results-bars">
            ${statsHtml}
        </div>
    `;

    explanationText.textContent = results.explanation || 'Ingen förklaring tillgänglig.';

    nextQuestionBtn.disabled = false;
    endQuestionBtn.disabled = true;

    if (results.gameWon) {
        statusText.textContent = 'SPELET ÄR VUNNET! 🎉 Bilden är helt avslöjad!';
        statusText.style.color = 'green';
        nextQuestionBtn.disabled = true;
    }
});

// Button handlers
startQuizBtn.addEventListener('click', () => {
    socket.emit('start-quiz');
});

nextQuestionBtn.addEventListener('click', () => {
    socket.emit('next-question');
});

endQuestionBtn.addEventListener('click', () => {
    socket.emit('end-question');
});

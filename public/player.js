const socket = io();

let currentScore = 0;
let totalPoints = 9;
let hasAnswered = false;
let timerInterval = null;

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const gameScreen = document.getElementById('game-screen');
const victoryScreen = document.getElementById('victory-screen');
const questionContainer = document.getElementById('question-container');
const statsDisplay = document.getElementById('stats-display');
const questionText = document.getElementById('question-text');
const alternativesContainer = document.getElementById('alternatives');
const questionNumber = document.getElementById('question-number');
const timer = document.getElementById('timer');
const currentScoreEl = document.getElementById('current-score');
const totalPointsEl = document.getElementById('total-points');
const scoreChangeEl = document.getElementById('score-change');
const statsBars = document.getElementById('stats-bars');

// Connect to server
socket.on('connect', () => {
    console.log('Connected to server');
    socket.emit('join-player', `Player_${Math.floor(Math.random() * 1000)}`);
});

// Game state updates
socket.on('game-state', (state) => {
    currentScore = state.score;
    totalPoints = state.totalPoints || 9;
    updateScore();
    updateImageReveal(currentScore);

    if (state.gameWon) {
        showVictoryScreen();
    }
});

// Quiz started
socket.on('quiz-started', (data) => {
    console.log('Quiz started:', data.title);
    welcomeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    questionContainer.classList.add('hidden');
    statsDisplay.classList.add('hidden');
});

// New question
socket.on('new-question', (data) => {
    console.log('New question:', data.question);
    hasAnswered = false;

    // Hide stats, show question
    statsDisplay.classList.add('hidden');
    questionContainer.classList.remove('hidden');

    // Update question display
    questionNumber.textContent = `Fråga ${data.questionNumber}/${data.totalQuestions}`;
    questionText.textContent = data.question;

    // Create alternatives
    alternativesContainer.innerHTML = '';
    data.alternatives.forEach((alt, index) => {
        const button = document.createElement('button');
        button.className = 'alternative';
        button.textContent = alt;
        button.onclick = () => submitAnswer(index);
        alternativesContainer.appendChild(button);
    });

    // Start timer
    startTimer(data.timeLeft || 15);
});

// Question results
socket.on('question-results', (results) => {
    console.log('Question results:', results);
    clearInterval(timerInterval);

    // Hide question, show stats
    questionContainer.classList.add('hidden');
    statsDisplay.classList.remove('hidden');

    // Update score
    currentScore = results.newScore;
    updateScore();
    updateImageReveal(currentScore);

    // Show statistics
    displayStatistics(results);

    // Check for victory
    if (results.gameWon) {
        setTimeout(() => {
            showVictoryScreen();
        }, 5000);
    }
});

// Timer function
function startTimer(seconds) {
    clearInterval(timerInterval);
    let timeLeft = seconds;
    timer.textContent = `${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timer.textContent = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
        }
    }, 1000);
}

// Submit answer
function submitAnswer(answerIndex) {
    if (hasAnswered) return;

    hasAnswered = true;
    socket.emit('submit-answer', answerIndex);

    // Highlight selected answer
    const buttons = alternativesContainer.querySelectorAll('.alternative');
    buttons.forEach((btn, idx) => {
        if (idx === answerIndex) {
            btn.classList.add('selected');
        }
        btn.disabled = true;
    });
}

// Display statistics
function displayStatistics(results) {
    const { answerCounts, correctAnswer, totalAnswers, scoreChange } = results;

    // Create bar chart
    statsBars.innerHTML = '';
    answerCounts.forEach((count, index) => {
        const bar = document.createElement('div');
        bar.className = 'stat-bar';

        const label = document.createElement('div');
        label.className = 'stat-label';
        label.textContent = `Alt ${index + 1}`;

        const fill = document.createElement('div');
        fill.className = 'stat-fill';
        if (index === correctAnswer) {
            fill.classList.add('correct');
        }

        const percentage = totalAnswers > 0 ? (count / totalAnswers) * 100 : 0;
        fill.style.width = `${percentage}%`;

        const countLabel = document.createElement('span');
        countLabel.className = 'stat-count';
        countLabel.textContent = count;

        bar.appendChild(label);
        bar.appendChild(fill);
        bar.appendChild(countLabel);
        statsBars.appendChild(bar);
    });

    // Show score change
    scoreChangeEl.textContent = scoreChange > 0 ? `+${scoreChange} poäng!` : `${scoreChange} poäng`;
    scoreChangeEl.className = `score-change ${scoreChange > 0 ? 'positive' : 'negative'}`;
}

// Update score display
function updateScore() {
    currentScoreEl.textContent = currentScore;
    totalPointsEl.textContent = totalPoints;
}

// Update image reveal (3x3 grid)
function updateImageReveal(score) {
    const tiles = document.querySelectorAll('.image-tile');
    tiles.forEach((tile, index) => {
        if (index < score) {
            tile.classList.add('revealed');
        }
    });
}

// Show victory screen
function showVictoryScreen() {
    gameScreen.classList.remove('active');
    victoryScreen.classList.add('active');
}

// Initial setup
updateScore();

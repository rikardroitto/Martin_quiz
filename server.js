const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Game state
let gameState = {
  quizData: null,
  currentQuestionIndex: -1,
  score: 0,
  players: [],
  answers: {}, // playerId -> answerIndex
  questionStartTime: null,
  isQuestionActive: false,
  gameStarted: false,
  gameWon: false
};

// Load quiz data
function loadQuizData() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'quizfragor.json'), 'utf8');
    gameState.quizData = JSON.parse(data);
    console.log('Quiz data loaded successfully');
  } catch (error) {
    console.error('Error loading quiz data:', error.message);
    gameState.quizData = null;
  }
}

// Initialize quiz data on startup
loadQuizData();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Handle player connection
  socket.on('join-player', (playerName) => {
    const player = {
      id: socket.id,
      name: playerName || `Player ${gameState.players.length + 1}`,
      type: 'player'
    };
    gameState.players.push(player);
    socket.playerData = player;

    console.log(`Player joined: ${player.name} (${socket.id})`);

    // Send current game state to player
    socket.emit('game-state', {
      score: gameState.score,
      totalPoints: gameState.quizData?.totalPoints || 9,
      gameStarted: gameState.gameStarted,
      gameWon: gameState.gameWon
    });

    // Notify admin
    io.emit('players-update', {
      playerCount: gameState.players.length,
      players: gameState.players.map(p => ({ id: p.id, name: p.name }))
    });

    // If question is active, send it to the new player
    if (gameState.isQuestionActive && gameState.currentQuestionIndex >= 0) {
      const question = gameState.quizData.questions[gameState.currentQuestionIndex];
      const timeLeft = 15 - Math.floor((Date.now() - gameState.questionStartTime) / 1000);

      if (timeLeft > 0) {
        socket.emit('new-question', {
          questionNumber: gameState.currentQuestionIndex + 1,
          totalQuestions: gameState.quizData.questions.length,
          question: question.question,
          alternatives: question.alternatives,
          timeLeft: timeLeft
        });
      }
    }
  });

  // Handle admin connection
  socket.on('join-admin', () => {
    socket.adminData = { type: 'admin' };
    console.log('Admin connected:', socket.id);

    // Send quiz data and game state
    socket.emit('quiz-loaded', {
      loaded: gameState.quizData !== null,
      title: gameState.quizData?.title,
      totalQuestions: gameState.quizData?.questions.length,
      totalPoints: gameState.quizData?.totalPoints || 9
    });

    socket.emit('game-state', {
      score: gameState.score,
      totalPoints: gameState.quizData?.totalPoints || 9,
      currentQuestionIndex: gameState.currentQuestionIndex,
      gameStarted: gameState.gameStarted,
      gameWon: gameState.gameWon
    });

    socket.emit('players-update', {
      playerCount: gameState.players.length,
      players: gameState.players.map(p => ({ id: p.id, name: p.name }))
    });
  });

  // Start quiz
  socket.on('start-quiz', () => {
    if (!socket.adminData) return;

    if (!gameState.quizData) {
      socket.emit('error', { message: 'Quiz data not loaded' });
      return;
    }

    gameState.gameStarted = true;
    gameState.currentQuestionIndex = -1;
    gameState.score = 0;
    gameState.gameWon = false;
    gameState.answers = {};

    console.log('Quiz started by admin');

    io.emit('quiz-started', {
      title: gameState.quizData.title,
      totalQuestions: gameState.quizData.questions.length
    });
  });

  // Next question
  socket.on('next-question', () => {
    if (!socket.adminData || !gameState.quizData) return;

    gameState.currentQuestionIndex++;

    if (gameState.currentQuestionIndex >= gameState.quizData.questions.length) {
      socket.emit('error', { message: 'No more questions' });
      return;
    }

    const question = gameState.quizData.questions[gameState.currentQuestionIndex];
    gameState.answers = {};
    gameState.questionStartTime = Date.now();
    gameState.isQuestionActive = true;

    console.log(`Starting question ${gameState.currentQuestionIndex + 1}`);

    // Send question to all players
    io.emit('new-question', {
      questionNumber: gameState.currentQuestionIndex + 1,
      totalQuestions: gameState.quizData.questions.length,
      question: question.question,
      alternatives: question.alternatives,
      timeLeft: 15
    });

    // Auto-end question after 15 seconds
    setTimeout(() => {
      if (gameState.isQuestionActive && gameState.currentQuestionIndex === gameState.currentQuestionIndex) {
        endQuestion();
      }
    }, 15000);
  });

  // Player submits answer
  socket.on('submit-answer', (answerIndex) => {
    if (!socket.playerData || !gameState.isQuestionActive) return;

    gameState.answers[socket.id] = answerIndex;
    console.log(`Player ${socket.playerData.name} answered: ${answerIndex}`);

    // Notify admin of answer count
    io.emit('answer-count', Object.keys(gameState.answers).length);

    // Check if all players have answered
    if (Object.keys(gameState.answers).length === gameState.players.length && gameState.players.length > 0) {
      endQuestion();
    }
  });

  // Admin manually ends question
  socket.on('end-question', () => {
    if (!socket.adminData) return;
    endQuestion();
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.playerData) {
      gameState.players = gameState.players.filter(p => p.id !== socket.id);
      delete gameState.answers[socket.id];

      console.log(`Player disconnected: ${socket.playerData.name}`);

      io.emit('players-update', {
        playerCount: gameState.players.length,
        players: gameState.players.map(p => ({ id: p.id, name: p.name }))
      });
    }
  });
});

// End current question and calculate results
function endQuestion() {
  if (!gameState.isQuestionActive || gameState.currentQuestionIndex < 0) return;

  gameState.isQuestionActive = false;
  const question = gameState.quizData.questions[gameState.currentQuestionIndex];
  const correctAnswer = question.correctAnswer;

  // Calculate statistics
  const answerCounts = [0, 0, 0, 0];
  let correctCount = 0;
  let totalAnswers = 0;

  Object.values(gameState.answers).forEach(answer => {
    if (answer >= 0 && answer <= 3) {
      answerCounts[answer]++;
      totalAnswers++;
      if (answer === correctAnswer) {
        correctCount++;
      }
    }
  });

  // Determine if majority answered correctly
  const majorityCorrect = totalAnswers > 0 && correctCount > totalAnswers / 2;
  const scoreChange = majorityCorrect ? 1 : -1;
  const oldScore = gameState.score;
  gameState.score = Math.max(0, gameState.score + scoreChange);

  // Check if game is won
  if (gameState.score >= gameState.quizData.totalPoints) {
    gameState.gameWon = true;
  }

  console.log(`Question ended. Correct: ${correctCount}/${totalAnswers}, Score: ${oldScore} -> ${gameState.score}`);

  // Send results to all clients
  io.emit('question-results', {
    correctAnswer: correctAnswer,
    answerCounts: answerCounts,
    totalAnswers: totalAnswers,
    correctCount: correctCount,
    majorityCorrect: majorityCorrect,
    scoreChange: scoreChange,
    newScore: gameState.score,
    explanation: question.explanation,
    gameWon: gameState.gameWon
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Player URL: http://localhost:${PORT}`);
  console.log(`Admin URL: http://localhost:${PORT}/admin.html`);
});

let currentQuestionIndex = 0;
let questions = [];
let score = 0;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function fetchQuestions() {
  try {
    const response = await fetch('https://opentdb.com/api.php?amount=15&category=27&difficulty=medium&type=multiple');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching questions:', error);
    displayError('Failed to load questions. Please try again later.');
  }
}

function displayQuestion() {
  const question = questions[currentQuestionIndex];
  document.getElementById('question').textContent = decodeHTMLEntities(question.question);
  const options = [...question.incorrect_answers, question.correct_answer];
  shuffleArray(options);
  
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';
  options.forEach(option => {
    const button = document.createElement('button');
    button.textContent = decodeHTMLEntities(option);
    button.addEventListener('click', () => handleAnswer(option));
    optionsContainer.appendChild(button);
  });

  updateProgress();
}

function handleAnswer(selectedAnswer) {
  const question = questions[currentQuestionIndex];
  const buttons = document.querySelectorAll('#options button');
  
  buttons.forEach(button => {
    button.disabled = true;
    if (button.textContent === decodeHTMLEntities(question.correct_answer)) {
      button.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--correct-color').trim();
    }
  });

  if (selectedAnswer === question.correct_answer) {
    displayFeedback('Nailed it!');
    score++; 
  } else {
    displayFeedback('Nope! The correct answer is: ' + decodeHTMLEntities(question.correct_answer));
  }

  document.getElementById('next').style.display = 'block';
  updateScore(); 
}

function displayFeedback(message) {
  const feedbackElement = document.getElementById('feedback');
  feedbackElement.textContent = message;
  feedbackElement.style.display = 'block';
}

function displayError(message) {
  const errorElement = document.getElementById('error');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

function updateProgress() {
  const progressElement = document.getElementById('progress');
  progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function updateScore() {
  const scoreElement = document.getElementById('score');
  scoreElement.textContent = `Score: ${score}`;
}

async function initQuiz() {
  try {
    questions = await fetchQuestions();
    if (questions && questions.length > 0) {
      displayQuestion();
      updateScore(); 
      document.getElementById('restart').style.display = 'none';
      document.getElementById('next').style.display = 'none';
      document.getElementById('error').textContent = '';
    } else {
      throw new Error('No questions received from the API');
    }
  } catch (error) {
    console.error('Quiz initialization error:', error);
    displayError('Failed to initialize quiz. Please refresh the page.');
  }
}

function decodeHTMLEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('next').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      displayQuestion();
      document.getElementById('next').style.display = 'none';
      document.getElementById('feedback').style.display = 'none';
    } else {
      displayError(`That's a wrap! Your score is: ${score} out of ${questions.length}`);
      document.getElementById('restart').style.display = 'block';
      document.getElementById('next').style.display = 'none';
    }
  });

  document.getElementById('restart').addEventListener('click', () => {
    score = 0;
    currentQuestionIndex = 0;
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('restart').style.display = 'none';
    document.getElementById('error').textContent = '';
    initQuiz();
  });

  initQuiz();
});

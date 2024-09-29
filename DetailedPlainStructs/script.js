document.addEventListener('DOMContentLoaded', function() {
  const sayings = ["hardrive"];
  const splashText = document.getElementById('splash-text');
  splashText.textContent = sayings[Math.floor(Math.random() * sayings.length)];
});

function randomColor() {
  function c() {
    let hex = Math.floor(Math.random() * 256).toString(16);
    return ("0" + String(hex)).substr(-2);
  }
  return "#" + c() + c() + c();
}

const score = document.querySelector('.score');
const highScore = document.querySelector('.highScore');
const startScreen = document.querySelector('.startScreen');
const gameArea = document.querySelector('.gameArea');
const ClickToStart = document.querySelector('.ClickToStart');
const playerNameInput = document.getElementById('playerName');
const highScoreModal = document.getElementById('highScoreModal');
const highScoreList = document.getElementById('highScoreList');
const closeModal = document.querySelector('.close');

ClickToStart.addEventListener('click', Start);
document.addEventListener('keydown', keydown);
document.addEventListener('keyup', keyup);
closeModal.addEventListener('click', () => highScoreModal.style.display = 'none');
window.addEventListener('click', (event) => {
  if (event.target == highScoreModal) {
    highScoreModal.style.display = 'none';
  }
});

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let player = {
  speed: 5,
  score: 0,
  highScore: 0,
  isStart: false,
  name: '',
  city: ''
};

let highScores = loadHighScores();

function keydown(e) {
  keys[e.key] = true;
}

function keyup(e) {
  keys[e.key] = false;
}

async function Start() {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    alert("Please enter your name to start the game.");
    return;
  }

  player.name = playerName;
  player.city = await fetchCity();

  gameArea.innerHTML = "";
  startScreen.classList.add('hide');
  player.isStart = true;
  player.score = 0;
  window.requestAnimationFrame(Play);

  for (let i = 0; i < 5; i++) {
    let roadLines = document.createElement('div');
    roadLines.setAttribute('class', 'roadLines');
    roadLines.y = (i * 140);
    roadLines.style.top = roadLines.y + "px";
    gameArea.appendChild(roadLines);
  }

  for (let i = 0; i < 3; i++) {
    let Opponents = document.createElement('div');
    Opponents.setAttribute('class', 'Opponents');
    Opponents.y = ((i) * -300);
    Opponents.style.top = Opponents.y + "px";
    gameArea.appendChild(Opponents);
    Opponents.style.left = Math.floor(Math.random() * 350) + "px";
    Opponents.style.color = randomColor();
  }

  let moto = document.createElement('div');
  moto.setAttribute('class', 'moto');
  gameArea.appendChild(moto);
  player.x = moto.offsetLeft;
  player.y = moto.offsetTop;
}

function Play() {
  let moto = document.querySelector('.moto');
  let road = gameArea.getBoundingClientRect();

  if (player.isStart) {
    moveLines();
    moveOpponents(moto);

    if (keys.ArrowUp && player.y > (road.top + 70)) { player.y -= player.speed }
    if (keys.ArrowDown && player.y < (road.height - 75)) { player.y += player.speed }
    if (keys.ArrowRight && player.x < 350) { player.x += player.speed }
    if (keys.ArrowLeft && player.x > 0) { player.x -= player.speed }

    moto.style.top = player.y + "px";
    moto.style.left = player.x + "px";

    highScore.innerHTML = "HighScore: " + (player.highScore - 1);
    player.score++;
    player.speed += 0.01;

    if (player.highScore < player.score) {
      player.highScore++;
      highScore.innerHTML = "HighScore: " + (player.highScore - 1);
      highScore.style.top = "80px";
    }

    score.innerHTML = "Score: " + (player.score - 1);

    window.requestAnimationFrame(Play);
  }
}

function moveLines() {
  let roadLines = document.querySelectorAll('.roadLines');

  roadLines.forEach(function (item) {
    if (item.y >= 700) item.y -= 700;
    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function moveOpponents(moto) {
  let Opponents = document.querySelectorAll('.Opponents');

  Opponents.forEach(function (item) {
    if (isCollide(moto, item)) {
      endGame();
    }

    if (item.y >= 750) {
      item.y -= 900;
      item.style.left = Math.floor(Math.random() * 350) + "px";
    }

    item.y += player.speed;
    item.style.top = item.y + "px";
  });
}

function isCollide(moto, Opponents) {
  let motoRect = moto.getBoundingClientRect();
  let OpponentsRect = Opponents.getBoundingClientRect();
  return !((motoRect.top > OpponentsRect.bottom) || (motoRect.bottom < OpponentsRect.top) || (motoRect.right < OpponentsRect.left) || (motoRect.left > OpponentsRect.right));
}

function endGame() {
  player.isStart = false;
  player.speed = 5;
  startScreen.classList.remove('hide');

  highScores.push({ name: player.name, score: player.score - 1, city: player.city });
  highScores.sort((a, b) => b.score - a.score);
  saveHighScores(highScores);

  highScoreList.innerHTML = highScores.map((score, index) => `
    <p>
      <span class="player-name">${index + 1}. ${score.name}</span> 
      (<span class="player-city">${score.city}</span>): 
      <span class="player-score">${score.score}</span>
    </p>
  `).join('');
  highScoreModal.style.display = 'block';
}

function saveHighScores(highScores) {
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

function loadHighScores() {
  const highScores = localStorage.getItem('highScores');
  return highScores ? JSON.parse(highScores) : [];
}

async function fetchCity() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.city || 'Unknown';
  } catch (error) {
    console.error('Error fetching city:', error);
    return 'Unknown';
  }
}
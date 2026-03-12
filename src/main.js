const BOARD_SIZES = [4, 6, 8, 10];

const COLORS = [
    '#FF0000', // Red
    '#33FF57', // Bright Green
    '#3357FF', // Blue
    '#F3FF33', // Yellow
    '#FF33F3', // Pink
    '#33FFF3', // Cyan
    '#FF8C33', // Orange
    '#8C33FF', // Purple
    '#00994D', // Dark Green
    '#FF3380'  // Magenta
];

// ── State ────────────────────────────────────────────────────────────────────

let clickCount = 0;
let startTime = null;
let timerInterval = null;
let firstTile = null;
let secondTile = null;
let canFlip = true;
let matchedPairs = 0;
let gameActive = false;
let boardSize = 10;
let totalPairs = 0;

// ── DOM refs ─────────────────────────────────────────────────────────────────

const gameBoard = document.getElementById('game-board');
const clickCountElement = document.getElementById('click-count');
const timeElement = document.getElementById('time');
const resetButton = document.getElementById('reset-btn');
const gameOverScreen = document.getElementById('game-over');
const finalClicksElement = document.getElementById('final-clicks');
const finalTimeElement = document.getElementById('final-time');
const newRecordBanner = document.getElementById('new-record-banner');
const playAgainButton = document.getElementById('play-again-btn');

// ── Records ───────────────────────────────────────────────────────────────────

function getRecords() {
    try {
        return JSON.parse(localStorage.getItem('flippy_records')) || {};
    } catch {
        return {};
    }
}

function saveRecords(records) {
    localStorage.setItem('flippy_records', JSON.stringify(records));
}

function checkAndSaveRecord(size, flips, elapsedSeconds) {
    const records = getRecords();
    const key = `size_${size}`;
    const current = records[key] || { flips: null, time: null };

    let newFlipRecord = false;
    let newTimeRecord = false;

    if (current.flips === null || flips < current.flips) {
        current.flips = flips;
        newFlipRecord = true;
    }
    if (current.time === null || elapsedSeconds < current.time) {
        current.time = elapsedSeconds;
        newTimeRecord = true;
    }

    records[key] = current;
    saveRecords(records);
    return { newFlipRecord, newTimeRecord };
}

function formatSeconds(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
}

function renderRecords(highlightSize = null, highlightFlips = false, highlightTime = false) {
    const records = getRecords();
    const grid = document.getElementById('records-grid');
    grid.innerHTML = '';

    ['Size', 'Fewest Flips', 'Best Time'].forEach(h => {
        const el = document.createElement('div');
        el.className = 'col-header';
        el.textContent = h;
        grid.appendChild(el);
    });

    BOARD_SIZES.forEach(size => {
        const key = `size_${size}`;
        const rec = records[key] || { flips: null, time: null };

        const sizeEl = document.createElement('div');
        sizeEl.className = 'size-label';
        sizeEl.textContent = `${size}×${size}`;
        grid.appendChild(sizeEl);

        const flipsEl = document.createElement('div');
        flipsEl.className = 'record-val' + (rec.flips === null ? ' no-record' : '');
        if (highlightSize === size && highlightFlips) flipsEl.classList.add('new-record');
        flipsEl.textContent = rec.flips !== null ? `${rec.flips} flips` : '—';
        grid.appendChild(flipsEl);

        const timeEl = document.createElement('div');
        timeEl.className = 'record-val' + (rec.time === null ? ' no-record' : '');
        if (highlightSize === size && highlightTime) timeEl.classList.add('new-record');
        timeEl.textContent = rec.time !== null ? formatSeconds(rec.time) : '—';
        grid.appendChild(timeEl);
    });
}

// ── Game logic ────────────────────────────────────────────────────────────────

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initGame() {
    gameBoard.innerHTML = '';
    clickCount = 0;
    matchedPairs = 0;
    clickCountElement.textContent = clickCount;
    gameActive = true;

    boardSize = parseInt(document.getElementById('board-size-select').value);
    localStorage.setItem('flippy_board_size', boardSize);
    totalPairs = (boardSize * boardSize) / 2;

    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;

    const colorsToUse = COLORS.slice(0, boardSize);
    const totalTiles = boardSize * boardSize;
    const tilesPerColor = totalTiles / colorsToUse.length;

    let tilesArray = [];
    for (let i = 0; i < colorsToUse.length; i++) {
        for (let j = 0; j < tilesPerColor; j++) {
            tilesArray.push(colorsToUse[i]);
        }
    }
    tilesArray = shuffleArray(tilesArray);

    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.color = tilesArray[i];

        const tileFront = document.createElement('div');
        tileFront.className = 'tile-front';

        const tileBack = document.createElement('div');
        tileBack.className = 'tile-back';
        tileBack.style.backgroundColor = tilesArray[i];

        tile.appendChild(tileFront);
        tile.appendChild(tileBack);
        tile.addEventListener('click', () => handleTileClick(tile));
        gameBoard.appendChild(tile);
    }

    startTimer();
    renderRecords();
}

function handleTileClick(tile) {
    if (!canFlip || tile.classList.contains('flipped') || tile.classList.contains('matched')) return;

    clickCount++;
    clickCountElement.textContent = clickCount;
    tile.classList.add('flipped');

    if (firstTile === null) {
        firstTile = tile;
    } else {
        secondTile = tile;
        canFlip = false;

        if (firstTile.dataset.color === secondTile.dataset.color) {
            setTimeout(() => {
                firstTile.classList.add('matched');
                secondTile.classList.add('matched');
                resetTiles();
                matchedPairs++;
                if (matchedPairs === totalPairs) endGame();
            }, 500);
        } else {
            setTimeout(() => {
                firstTile.classList.remove('flipped');
                secondTile.classList.remove('flipped');
                resetTiles();
            }, 1000);
        }
    }
}

function resetTiles() {
    firstTile = null;
    secondTile = null;
    canFlip = true;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!gameActive) return;
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    timeElement.textContent = formatSeconds(elapsed);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const { newFlipRecord, newTimeRecord } = checkAndSaveRecord(boardSize, clickCount, elapsed);

    finalClicksElement.textContent = clickCount;
    finalTimeElement.textContent = formatSeconds(elapsed);

    if (newFlipRecord && newTimeRecord) {
        newRecordBanner.textContent = '🏆 New records for fewest flips AND best time!';
    } else if (newFlipRecord) {
        newRecordBanner.textContent = '🏆 New record: fewest flips!';
    } else if (newTimeRecord) {
        newRecordBanner.textContent = '🏆 New record: best time!';
    } else {
        newRecordBanner.textContent = '';
    }

    renderRecords(boardSize, newFlipRecord, newTimeRecord);
    setTimeout(() => gameOverScreen.classList.add('show'), 1000);
}

// ── Event listeners ───────────────────────────────────────────────────────────

resetButton.addEventListener('click', () => {
    gameOverScreen.classList.remove('show');
    initGame();
});

playAgainButton.addEventListener('click', () => {
    gameOverScreen.classList.remove('show');
    initGame();
});

document.getElementById('board-size-select').addEventListener('change', () => {
    if (gameActive) {
        if (confirm('Changing the board size will start a new game. Continue?')) {
            initGame();
        } else {
            document.getElementById('board-size-select').value = boardSize.toString();
        }
    } else {
        initGame();
    }
});

// ── Init ──────────────────────────────────────────────────────────────────────

const savedSize = localStorage.getItem('flippy_board_size');
if (savedSize) {
    document.getElementById('board-size-select').value = savedSize;
}

initGame();

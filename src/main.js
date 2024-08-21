// Constants for the game grid
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30; // Size of each block in pixels

// Tetromino shapes and colors
const TETROMINOES = {
    I: [
        [1, 1, 1, 1]
    ],
    O: [
        [1, 1],
        [1, 1]
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1]
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1]
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1]
    ]
};

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

// Game variables
let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let currentTetromino;
let nextTetromino;
let dropTimer = null;
let dropInterval = 1000;
let gameOver = false;
let score = 0;

// Canvas and context
let canvas;
let context;

// Initialize the game
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    context = canvas.getContext('2d');

    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;

    currentTetromino = createTetromino();
    nextTetromino = createTetromino();
    startGame();
    drawGame();

    document.addEventListener('keydown', handleKeyPress);
};

// Start the game loop
function startGame() {
    if (dropTimer) clearInterval(dropTimer);
    dropTimer = setInterval(drop, dropInterval);
}

// Game loop: move tetromino down
function drop() {
    if (!moveTetromino(0, 1)) {
        lockTetromino();
        clearLines();
        currentTetromino = nextTetromino;
        nextTetromino = createTetromino();
        if (isCollision(currentTetromino, 0, 0)) {
            endGame();
            return;
        }
    }
    drawGame();
}

// Move tetromino by dx and dy
function moveTetromino(dx, dy) {
    const newPosition = {
        ...currentTetromino,
        col: currentTetromino.col + dx,
        row: currentTetromino.row + dy
    };

    if (!isCollision(newPosition, 0, 0)) {
        currentTetromino = newPosition;
        return true;
    }
    return false;
}

// Rotate tetromino
function rotateTetromino() {
    const clonedTetromino = JSON.parse(JSON.stringify(currentTetromino));
    clonedTetromino.shape = rotateMatrix(clonedTetromino.shape);

    if (!isCollision(clonedTetromino, 0, 0)) {
        currentTetromino.shape = clonedTetromino.shape;
    } else {
        // Wall kick logic
        if (!isCollision(clonedTetromino, -1, 0)) {
            currentTetromino.col -= 1;
            currentTetromino.shape = clonedTetromino.shape;
        } else if (!isCollision(clonedTetromino, 1, 0)) {
            currentTetromino.col += 1;
            currentTetromino.shape = clonedTetromino.shape;
        }
    }
}

// Hard drop tetromino
function hardDrop() {
    while (moveTetromino(0, 1)) {}
    lockTetromino();
    clearLines();
    currentTetromino = nextTetromino;
    nextTetromino = createTetromino();
    if (isCollision(currentTetromino, 0, 0)) {
        endGame();
        return;
    }
    drawGame();
}

// Lock tetromino into grid
function lockTetromino() {
    currentTetromino.shape.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                const x = currentTetromino.col + cIdx;
                const y = currentTetromino.row + rIdx;
                if (y >= 0) {
                    grid[y][x] = currentTetromino.color;
                }
            }
        });
    });
}

// Clear complete lines
function clearLines() {
    let linesCleared = 0;
    for (let row = ROWS - 1; row >= 0; row--) {
        if (grid[row].every(cell => cell !== 0)) {
            grid.splice(row, 1);
            grid.unshift(Array(COLS).fill(0));
            linesCleared += 1;
            row++; // Recheck the same row
        }
    }
    if (linesCleared > 0) {
        updateScore(linesCleared);
    }
}

// Update score based on lines cleared
function updateScore(lines) {
    const lineScores = [0, 40, 100, 300, 1200];
    score += lineScores[lines];
    document.getElementById('score').innerText = score;
}

// Draw the entire game
function drawGame() {
    drawGrid();
    drawTetromino();
}

// Draw the grid
function drawGrid() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                context.fillStyle = cell;
                context.fillRect(cIdx * BLOCK_SIZE, rIdx * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#111';
                context.strokeRect(cIdx * BLOCK_SIZE, rIdx * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            } else {
                context.fillStyle = '#222';
                context.fillRect(cIdx * BLOCK_SIZE, rIdx * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#111';
                context.strokeRect(cIdx * BLOCK_SIZE, rIdx * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// Draw the current tetromino
function drawTetromino() {
    currentTetromino.shape.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (cell) {
                context.fillStyle = currentTetromino.color;
                context.fillRect((currentTetromino.col + cIdx) * BLOCK_SIZE, (currentTetromino.row + rIdx) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#111';
                context.strokeRect((currentTetromino.col + cIdx) * BLOCK_SIZE, (currentTetromino.row + rIdx) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        });
    });
}

// Check for collisions
function isCollision(tetromino, dx, dy) {
    for (let r = 0; r < tetromino.shape.length; r++) {
        for (let c = 0; c < tetromino.shape[r].length; c++) {
            if (tetromino.shape[r][c]) {
                const newX = tetromino.col + c + dx;
                const newY = tetromino.row + r + dy;

                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                if (newY >= 0 && grid[newY][newX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Rotate matrix helper function
function rotateMatrix(matrix) {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
}

// Create a new random tetromino
function createTetromino() {
    const shapes = Object.keys(TETROMINOES);
    const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
        shape: TETROMINOES[randomShape],
        color: COLORS[randomShape],
        row: -2,
        col: Math.floor(COLS / 2) - Math.ceil(TETROMINOES[randomShape][0].length / 2)
    };
}

// Handle key presses
function handleKeyPress(event) {
    if (gameOver && event.key.toLowerCase() === 'r') {
        restartGame();
    } else if (!gameOver) {
        switch(event.key) {
            case 'ArrowLeft':
                moveTetromino(-1, 0);
                break;
            case 'ArrowRight':
                moveTetromino(1, 0);
                break;
            case 'ArrowDown':
                moveTetromino(0, 1);
                break;
            case 'ArrowUp':
                rotateTetromino();
                break;
            case ' ':
                hardDrop();
                break;
        }
        drawGame();
    }
}

// End the game
function endGame() {
    clearInterval(dropTimer);
    gameOver = true;
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
    context.fillStyle = '#fff';
    context.font = '30px Arial';
    context.textAlign = 'center';
    context.fillText('Game Over', canvas.width / 2, canvas.height / 2);
    context.fillText('Press "R" to Restart', canvas.width / 2, canvas.height / 2 + 40);
}

// Restart the game
function restartGame() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    score = 0;
    gameOver = false;
    currentTetromino = createTetromino();
    nextTetromino = createTetromino();
    document.getElementById('score').innerText = score;
    startGame();
    drawGame();
}

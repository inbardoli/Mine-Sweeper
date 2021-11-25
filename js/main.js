'use strict'

const MINE = '💣';
const MARK = '❌';
const EXPLOSION = '💥';
const NORMAL = '😀';
const LOST = '🤯';
const WIN = '😎';
const HEART = '💚';
const LOSTHEART = '🖤';

var gBoard;
var gMarks;
var gStartingTime;
var gGameInterval;
var gFirstClick = false;
var gHeartsCount = 3;

var gLevel = {
    SIZE: 4,
    MINES: 2,
    TOTALCELLS: 16
};
var gGame = {
    isOn: true,
    showCount: 0,
    markedCount: 0,
};

function initGame() {
    gBoard = buildBoard(gLevel);
    // console.log(gBoard);
    renderHearts()
    renderSmiley(NORMAL)
    gMarks = gLevel.MINES;
    showMarksLeft()
    // console.log(gBoard);
    renderBoard(gBoard);
}

function buildBoard(gLevel) {
    var mat = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        var row = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                isShown: false,
                minesAroundCount: null,
                cellContent: '',
                isMarked: false
            }
            row.push(cell);
        }
        mat.push(row);
    }

    return mat;
}

function chooseLevel(elBtn) {
    if (elBtn.innerText === 'Easy') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gLevel.TOTALCELLS = 16;
        resetGame();
    }
    if (elBtn.innerText === 'Medium') {
        gLevel.SIZE = 8;
        gLevel.MINES = 12;
        gLevel.TOTALCELLS = 64;
        resetGame();
    }
    if (elBtn.innerText === 'Hard') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gLevel.TOTALCELLS = 144;
        resetGame();
    }
}

function resetGame() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = 'Timer: 0.00';
    clearInterval(gGameInterval);
    gStartingTime = null;
    gFirstClick = false;
    gGame.isOn = true;
    gGame.showCount = 0;
    gGame.markedCount = 0;
    gHeartsCount = 3;
    initGame()
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            gBoard[i][j].minesAroundCount = countNegs(i, j, gBoard);
            if (gBoard[i][j].cellContent !== MINE) {
                gBoard[i][j].cellContent = gBoard[i][j].minesAroundCount

            }
        }
    }
}

function addMines(num) {
    for (var i = 0; i < num; i++) {
        addMine();
    }
}

function addMine() {
    var location = getEmptyCell();
    gBoard[location.i][location.j].cellContent = MINE;
}

function whichButton(event, i, j) {
    var elCell = document.getElementById(`cell-${i}-${j}`);
    elCell.addEventListener("contextmenu", e => e.preventDefault());
    if (!gFirstClick) {
        startTimer()
        //first cell isnt a mine
        gBoard[i][j].cellContent = MINE;
        addMines(gLevel.MINES);
        gBoard[i][j].cellContent = '';
        setMinesNegsCount();

        gFirstClick = true;
    }

    if (event.button === 0) {
        cellClicked(elCell, i, j)
    } else if (event.button === 2) {
        cellMarked(elCell);
    }
}

function cellClicked(elCell, i, j) {
    if (!elCell.isShown && gGame.isOn === true) {
        gBoard[i][j].isShown = true;
        renderCell(i, j, gBoard[i][j].cellContent);
        elCell.isShown = true;
        //if cell content === mine, zeronegs
        checkCellContent(gBoard[i][j], i, j)

        checkGameOver()
    }
}


function checkCellContent(cell, i, j) {
    if (cell.cellContent === MINE) {
        if (gHeartsCount > 1) {
            renderCell(i, j, MINE);
            gHeartsCount--;
            gGame.showCount++;
            renderHearts()
        } else {
            console.log('GAME OVER')
            renderCell(i, j, EXPLOSION);
            gBoard[i][j].cellContent = EXPLOSION;
            //all mines should be reveled
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard.length; j++) {
                    if (gBoard[i][j].cellContent === MINE) {
                        renderCell(i, j, MINE);
                    }
                }
            }
            gHeartsCount--;
            renderHearts()
            renderSmiley(LOST);
            gameOver();
        }
    } else if (cell.minesAroundCount !== 0) {
        gGame.showCount++
    } else {
        //if cell.mindsroundcount === 0, show negs
        gGame.showCount++;
        expandShown(gBoard, i, j);
    }
}

//Called on right click to mark a cell (suspected to be a mine)
function cellMarked(elCell) {
    var coords = getCellCoord(elCell.id);
    if (gBoard[coords.i][coords.j].isShown) return;
    if (gBoard[coords.i][coords.j].isMarked) {
        renderCell(coords.i, coords.j, '');
        gBoard[coords.i][coords.j].isMarked = false;
        gGame.markedCount--;
        gMarks++;
        showMarksLeft()
    } else {
        if (gMarks > 0) {
            renderCell(coords.i, coords.j, MARK);
            gBoard[coords.i][coords.j].isMarked = true;
            gGame.markedCount++;
            gMarks--;
            showMarksLeft()
            checkGameOver()
        }
    }
}

function showMarksLeft() {
    var strHTML = '';
    strHTML = 'Marks left: ' + (gMarks);
    var elMarksLeft = document.querySelector('.marks-left');
    elMarksLeft.innerHTML = strHTML;
}

//When user clicks a cell with no mines around, we need to open
// not only that cell, but also its neighbors
// includes a bonus with recursion
function expandShown(board, a, b) {
    for (var i = a - 1; i <= a + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = b - 1; j <= b + 1; j++) {
            if (j < 0 || j > board[i].length - 1) continue;
            if (i === a && j === b) continue;
            if (!board[i][j].isShown) {
                gGame.showCount++
            }
            if (board[i][j].isMarked) {
                board[i][j].isMarked = false;
                gGame.markedCount--;
                gMarks++;
                showMarksLeft()
            }

            if (board[i][j].minesAroundCount === 0 && !board[i][j].isShown) {
                board[i][j].isShown = true;
                expandShown(board, i, j);
            }
            renderCell(i, j, board[i][j].cellContent);

            board[i][j].isShown = true;
        }
    }
}


//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    if ((gGame.showCount + gGame.markedCount) === gLevel.TOTALCELLS) {
        console.log('showCount', gGame.showCount)
        console.log('markedCount', gGame.markedCount)
        renderSmiley(WIN)
        console.log('You WIN!')
        gameOver()
    }
}

function gameOver() {
    clearInterval(gGameInterval);
    gGame.isOn = false;
}

function renderHearts() {
    var strHTML = '';
    if (gHeartsCount === 3) {
        strHTML = HEART + HEART + HEART;
    } else if (gHeartsCount === 2) {
        strHTML = HEART + HEART + LOSTHEART;
    } else if (gHeartsCount === 1) {
        strHTML = HEART + LOSTHEART + LOSTHEART;
    } else {
        strHTML = LOSTHEART + LOSTHEART + LOSTHEART;
    }

    var elHearts = document.querySelector('.hearts')
    elHearts.innerHTML = strHTML;
}

function renderSmiley(smiley) {
    var strHTML = '';
    if (gGame.isOn) {
        strHTML = smiley;
    }
    var elSmiley = document.querySelector('.smiley');
    elSmiley.innerHTML = strHTML;
}

function startTimer() {
    gStartingTime = new Date().getTime();
    gGameInterval = setInterval(gameTimer, 200);
}

function gameTimer() {
    var now = new Date().getTime();
    var timer = (now - gStartingTime) / 1000;
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = `Time: ${timer}`;
}




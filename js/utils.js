
function renderBoard(board) {
    var strHTML = '<table border="1"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = 'cell';
            var tdId = `cell-${i}-${j}`;
            // strHTML += '<td class="' + className + '"> ' + cell.cellContent + ' </td>';
            strHTML += `<td id="${tdId}" class="${className}" onmousedown="whichButton(event, ${i}, ${j})">
                           
                         </td>`
        }
        strHTML += '</tr>';
    }
    strHTML += '</tbody></table>';
    var elBoard = document.querySelector('.board-container');
    elBoard.innerHTML = strHTML;
}

function countNegs(cellI, cellJ, mat) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j > mat[i].length - 1) continue;
            if (i === cellI && j === cellJ) continue;
            if (mat[i][j].cellContent === MINE) negsCount++;
        }
    }
    return negsCount;
}

// location such as: {i: 2, j: 7}
function renderCell(i, j, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`#cell-${i}-${j}`);
    elCell.innerHTML = value;
}

// Gets a string such as:  'cell-2-7' and returns {i:2, j:7}
function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}


function getEmptyCell() {
	var emptyCells = [];

	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			var currCell = gBoard[i][j];
			if (currCell.cellContent !== MINE) {
				var emptyCellPos = { i, j };
				emptyCells.push(emptyCellPos)
			}
		}
	}
	var randomIdx = getRandomInt(0, emptyCells.length)
	var emptyCell = emptyCells[randomIdx];
	return emptyCell
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
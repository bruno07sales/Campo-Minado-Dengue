import * as game from './game.js';
import * as timer from './timer.js';
import * as graph from './graph.js';

export let boardMatrix = [];
let mosquitoesArray = [];

let isProcessingClick = false;

const LEFT_CLICK = 0;
const RIGHT_CLICK = 2;
export const MOSQUITO_VALUE = '\u{1F99F}';
export const FLAG_VALUE = '\u{1F6A9}';

export function draw({ boardWidth, boardHeight }) {
    const container = document.getElementById('board');
    if (!container) return;
    container.innerHTML = '';

    for (let x = 0; x < boardHeight; x++) {
        const hexRow = document.createElement('div');
        hexRow.className = 'hex-row';
        if (x % 2 === 0) hexRow.classList.add('even');

        for (let y = 0; y < boardWidth; y++) {
            if (boardMatrix[x][y] == null) continue;

            const hex = document.createElement('div');
            hex.id = `${x}-${y}`;
            hex.className = 'hex';
            hex.addEventListener('mousedown', _mouseClickEvent);

            const hexTop = document.createElement('div');
            hexTop.className = 'top';
            const hexMiddle = document.createElement('div');
            hexMiddle.className = 'middle';
            const hexBottom = document.createElement('div');
            hexBottom.className = 'bottom';

            hex.appendChild(hexTop);
            hex.appendChild(hexMiddle);
            hex.appendChild(hexBottom);
            hexRow.appendChild(hex);
        }

        container.appendChild(hexRow);
    }
}

export function generate({ boardWidth, boardHeight, mosquitos }) {
    boardMatrix = [];

    for (let x = 0; x < boardHeight; x++) {
        if (!boardMatrix[x]) boardMatrix[x] = [];

        for (let y = 0; y < boardWidth; y++) {
            if (x % 2 === 0 && y === boardWidth - 1) {
                boardMatrix[x][y] = null;
            } else {
                boardMatrix[x][y] = {
                    value: 0,
                    isSelected: false,
                    isFlagged: false,
                    seen: false,
                };
            }
        }
    }

    _insertMosquitos(boardWidth, boardHeight, mosquitos);
    _updateNumbers(boardWidth, boardHeight);
}

export function selectTileByCord({ x, y }) {
    const tile = document.getElementById(`${x}-${y}`);
    const cell = boardMatrix[x]?.[y];
    if (!tile || !cell || cell.isFlagged || cell.isSelected) return;

    const children = tile.querySelectorAll('.top, .middle, .bottom');
    children.forEach((el) => {
        el.classList.remove('flagged');
        el.classList.add('selected');
    });

    cell.isSelected = true;
    cell.isFlagged = false;
    cell.seen = true;

    if (cell.value !== 0) {
        const middle = tile.querySelector('.middle');
        if (middle) middle.textContent = cell.value;
    }
}

function _mouseClickEvent(event) {
    if (game.isGameOver || isProcessingClick) return;
    if (timer.isRunning === false) timer.start();
    if (event.button === RIGHT_CLICK) event.preventDefault();

    const hexTile = event.currentTarget;
    switch (event.button) {
        case LEFT_CLICK:
            _handleSelection(hexTile);
            break;
        case RIGHT_CLICK:
            _toggleFlag(hexTile);
            break;
    }
}

function _insertMosquitos(boardWidth, boardHeight, mosquitos) {
    mosquitoesArray = [];

    for (let i = 0; i < mosquitos; i++) {
        const x = Math.floor(Math.random() * boardHeight);
        const y = Math.floor(Math.random() * boardWidth);

        if (boardMatrix[x][y] == null || boardMatrix[x][y].value === MOSQUITO_VALUE) {
            i--;
            continue;
        }

        mosquitoesArray.push({ x, y });
        boardMatrix[x][y].value = MOSQUITO_VALUE;
    }
}

function _updateNumbers(boardWidth, boardHeight) {
    for (let x = 0; x < boardHeight; x++) {
        for (let y = 0; y < boardWidth; y++) {
            if (boardMatrix[x][y]?.value !== MOSQUITO_VALUE) continue;

            const modifier = x % 2 !== 0 ? -1 : 0;
            _setNumber(x, y - 1);
            _setNumber(x, y + 1);
            _setNumber(x - 1, y + modifier);
            _setNumber(x - 1, y + 1 + modifier);
            _setNumber(x + 1, y + modifier);
            _setNumber(x + 1, y + 1 + modifier);
        }
    }
}

function _setNumber(x, y) {
    if (
        x >= boardMatrix.length || y >= boardMatrix[0].length ||
        x < 0 || y < 0 ||
        boardMatrix[x][y] == null || boardMatrix[x][y].value === MOSQUITO_VALUE
    ) {
        return;
    }

    boardMatrix[x][y].value += 1;
}

function _toggleFlag(hexTile) {
    const { x, y } = _getHexTileCoord(hexTile.id);
    const cell = boardMatrix[x]?.[y];
    if (!cell || cell.isSelected) return;

    const children = hexTile.querySelectorAll('.top, .middle, .bottom');
    const middle = hexTile.querySelector('.middle');
    if (!middle) return;

    if (cell.isFlagged) {
        middle.textContent = '';
        children.forEach((el) => el.classList.remove('flagged'));
        cell.isFlagged = false;
        game.setMosquitosLeft(game.mosquitosLeft + 1);
    } else {
        middle.textContent = FLAG_VALUE;
        children.forEach((el) => el.classList.add('flagged'));
        cell.isFlagged = true;
        game.setMosquitosLeft(game.mosquitosLeft - 1);
    }
}

function _handleSelection(hexTile) {
    const { x, y } = _getHexTileCoord(hexTile.id);
    const cell = boardMatrix[x]?.[y];
    const middle = hexTile.querySelector('.middle');
    if (!cell || !middle || cell.isFlagged || cell.isSelected) return;

    const isMosquito = cell.value === MOSQUITO_VALUE;

    isProcessingClick = true;
    cell.isSelected = true;

    if (cell.value) {
        middle.textContent = cell.value;
    } else {
        _openZeroTiles({ x, y });
    }

    const children = hexTile.querySelectorAll('.top, .middle, .bottom');
    if (isMosquito) {
        children.forEach((el) => {
            el.classList.remove('selected');
            el.classList.add('mosquito');
        });
        _revealMosquitos();
        game.end('Você perdeu!');
    } else {
        children.forEach((el) => el.classList.add('selected'));
        game.checkWin();
    }

    isProcessingClick = false;
}

function _getHexTileCoord(id) {
    const coordArray = id.split('-');
    const x = Number(coordArray[0]);
    const y = Number(coordArray[1]);
    return { x, y };
}

function _revealMosquitos() {
    mosquitoesArray.forEach(({ x, y }) => {
        const hexTile = document.getElementById(`${x}-${y}`);
        if (!hexTile) return;

        const middle = hexTile.querySelector('.middle');
        if (middle) middle.textContent = boardMatrix[x][y]?.value;

        const children = hexTile.querySelectorAll('.top, .middle, .bottom');
        children.forEach((el) => {
            el.classList.remove('flagged');
            el.classList.add('mosquito');
        });
    });
}

function _openZeroTiles({ x, y }) {
    const algorithm = window.localStorage.getItem('algorithm');
    switch (algorithm) {
        case 'DFS':
            graph.dfs(boardMatrix, { x, y });
            break;
        default:
            graph.bfs(boardMatrix, { x, y });
            break;
    }
}

import * as game from './game.js';
import * as timer from './timer.js';
import * as graph from './graph.js';

export let boardMatrix = [];
let mosquitoesArray = [];

const LEFT_CLICK = 1;
const RIGHT_CLICK = 3;

export function draw({ boardWidth, boardHeight }) {
    const container = document.getElementById("board");
    if (!container) return;
    container.innerHTML = '';

    for(let x = 0; x < boardHeight; x++) {
        const hexRow = document.createElement("div");
        hexRow.className = "hex-row";
        if(x % 2 == 0) hexRow.classList.add("even");

        for(let y = 0; y < boardWidth; y++) {
            if(boardMatrix[x][y] == null) continue;
            const hex = document.createElement("div");
            hex.id = `${x}-${y}`;
            hex.className = "hex";
            hex.addEventListener("mousedown", _mouseClickEvent);

            const hexTop = document.createElement("div");
            hexTop.className = "top";
            const hexMiddle = document.createElement("div");
            hexMiddle.className = "middle";
            const hexBottom = document.createElement("div");
            hexBottom.className = "bottom";

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
    for(let x = 0; x < boardHeight; x++) {
        if(!boardMatrix[x]) boardMatrix[x] = []
        for(let y = 0; y < boardWidth; y++) {
            if(x % 2 == 0 && y == boardWidth - 1) {
                boardMatrix[x][y] = null;
            }else{
                boardMatrix[x][y] = {
                    value: 0,
                    isSelected: false,
                };
            }
        }
    }
    _insertMosquitos(boardWidth, boardHeight, mosquitos);
    _updateNumbers(boardWidth, boardHeight);
}

export function selectTileByCord({x, y}) {
    const tile = document.getElementById(`${x}-${y}`);
    if (!tile) return;
    _removeFlagNative(tile);
    tile.classList.add("selected");
    boardMatrix[x][y].isSelected = true;

    if(boardMatrix[x][y].value !== 0) {
        const middle = tile.querySelector(".middle");
        if (middle) middle.textContent = boardMatrix[x][y].value;
    }
}

function _mouseClickEvent(event) {
    if(game.isGameOver) return;
    if(timer.isRunning === false) timer.start();
    if (event.button === 2) event.preventDefault();

    const $hexTile = $(event.currentTarget);
    switch (event.button) {
        case 0: // Left click
            _handleSelection($hexTile);
            break;
        case 2: // Right click
            _toggleFlag($hexTile);
            break;
    }
}

function _insertMosquitos(boardWidth, boardHeight, mosquitos) {
    mosquitoesArray = [];
    for (let i = 0; i < mosquitos; i++) {
        const x = Math.floor(Math.random() * boardHeight);
        const y = Math.floor(Math.random() * boardWidth);

        if (boardMatrix[x][y] == null || boardMatrix[x][y].value == "🦟")  i--;
        else {
            mosquitoesArray.push({ x, y });
            boardMatrix[x][y].value = "🦟";
        }
    }
}

function _updateNumbers(boardWidth, boardHeight) {
    for (let x = 0; x < boardHeight; x++) {
        for (let y = 0; y < boardWidth; y++) {
            if (boardMatrix[x][y]?.value == "🦟") {
                const modifier = x % 2 != 0 ? -1 : 0
                _setNumber(x, y - 1);
                _setNumber(x, y + 1);
                _setNumber(x - 1, y + modifier);
                _setNumber(x - 1, y + 1 + modifier);
                _setNumber(x + 1, y + modifier);
                _setNumber(x + 1, y + 1 + modifier);
            }
        }
    }
}

function _setNumber(x, y) {
    if (
        x >= boardMatrix.length || y >= boardMatrix[0].length ||
        x < 0 || y < 0 ||
        boardMatrix[x][y] == null || boardMatrix[x][y].value == "🦟"
    ) return;
    boardMatrix[x][y].value += 1;
}

function _toggleFlag($hexTile) {
    const isSelected = $hexTile.children().hasClass("selected");
    if (isSelected) return;

    const hasFlag = $hexTile.find(".middle").text() == "🚩";

    if (hasFlag) {
        $hexTile.find(".middle").text("");
        $hexTile.children().removeClass("flagged");
        game.setMosquitosLeft(game.mosquitosLeft+1);
    } else {
        $hexTile.find(".middle").text("🚩");
        $hexTile.children().addClass("flagged");
        game.setMosquitosLeft(game.mosquitosLeft-1);
    }
}

function _removeFlagNative(hexTile) {
    const middle = hexTile.querySelector(".middle");
    if (!middle) return;
    const hasFlag = middle.textContent === "🚩";
    if (hasFlag) {
        middle.textContent = "";
        hexTile.classList.remove("flagged");
        game.setMosquitosLeft(game.mosquitosLeft + 1);
    }
}

function _handleSelection($hexTile) {
    const hasFlag = $hexTile.find(".middle").text() == "🚩";
    if (hasFlag) return;

    const { x, y } = _getHexTileCoord($hexTile.attr("id"));
    boardMatrix[x][y].isSelected = true;
    const isMosquito = boardMatrix[x][y].value == '🦟';

    if(!!boardMatrix[x][y].value) {
        $hexTile.find(".middle").text(boardMatrix[x][y].value);
    }else{
        _openZeroTiles({x, y});
    }

    if (isMosquito) {
        $hexTile.children().addClass("mosquito");
        _revealMosquitos();
        game.end("Voce perdeu!");
    } else {
        $hexTile.children().addClass("selected");
        game.checkWin();
    }
}

function _getHexTileCoord(id) {
    const coordArray = id.split("-");
    const x = coordArray[0];
    const y = coordArray[1];
    return { x, y }
}

function _revealMosquitos() {
    mosquitoesArray.forEach(({ x, y }) => {
        const $hexTile = $(`#${x}-${y}`);
        $hexTile.find(".middle").text(boardMatrix[x][y]?.value);
        $hexTile.children().addClass("mosquito");
    })
}

function _openZeroTiles({ x, y }) {
    const algorithm = window.localStorage.getItem("algorithm");
    switch (algorithm) {
        case "DFS":
            graph.dfs(boardMatrix, {x, y});
            break;
        default:
            graph.bfs(boardMatrix, {x, y});
            break;
    }
}
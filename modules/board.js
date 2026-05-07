import * as game from './game.js';
import * as timer from './timer.js';
import * as graph from './graph.js';

export let boardMatrix = [];
let mosquitoArray = [];
let isProcessingClick = false;

const LEFT_CLICK = 1;
const RIGHT_CLICK = 3;

export function draw({ boardWidth, boardHeight }) {
    const container = document.getElementById("board");
    container.replaceChildren();

    for(let x = 0; x < boardHeight; x++) {
        const $hexRow = $("<div></div>").addClass("hex-row")
        if(x % 2 == 0) $hexRow.addClass("even");

        for(let y = 0; y < boardWidth; y++) {
            if(boardMatrix[x][y] == null) continue;
            const $hex = $("<div></div>").attr("id", `${x}-${y}`);
            $hex.addClass("hex");
            $hex.mousedown((event) => { _mouseClickEvent(event) });

            const $hexTop = $("<div></div>").addClass("top");
            const $hexMiddle = $("<div></div>").addClass("middle");
            const $hexBottom = $("<div></div>").addClass("bottom");

            $hex.append($hexTop, $hexMiddle, $hexBottom);
            $hexRow.append($hex);
        }

        $("#board").append($hexRow); // ✅ fora do loop de y
    }
}

export function generate({ boardWidth, boardHeight, bombs }) {
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
    _insertBombs(boardWidth, boardHeight, bombs);
    _updateNumbers(boardWidth, boardHeight);
}

export function selectTileByCord({x, y}) {
    const $tile = $(`#${x}-${y}`);
    _removeFlag($tile);
    $tile.children().addClass("selected");
    boardMatrix[x][y].isSelected = true;

    if(boardMatrix[x][y].value !== 0) {
        $tile.find(".middle").text(boardMatrix[x][y].value);
    }
}

function _mouseClickEvent(event) {
    if(game.isGameOver) return;
    if(isProcessingClick) return;
    if(timer.isRunning === false) timer.start();
    if(event.button === 2) event.preventDefault();

    const $hexTile = $(event.currentTarget);
    switch (event.button) {
        case LEFT_CLICK:
            _handleSelection($hexTile);
            break;
        case RIGHT_CLICK:
            _toggleFlag($hexTile);
            break;
    }
}

function _insertBombs(boardWidth, boardHeight, bombs) {
    mosquitoArray = [];
    for (let i = 0; i < bombs; i++) {
        const x = Math.floor(Math.random() * boardHeight);
        const y = Math.floor(Math.random() * boardWidth);

        if (boardMatrix[x][y] == null || boardMatrix[x][y].value == "🦟")  i--;
        else {
            mosquitoArray.push({ x, y });
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
        game.setBombsLeft(game.bombsLeft+1);
    } else {
        $hexTile.find(".middle").text("🚩");
        $hexTile.children().addClass("flagged");
        game.setBombsLeft(game.bombsLeft-1);
    }
}

function _removeFlag($hexTile) {
    const hasFlag = $hexTile.find(".middle").text() == "🚩";
    if (hasFlag) {
        $hexTile.find(".middle").text("");
        $hexTile.children().removeClass("flagged");
        game.setBombsLeft(game.bombsLeft+1);
    }
}

function _handleSelection($hexTile) {
    const hasFlag = $hexTile.find(".middle").text() == "🚩";
    if (hasFlag) return;

    const { x, y } = _getHexTileCoord($hexTile.attr("id"));
    const isBomb = boardMatrix[x][y].value == '🦟';

    isProcessingClick = true;
    boardMatrix[x][y].isSelected = true;
    $hexTile.children().addClass("selected");

    if(!!boardMatrix[x][y].value) {
        $hexTile.find(".middle").text(boardMatrix[x][y].value);
    }else{
        _openZeroTiles({x, y});
    }

    if (isBomb) {
        $hexTile.children().removeClass("selected");
        $hexTile.children().addClass("bomb");
        _revealBombs();
        game.end("Voce perdeu!");
    } else {
        game.checkWin();
    }
    isProcessingClick = false;
}

function _getHexTileCoord(id) {
    const coordArray = id.split("-");
    
    // Validar se o ID tem o formato correto
    if(coordArray.length !== 2) {
        console.error(`ID inválido: ${id}`);
        return { x: -1, y: -1 };
    }
    
    const x = Number(coordArray[0]);
    const y = Number(coordArray[1]);
    
    // Validar se as coordenadas são números válidos
    if(isNaN(x) || isNaN(y)) {
        console.error(`Coordenadas inválidas: x=${x}, y=${y}`);
        return { x: -1, y: -1 };
    }
    
    return { x, y };
}

function _revealBombs() {
    mosquitoArray.forEach(({ x, y }) => {
        const $hexTile = $(`#${x}-${y}`);
        $hexTile.find(".middle").text(boardMatrix[x][y]?.value);
        $hexTile.children().addClass("bomb");
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
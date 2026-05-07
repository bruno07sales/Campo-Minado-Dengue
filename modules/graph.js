import { selectTileByCord as selectNode } from './board.js';

export function bfs(matrix, { x, y }) {
    const queue = {};
    let queueHead = 0;
    let queueTail = 0;

    enqueue({ x: parseInt(x, 10), y: parseInt(y, 10) });

    function enqueue(item) {
        queue[queueTail] = item;
        queueTail++;
    }

    function dequeue() {
        const item = queue[queueHead];
        delete queue[queueHead];
        queueHead++;
        return item;
    }

    function getNodesNotSelected({ x, y }) {
        const neighbors = [];

        const push = (nextX, nextY) => {
            const cell = matrix?.[nextX]?.[nextY];
            if (!cell || cell.isSelected || cell.isFlagged) return;
            neighbors.push({ x: nextX, y: nextY });
        };

        const modifier = x % 2 === 0 ? 1 : -1;
        push(x, y - 1);
        push(x, y + 1);
        push(x + 1, y);
        push(x + 1, y + modifier);
        push(x - 1, y);
        push(x - 1, y + modifier);

        return neighbors;
    }

    while (queueHead < queueTail) {
        getNodesNotSelected(dequeue()).forEach((node) => {
            selectNode(node);
            if (matrix[node.x][node.y]?.value === 0) enqueue(node);
        });
    }
}

export function dfs(matrix, { x, y }) {
    x = parseInt(x, 10);
    y = parseInt(y, 10);

    const cell = matrix?.[x]?.[y];
    if (!cell || cell.seen || cell.isFlagged) return;

    cell.seen = true;
    selectNode({ x, y });

    if (cell.value > 0) return;

    const modifier = x % 2 !== 0 ? -1 : 0;
    dfs(matrix, { x, y: y - 1 });
    dfs(matrix, { x, y: y + 1 });
    dfs(matrix, { x: x - 1, y: y + modifier });
    dfs(matrix, { x: x - 1, y: y + 1 + modifier });
    dfs(matrix, { x: x + 1, y: y + modifier });
    dfs(matrix, { x: x + 1, y: y + 1 + modifier });
}


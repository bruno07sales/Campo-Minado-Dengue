import { selectTileByCord as selectNode } from './board.js'

export function bfs(matrix, {x, y}) {

    let queue = {};
    let queueHead = 0;
    let queueTail = 0;

    x = parseInt(x);
    y = parseInt(y);
    
    // Garantir que célula inicial é adicionada à fila
    enqueue({x, y});

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

    function getNodesNotSelected({x, y}) {

        let neighbors = [];

        const push = (x, y) => {
            if( matrix?.[x] !== undefined
                && matrix?.[x][y] !== undefined
                && matrix[x][y]?.isSelected === false
            ) neighbors.push({x, y});
        };

        const modifier = x % 2 === 0 ? 1 : -1;
        push(x, y-1)
        push(x, y+1)
        push(x+1, y)
        push(x+1, y+modifier)
        push(x-1, y)
        push(x-1, y+modifier)

        return neighbors;
    }

    while(queueHead < queueTail) {
        const current = dequeue();
        const neighbors = getNodesNotSelected(current);
        
        neighbors.forEach((node) => {
            selectNode(node);
            if(matrix[node.x][node.y]?.value === 0) {
                enqueue(node);
            }
        });
    }

}

export function dfs(matrix, {x, y}) {
    // Limpar propriedade 'seen' de chamadas anteriores
    for(let i = 0; i < matrix.length; i++) {
        for(let j = 0; j < matrix[i].length; j++) {
            if(matrix[i][j]) {
                delete matrix[i][j].seen;
            }
        }
    }
    
    x = parseInt(x);
    y = parseInt(y);
    _dfsHelper(matrix, {x, y});
}

function _dfsHelper(matrix, {x, y}) {
    if (
        x < 0 || x >= matrix.length ||
        y < 0 || y >= matrix[0].length ||
        matrix[x][y] == null || 
        matrix[x][y].isSelected === true ||
        matrix[x][y].seen === true
    ) return;

    matrix[x][y].seen = true;
    selectNode({ x, y });

    if (matrix[x][y].value > 0) return;

    const modifier = x % 2 != 0 ? -1 : 0
    _dfsHelper(matrix, {x, y: y - 1});
    _dfsHelper(matrix, {x, y: y + 1});
    _dfsHelper(matrix, {x: x - 1, y: y + modifier});
    _dfsHelper(matrix, {x: x - 1, y: y + 1 + modifier});
    _dfsHelper(matrix, {x: x + 1, y: y + modifier});
    _dfsHelper(matrix, {x: x + 1, y: y + 1 + modifier});
}
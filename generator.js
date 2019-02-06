function newMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x*y;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];  // Top, right, bottom, left
            unvis[i][j] = true;
        }
    }
    
    // Set a random position to start from
    var currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;
    
    // Loop through all available cell positions
    while (visited < totalCells) {
        // Determine neighboring cells
        var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1]+1, 1, 3],
                [currentCell[0]+1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1]-1, 3, 1]];
        var neighbors = new Array();
        
        // Determine if each neighboring cell is in game grid, and whether it has already been checked
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) { neighbors.push(pot[l]); }
        }
        
        // If at least one active neighboring cell has been found
        if (neighbors.length) {
            // Choose one of the neighbors at random
            next = neighbors[Math.floor(Math.random()*neighbors.length)];
            
            // Remove the wall between the current cell and the chosen neighboring cell
            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;
            
            // Mark the neighbor as visited, and set it as the current cell
            unvis[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        // Otherwise go back up a step and keep going
        else {
            currentCell = path.pop();
        }
    }
    return cells;
}

function generate(x, y, levels) {
    let chunkSize = 16;
    let wallThickness = 2;
    let wallWidth = chunkSize + wallThickness;
    let wallHeight = 30;
    let floorSize = 5;
    let originX = -x * chunkSize / 2;
    let originY = floorSize;
    let originZ = -y * chunkSize / 2;

    let mazeData = newMaze(x, y);
    let baseMap = {
        "name":"New Krunker Map",
        "modURL":"",
        "ambient":9937064,
        "light":15923452,
        "sky":14477549,
        "fog":9280160,
        "fogD":900,
        "camPos":[0,floorSize + wallHeight + 3,0],
        "spawns":[[chunkSize / 2, floorSize, chunkSize / 2]],
        "objects":[]
    };

    baseMap.objects.push({
        p: [0, 0, 0],
        s: [x * chunkSize, floorSize, y * chunkSize]
    });

    function insertWall(x, y, vertical) {
        baseMap.objects.push({
            p: [originX + x * chunkSize, originY, originZ + y * chunkSize],
            s: vertical ? [wallThickness, wallHeight, wallWidth] : [wallWidth, wallHeight, wallThickness]
        })
    }

    for (let y = 0; y < mazeData.length; y++) {
        let rowData = mazeData[y];
        for (let x = 0; x < rowData.length; x++) {
            let dirs = rowData[x];

            if (!dirs[0]) insertWall(x + 0.5, y, false);  // Top
            if (!dirs[1]) insertWall(x + 1, y + 0.5, true);  // Right
            if (!dirs[2]) insertWall(x + 0.5, y + 1, false);  // Bottom
            if (!dirs[3]) insertWall(x, y + 0.5, true);  // Left
        }
    }

    return baseMap;
}

let generated = generate(15, 15, 3);
console.log(JSON.stringify(generated));

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
    let chunkSize = 22;
    let wallThickness = 4;
    let wallWidth = chunkSize + wallThickness;
    let wallHeight = 25;
    let floorSize = wallThickness;
    let levelHeight = wallHeight + floorSize;

    let mapWidth = x * chunkSize;
    let mapHeight = y * chunkSize;
    let mapDepth = levels * levelHeight;

    let originX = -x * chunkSize / 2;
    let originY = 0;
    let originZ = -y * chunkSize / 2;

    let spawnOffsetX = levels % 2 == 0 ? (chunkSize / 2) : (mapWidth - chunkSize / 2);
    let spawnOffsetY = levels % 2 == 0 ? (chunkSize / 2) : (mapHeight - chunkSize / 2);
    let baseMap = {
        "name":"New Krunker Map",
        "modURL":"",
        "ambient":9937064,
        "light":15923452,
        "sky":14477549,
        "fog":9280160,
        "fogD":900,
        "camPos":[0, mapDepth + 3, 0],
        "spawns":[[originX + spawnOffsetX, originY + mapDepth, originZ + spawnOffsetY]],
        "objects":[]
    };

    // Add the main side walls
    baseMap.objects.push({  // Top
        p: [originX + mapWidth / 2, originY, originZ],
        s: [mapWidth, levels * levelHeight - floorSize, wallThickness]
    });
    baseMap.objects.push({  // Bottom
        p: [originX + mapWidth / 2, originY, originZ +  mapHeight],
        s: [mapWidth, levels * levelHeight - floorSize, wallThickness]
    });
    baseMap.objects.push({  // Left
        p: [originX, originY, originZ + mapHeight / 2],
        s: [wallThickness, levels * levelHeight - floorSize, mapWidth]
    });
    baseMap.objects.push({  // Right
        p: [originX + mapWidth, originY, originZ + mapHeight / 2],
        s: [wallThickness, levels * levelHeight - floorSize, mapWidth]
    });

    function insertWall(x, y, level, vertical) {
        let yPos = originY + level * levelHeight;
        baseMap.objects.push({
            p: [originX + x * chunkSize, yPos, originZ + y * chunkSize],
            s: vertical ? [wallThickness, wallHeight, wallWidth] : [wallWidth, wallHeight, wallThickness]
        });
    }

    function insertFloor(x, y, level) {
        let yPos = originY + level * levelHeight - floorSize;
        baseMap.objects.push({
            p: [originX + (x + 0.5) * chunkSize, yPos, originZ + (y + 0.5) * chunkSize],
            s: [chunkSize, floorSize, chunkSize]
        });
    }

    // Add the dividers
    for (let level = 0; level < levels; level++) {
        let mazeData = newMaze(x, y);
        for (let y = 0; y < mazeData.length; y++) {
            let rowData = mazeData[y];
            for (let x = 0; x < rowData.length; x++) {
                let dirs = rowData[x];
    
                // Add floor
                if (level == 0 || (level % 2 == 0 ? (x != 0 || y != 0) : (x != rowData.length - 1 || y != mazeData.length - 1))) insertFloor(x, y, level);

                // Add walls; we don't add edges, since we just use large edge walls
                if (y != 0 &&!dirs[0]) insertWall(x + 0.5, y, level, false);  // Top
                if (x != rowData.length - 1 && !dirs[1]) insertWall(x + 1, y + 0.5, level, true);
                if (y != mazeData.length - 1 && !dirs[2]) insertWall(x + 0.5, y + 1, level, false);
                if (x != 0 && !dirs[3]) insertWall(x, y + 0.5, level, true);  // Left
            }
        }
    }

    return baseMap;
}

let generated = generate(8, 8, 15);
console.log(JSON.stringify(generated));

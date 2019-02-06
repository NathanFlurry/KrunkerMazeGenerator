function newMaze(x, y) {  // From: https://github.com/dstromberg2/maze-generator/blob/master/mazegenerator.js
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

function generate(config) {
    let x = config.width;
    let y = config.height;
    let levels = config.levels;

    let chunkSize = config.chunkSize;
    let wallThickness = config.wallThickness;
    let wallWidth = chunkSize + wallThickness;
    let wallHeight = config.wallHeight;
    let floorThickness = config.floorThickness;
    let levelHeight = wallHeight + floorThickness;

    let levelTextures = config.textures;
    let levelColors = config.colors;

    let mapWidth = x * chunkSize;
    let mapHeight = y * chunkSize;
    let mapDepth = levels * levelHeight;

    let originX = -x * chunkSize / 2;
    let originY = 0;
    let originZ = -y * chunkSize / 2;

    let spawnOffsetX = levels % 2 == 0 ? (chunkSize / 2) : (mapWidth - chunkSize / 2);
    let spawnOffsetY = levels % 2 == 0 ? (chunkSize / 2) : (mapHeight - chunkSize / 2);
    let baseMap = {
        "name":config.name,
        "modURL":"",
        "ambient":9937064,
        "light":15923452,
        "sky":14477549,
        "fog":9280160,
        "fogD":900,
        "camPos":[0, mapDepth + 3, 0],
        "spawns":[[originX + spawnOffsetX, originY + mapDepth - wallHeight, originZ + spawnOffsetY]],
        "objects":[]
    };

    function insertWall(x, y, level, vertical) {
        let yPos = originY + level * levelHeight;
        baseMap.objects.push({
            p: [originX + x * chunkSize, yPos, originZ + y * chunkSize],
            s: vertical ? [wallThickness, wallHeight, wallWidth] : [wallWidth, wallHeight, wallThickness],
            t: levelTextures[level % levelTextures.length],
            c: levelColors[level % levelColors.length]
        });
    }

    function insertFloor(x, y, level) {
        let yPos = originY + level * levelHeight;
        baseMap.objects.push({
            p: [originX + (x + 0.5) * chunkSize, yPos - floorThickness / 2, originZ + (y + 0.5) * chunkSize],
            s: [chunkSize, floorThickness / 2, chunkSize],
            t: levelTextures[level % levelTextures.length],
            c: levelColors[level % levelColors.length]
        });
        if (level != 0) {
            baseMap.objects.push({
                p: [originX + (x + 0.5) * chunkSize, yPos - floorThickness, originZ + (y + 0.5) * chunkSize],
                s: [chunkSize, floorThickness / 2, chunkSize],
                t: levelTextures[(level - 1) % levelTextures.length],
                c: levelColors[(level - 1) % levelColors.length]
            });
        }
    }

    function insertObjective(x, y, level) {
        let yPos = originY + level * levelHeight;
        baseMap.objects.push({
            p: [originX + (x + 0.5) * chunkSize, yPos, originZ + (y + 0.5) * chunkSize],
            s: [chunkSize, wallHeight, chunkSize],
            id: 14,
            col: 1
        });
    }

    // Add the dividers
    for (let level = 0; level < levels; level++) {
        // Add the main side walls
        let texture = levelTextures[level % levelTextures.length];
        let color = levelColors[level % levelColors.length];
        let yPos = originY + level * levelHeight;
        baseMap.objects.push({  // Top
            p: [originX + mapWidth / 2, yPos, originZ],
            s: [mapWidth, levelHeight, wallThickness],
            t: texture,
            c: color
        });
        baseMap.objects.push({  // Bottom
            p: [originX + mapWidth / 2, yPos, originZ +  mapHeight],
            s: [mapWidth, levelHeight, wallThickness],
            t: texture,
            c: color
        });
        baseMap.objects.push({  // Left
            p: [originX, yPos, originZ + mapHeight / 2],
            s: [wallThickness, levelHeight, mapHeight],
            t: texture,
            c: color
        });
        baseMap.objects.push({  // Right
            p: [originX + mapWidth, yPos, originZ + mapHeight / 2],
            s: [wallThickness, levelHeight, mapHeight],
            t: texture,
            c: color
        });

        // Add the dividers
        let mazeData = newMaze(x, y);
        for (let y = 0; y < mazeData.length; y++) {
            let rowData = mazeData[y];
            for (let x = 0; x < rowData.length; x++) {
                let dirs = rowData[x];
    
                // Add floor
                let evenLevel = level % 2 == 0;
                let atTopLeft = x == 0 && y == 0;
                let atBottomRight = x == rowData.length - 1 && y == mazeData.length - 1;
                if (level != levels - 1 && (evenLevel ? atBottomRight : atTopLeft)) insertObjective(x, y, level);  // Add score zone
                if (level == 0 || !(evenLevel ? atTopLeft : atBottomRight)) insertFloor(x, y, level);  // Add hole in the floor

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

function readFormConfig() {
    // Read the form values to an object
    let form = document.getElementById("configForm");
    let configRaw = {};
    for (let i = 0; i < form.elements.length; i++) {
        let e = form.elements[i];
        configRaw[e.name] = e.value;
    }

    // Generate the map
    let map;
    try {
        map = generate({
            name: configRaw.name,
            width: parseInt(configRaw.width),
            height: parseInt(configRaw.height),
            levels: parseInt(configRaw.levels),
            chunkSize: parseInt(configRaw.chunkSize),
            wallThickness: parseInt(configRaw.wallThickness),
            wallHeight: parseInt(configRaw.wallHeight),
            floorThickness: parseInt(configRaw.floorThickness),
            textures: configRaw.textures.split(",").map(t => parseInt(t)),
            colors: configRaw.colors.split(",").map(c => parseInt(c, 16))
        });
    } catch(e) {
        alert("Error creating map:\n" + e);
        return;
    }

    // Present the data
    let serialized = JSON.stringify(map);
    var element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(serialized));
    element.setAttribute("download", configRaw.name);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // vindex * this.frameHeight + this.startY
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}


function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

function BoundingCircle(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

BoundingCircle.prototype.collide = function (rect) {
    var x = Math.abs(this.x - (rect.x + (rect.width/2)));
    var y = Math.abs(this.y - (rect.y + (rect.height/2)));

    //console.log(x); console.log(this.x + this.radius);
    if(x > ((rect.width/2) + this.radius)) {
        //console.log("1");
        return false;
    };

    if(y > ((rect.height/2) + this.radius)) { 
        //console.log("2");
        return false;
    };

    if(x <= (rect.width/2)) {
        //console.log("3"); 
        return true;
    };
    if(y <= (rect.height/2)) {
        //console.log("4"); 
        return true;
    };

    var sqx = (x - (rect.width/2)); var sqy = (y - (rect.height/2));
    var corner = (sqx *sqx) + (sqy *sqy);

    return (corner <= ((this.radius)*(this.radius)));
}

/** Coin function */
function Coin(game, x, y){
	this.startX = x;
    this.startY = y;
	this.x = x;
	this.y = y;
	this.width = 50;
	this.height = 50;
    this.isCoin = true;
    this.trap = true;
    this.someX = 0;
    this.deactivate = false;
	this.animation = new Animation(ASSET_MANAGER.getAsset("./img/coin.png"), 0, 0, 100, 100, 0.05, 10, true, false);
	this.boxes = false;
	this.boundingbox = new BoundingBox(this.x + 10, this.y - 40, this.animation.frameWidth, this.animation.frameHeight);
	
	Entity.call(this, game, x, y); // Entity.call(this, game, x, y);
	
}

Coin.prototype = new Entity();
Coin.prototype.constructor = Coin;



Coin.prototype.update = function () {
	if(!this.deactivate) {
		this.x = this.x - this.game.tx;
	    this.y = this.y - this.game.ty;
	} else {
		this.x = 25;
		this.y = 50;
	}
    this.boundingbox = new BoundingBox(this.x + 10, this.y - 40, this.width, this.height);
    
    Entity.prototype.update.call(this);
}

Coin.prototype.draw = function (ctx) {
	if (this.boxes) {
        ctx.strokeStyle = "green";
        ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
//        ctx.strokeStyle = "red";
//        ctx.strokeRect(this.x + 10, this.y - 40, this.animation.frameWidth / 2, this.animation.frameHeight /2);
    }
	this.animation.drawFrame(this.game.clockTick, ctx, this.x + 10, this.y - 40, 0.5);
	
	
	// ctx.fillStyle = "orange";
 //    ctx.font = "bold 2em Arial";
 //    ctx.fillText("Level: " + this.game.level, 625, 50); // TODO score
    
 //    ctx.fillStyle = "orange";
 //    ctx.font = "bold 2em Arial";
 //    ctx.fillText(" x " + this.game.totCoins, 75, 50);
    
    Entity.prototype.draw.call(this);
}

function VisibilityCircle(game, circleG) {
    //this.animation1 = new Animation(ASSET_MANAGER.getAsset("./img/Capture.png"), 0, 0, 10, 10, 0.05, 1, true, false);
    this.circleG = circleG;
    this.gradleTriger = false;
    Entity.call(this, game, 0, 0);
};

VisibilityCircle.prototype = new Entity();

VisibilityCircle.prototype.constructor = VisibilityCircle;

VisibilityCircle.prototype.update = function () {
    if(this.gradleTriger){
        this.circleG -= 5;
        camera = cameraOff;
        this.game.screenOff = true;
        if(this.circleG < 0){
            this.gradleTriger = false;
            this.circleG = 300;
            camera = cameraOn;
            this.game.screenOff = false;
        }
    }
    Entity.prototype.update.call(this);
}

VisibilityCircle.prototype.draw = function (ctx) {
    //this.animation1.drawFrame(this.game.clockTick, ctx, this.x + 10, this.y - 100);
    
    //ctx.fillStyle = "SaddleBrown";
    
    var gradient = ctx.createRadialGradient(400, 400, this.circleG, 400, 400, 0);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);  
    Entity.prototype.draw.call(this);
}

function gameLabel(game) {
    //this.animation1 = new Animation(ASSET_MANAGER.getAsset("./img/Capture.png"), 0, 0, 10, 10, 0.05, 1, true, false);
    this.gameLevel = game.level;
    this.gameTotCoins = game.totCoins;
    this.nextLevelLabel = false;
    this.trapLabel = false;
    this.counter1 = 300;
    this.counter2 = 300;
    Entity.call(this, game, 0, 0);
};

gameLabel.prototype = new Entity();

gameLabel.prototype.constructor = gameLabel;

gameLabel.prototype.update = function () {
    this.gameLevel = this.game.level;
    this.gameTotCoins = this.game.totCoins;
    var that = this;


    if (this.nextLevelLabel){
        this.counter1 -= 2;
        if(this.counter1 < 0){ //TODO hereehrherhehrhehrhe
            this.counter1 = 300;
            this.nextLevelLabel = false;
        }
    }
    if (this.trapLabel){
        this.counter2 -= 2;
        if(this.counter2 < 0){
            this.counter2 = 300;
            this.trapLabel = false;
        }
    }
    Entity.prototype.update.call(this);
}

gameLabel.prototype.draw = function (ctx) {

    ctx.fillStyle = "orange";
    ctx.font = "bold 2em Arial";
    ctx.fillText("Level: " + this.game.level, 625, 50); // TODO score
    
    ctx.fillStyle = "orange";
    ctx.font = "bold 2em Arial";
    ctx.fillText(" x " + this.game.totCoins, 75, 50);

    if(this.nextLevelLabel){
        ctx.fillStyle = "white";
        ctx.font = "bold 3em Arial";
        ctx.fillText("Level: " + this.game.level, 300, 150);
    } 
    if(this.trapLabel){
        ctx.fillStyle = "Red";
        ctx.font = "bold 2em Arial";
        ctx.fillText("You fall on to a trap" , 210, 100);
    }
    Entity.prototype.draw.call(this);
}

function Circle3d(game, x, y, radius) {
    this.radius = radius;
    this.circle = false;
    this.boundingcircle = new BoundingCircle(x, y, radius);
    Entity.call(this, game, x, y);
};

Circle3d.prototype = new Entity();
Circle3d.prototype.constructor = Circle3d;

Circle3d.prototype.collide = function(rect) {
    var x = Math.abs(this.x - (rect.x + (rect.width/2)));
    var y = Math.abs(this.y - (rect.y + (rect.height/2)));

    //console.log(x); console.log(this.x + this.radius);
    if(x > ((rect.width/2) + this.radius)) {
        //console.log("1");
        return false;
    };

    if(y > ((rect.height/2) + this.radius)) { 
        //console.log("2");
        return false;
    };

    if(x <= (rect.width/2)) {
        //console.log("3"); 
        return true;
    };
    if(y <= (rect.height/2)) {
        //console.log("4"); 
        return true;
    };

    var sqx = (x - (rect.width/2)); var sqy = (y - (rect.height/2));
    var corner = (sqx *sqx) + (sqy *sqy);

    return (corner <= ((this.radius)*(this.radius)));
    
    //return x;

};

//var temp = 0;

Circle3d.prototype.update = function () {
	if(this.game.screenOff) return;
    Entity.prototype.update.call(this);


    var speedIncreament = 2;
    var MaxSpeed = 8;
    var padding = 8;


    var ballRotationSpeed = 0.10;

    if(this.game.walkRight){

        //move the maze
        this.game.tx += speedIncreament;
        if(this.game.tx > MaxSpeed){
            this.game.tx = MaxSpeed;
        }

        //rotate ball right
        var xAxis = new THREE.Vector3(0,1,0);
        
        var x = ballRotationSpeed;       

        //create a new bounding circle with padding so that the maze will be able to move
        this.boundingcircle = new BoundingCircle(this.x + padding, this.y, this.radius);

        for (var i = 0; i < this.game.mazePieces.length; i++) {
            var pf = this.game.mazePieces[i];

            if (this.boundingcircle.collide(pf.boundingbox)) { 
                if(!pf.trap && !pf.exit) {
                	this.game.tx = 0;
                    x = 0;
                } else if(pf.isCoin){
                	this.game.totCoins++;
                	pf.isCoin = false;
                	pf.removeFromWorld = true;
                } else if(pf.exit) {
                	this.game.level += 1;
                	this.game.numCoins += 2;
                	this.game.numTraps += 2;
                	nextLevel(++(this.game.mazeSize), this.game);
                } else {
                	if(pf.trapFrame < 8) {
//                		pf.removeFromWorld = true;
                		if(this.game.totCoins !== 0) this.game.totCoins--;

                        //tell user they fall in the trap
                        this.game.gameLabel.trapLabel = true;
                		mazeTrapReset(this.game);
                		this.game.screenOff = true;
                		this.game.tx = 0;
                	}
                }
            } 
            //this.collide(pf.boundingbox);
            //console.log(this.collide(pf.boundingbox));
        
        };

        //update the position of the 3d ball
        rotateAroundWorldAxis(mesh, xAxis, x);

    } else if(this.game.walkLeft){

        //move the maze
        this.game.tx -= speedIncreament;
        if(this.game.tx < - (MaxSpeed)){
            this.game.tx = - (MaxSpeed);
        }

        //rotate ball left
        var xAxis = new THREE.Vector3(0,1,0);
        var x = - (ballRotationSpeed);     

        //create a new bounding circle with padding so that the maze will be able to move
        this.boundingcircle = new BoundingCircle(this.x - padding, this.y, this.radius);

        for (var i = 0; i < this.game.mazePieces.length; i++) {
            var pf = this.game.mazePieces[i];

            
            if (this.boundingcircle.collide(pf.boundingbox)) { 
            	if(!pf.trap) {
            		this.game.tx = 0;
                    x = 0; 
            	} else if(pf.isCoin){
            		this.game.totCoins++;
                	pf.isCoin = false;
                	pf.removeFromWorld = true;
                } else {
                	if(pf.trapFrame < 8) {
//                		pf.removeFromWorld = true;
                		if(this.game.totCoins !== 0) this.game.totCoins--;

                        //tell user they fall in the trap
                        this.game.gameLabel.trapLabel = true;
                		mazeTrapReset(this.game);
                		this.game.screenOff = true;
                		this.game.tx = 0;
                		
                	}
                }
            } 
        
        };
        render();

        //update the position of the 3d ball
        rotateAroundWorldAxis(mesh, xAxis, x);
    }

    if(this.game.goDown){

        //move the maze
        this.game.ty += speedIncreament;
        if(this.game.ty > MaxSpeed){
            this.game.ty = MaxSpeed;
        }

        //rotateball down
        var xAxis = new THREE.Vector3(1,0,0);
        var y = ballRotationSpeed;  

        //create a new bounding circle with padding so that the maze will be able to move
        this.boundingcircle = new BoundingCircle(this.x, this.y + padding, this.radius);

        for (var i = 0; i < this.game.mazePieces.length; i++) {
            var pf = this.game.mazePieces[i];

            
            if (this.boundingcircle.collide(pf.boundingbox)) { 
            	if(!pf.trap) {
            		this.game.ty = 0; 
                    y = 0;
            	} else if(pf.isCoin){
            		this.game.totCoins++;
                	pf.isCoin = false;
                	pf.removeFromWorld = true;
                } else {
                	if(pf.trapFrame < 8) {
//                		pf.removeFromWorld = true;
                		if(this.game.totCoins !== 0) this.game.totCoins--;

                        //tell user they fall in the trap
                        this.game.gameLabel.trapLabel = true;
                		mazeTrapReset(this.game);
                		this.game.screenOff = true;
                		this.game.ty = 0;
                	}
                }
            } 
        };

        //update 3d ball
        rotateAroundWorldAxis(mesh, xAxis, y);
    } else if(this.game.goUp){

        //move the maze
        this.game.ty -= speedIncreament;
        if(this.game.ty < - (MaxSpeed)){
            this.game.ty = - (MaxSpeed);
        }

        //rotateball up
        var xAxis = new THREE.Vector3(1,0,0);
        y = - (ballRotationSpeed);
        

        //create a new bounding circle with padding so that the maze will be able to move
        this.boundingcircle = new BoundingCircle(this.x, this.y - padding, this.radius);

        for (var i = 0; i < this.game.mazePieces.length; i++) {
            var pf = this.game.mazePieces[i];
            //console.log("coin: " + pf.isCoin);

            if (this.boundingcircle.collide(pf.boundingbox)) { 

            	if(!pf.trap) {
            		this.game.ty = 0;
                    y = 0;
            	} else if(pf.isCoin){
            		this.game.totCoins++;
                	pf.isCoin = false;
                	pf.removeFromWorld = true;
                } else {
                	if(pf.trapFrame < 8) {
//                		pf.removeFromWorld = true;
                		if(this.game.totCoins !== 0) this.game.totCoins--;

                        //tell user they fall in the trap
                        this.game.gameLabel.trapLabel = true;
                		mazeTrapReset(this.game);
                		this.game.screenOff = true;
                		this.game.ty = 0;
                	}
                }

            } 
            //console.log(this.collide(pf.boundingbox));
        
        };

        //update ball
        rotateAroundWorldAxis(mesh, xAxis, y);
    }

    if(this.game.payPath && this.game.totCoins >= 10){ //TODO coins to cash
    	this.game.totCoins -= 10;
        //reset the enities color back to transparent
        for(var i = 0; i < this.game.entities.length; i++) {
            var temp = this.game.entities[i];
            if(temp instanceof(testMazePath)) {
                //console.log("column " + temp.row + "row " + temp.column);
                temp.color = 1;
            }
        }

        var pf = this.game.mazePieces[0];
        var r, c;

        if(pf.x >= 175){
            c = 1;
        } else {
            c = Math.floor((185 + 175 - (pf.x)) / 175);
        }
        if(pf.y >= 265){
            r = 0;
        } else {
            r = Math.floor((265 + 175 - pf.y) / 175);
        }
        
        
        //solve the path in respect to where you are
        pathSolver(this.game, r, c);
        console.log("r " + r + " c " + c);
        console.log("x " + pf.x + " y " + pf.y);
        
        this.game.payPath = false;
    } else if(this.game.payPath) {
    	this.game.payPath = false;
    }

    //console.log(this.game.timer);
    
    
};

Circle3d.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "transparent";
    ctx.fillStyle = "transparent";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

    if (this.circle) {
        ctx.beginPath();
        //ctx.fillStyle = "green";
        ctx.arc(this.boundingcircle.x, this.boundingcircle.y, this.boundingcircle.radius, 0, Math.PI * 2, false);
        //ctx.fill();
        ctx.stroke();
    }

    //render the 3d
    render();
};

function testMazePath(game, x, y, r, c){
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
    this.column = c;
    this.row = r;
    this.colors = ["Red", "transparent" ];
    this.color = 1;

    this.someX = 0;
    
    this.boxes = true;
    
    Entity.call(this, game, x, y); // Entity.call(this, game, x, y);
    
}

testMazePath.prototype = new Entity();
testMazePath.prototype.constructor = testMazePath;

testMazePath.prototype.update = function () {
    this.x = this.x - this.game.tx;
    this.y = this.y - this.game.ty;
    Entity.prototype.update.call(this);
}

testMazePath.prototype.draw = function (ctx) {
    if (this.boxes) {

        //ctx.strokeStyle = "green";
        ctx.fillStyle = this.colors[this.color];
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
    }


    Entity.prototype.draw.call(this);
}


function mazeTrapReset(game) { 
	for (var i = 0; i < game.mazePieces.length; i++) {
		game.mazePieces[i].x = game.mazePieces[i].startX;
		game.mazePieces[i].y = game.mazePieces[i].startY;
		game.mazePieces[i].update();
	}
	for(var i = 0; i < game.entities.length; i++) {
		var temp = game.entities[i];
		if(temp instanceof(testMazePath)) {
			temp.x = temp.startX;
			temp.y = temp.startY;
		} else if(temp instanceof(VisibilityCircle)){
            temp.gradleTriger = true;
        }
	}
}

function MazePiece(game, x, y, width, height, isTrap, isExit, isHorizontalTrap) {
    this.width = width;
    this.height = height;
    this.startX = x;
    this.startY = y;
    this.moveIncrement = 0;
    this.exit = isExit;
    if(isTrap && isHorizontalTrap) {
    	this.boundingbox = new BoundingBox(x, y + 45, height, width - 25);
    } else if(isTrap){
    	this.boundingbox = new BoundingBox(x + 55, y, width - 25, height);
    } else {
    	this.boundingbox = new BoundingBox(x, y, width, height);
    }
    
    
    this.boxes = false;  // TODO bounding boxes true/false
    this.trap = isTrap;
    this.horizontalTrap = isHorizontalTrap; 
    if(this.trap && this.horizontalTrap){ // currentFrame
    	this.animationHorizontal = new Animation(ASSET_MANAGER.getAsset("./img/trap1.png"), 0, 0, 252, 144, 0.27, 14, true, false); // running
    } else if(this.trap){
    	this.animationVertical = new Animation(ASSET_MANAGER.getAsset("./img/trap2.png"), 0, 0, 144, 252, 0.27, 14, true, false); // running
    }
	Entity.call(this, game, x, y);
}

MazePiece.prototype = new Entity();
MazePiece.prototype.constructor = MazePiece;

MazePiece.prototype.update = function () {
	
    
    this.x = this.x - this.game.tx;
    this.y = this.y - this.game.ty;
    if(this.trap && this.horizontalTrap) {
    	this.boundingbox = new BoundingBox(this.x, this.y + 45, this.height, this.width - 25);
    	this.trapFrame = this.animationHorizontal.currentFrame(); 
    } else if(this.trap){
    	this.boundingbox = new BoundingBox(this.x + 55, this.y, this.width - 25, this.height);
    	this.trapFrame = this.animationVertical.currentFrame();
    } else {
    	this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    }
    
    Entity.prototype.update.call(this);
    
}

MazePiece.prototype.draw = function (ctx) {
    
	if(this.trap) {
//		ctx.fillStyle = "blue";
//		ctx.fillRect(this.x, this.y, this.width, this.height);
		if(this.horizontalTrap) {
			this.animationHorizontal.drawFrame(this.game.clockTick, ctx, this.x - 10, this.y + 40, .68);
		} else {
			this.animationVertical.drawFrame(this.game.clockTick, ctx, this.x + 50, this.y, .68);
			
		}
	} else if(this.startTop) {
		ctx.fillStyle = "transparent";
		ctx.fillRect(this.x, this.y, this.width, this.height);
	} else if(this.exit){
		ctx.drawImage(ASSET_MANAGER.getAsset("./img/exitFlag.png"), this.x, this.y, this.width, this.height);
	} else {
//		ctx.fillStyle = "black";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.drawImage(ASSET_MANAGER.getAsset("./img/bricks.jpg"), this.x, this.y, this.width, this.height);
	}
    
    if (this.boxes) {
            ctx.strokeStyle = "green";
            ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
    }
   
    Entity.prototype.draw.call(this);
}

function Maze(x, y, game) {
	this.maze = getMazeField(generateMaze(x,y));
//	addCoins(rows, cols, maze, numOfcoins) {
    this.length = this.maze[0].length;
    this.width = this.maze.length;
    addCoins(this.length, this.width, this.maze, game.numCoins);  
    addTraps(this.length, this.width, this.maze, game.numTraps);
    
	this.printMaze = function() {
		var string = '';
		console.log('The Maze length: ' + this.length);
		console.log('The Maze width: ' + this.width);
		for(var r = 0; r < this.length; r++) {
			for(var c = 0; c < this.width; c++) {
				string += this.maze[r][c] + " ";
			}
			string += '\r\n';
		}
		console.log(string);
	}	
};

function createMazePieces(game, maze, mazeP) {
	var mazePieces = [];
//    console.log(maze.length);
	var tempCoins = [];
	for(var r = 0; r < maze.width ; r++) {
		for(var c = 0; c < maze.maze[0].length  ; c++) {
//			string += maze.maze[r][c] + " ";
			if(maze.maze[r][c] === 'X') {
				var pl = new MazePiece(game, (c * 175) + 175, (r * 175) + 295 , 175, 175, false, false, false); // x, y, width, height
				game.addEntity(pl);
				mazePieces.push(pl); 
			} else if (maze.maze[r][c] === 'C') {
//				var pl = new Coin(game, (c * 175) + 195, (r * 175) + 355); // // x, y, width, height
//				game.addEntity(pl);
//				mazePieces.push(pl);
				tempCoins.push(new Coin(game, (c * 175) + 195 + 35, (r * 175) + 355 + 35));
			} else if(maze.maze[r][c] === 'T') {
				var isHorirontal = false;
				if(maze.maze[r][c - 1] === 'X' || maze.maze[r][c + 1] === 'X') isHorirontal = true;
				var pl = new MazePiece(game, (c * 175) + 175, (r * 175) + 295 , 100, 175, true, false, isHorirontal); // x, y, width, height
				game.addEntity(pl);
				mazePieces.push(pl); 
			} else if(maze.maze[r][c] === 'E') {
				var pl = new MazePiece(game, (c * 175) + 175, (r * 175) + 295 , 175, 175, false, true, false); // x, y, width, height
				game.addEntity(pl);
				mazePieces.push(pl); 
			}

			if(maze.maze[r][c] !== 'X' && maze.maze[r][c] !== 'E') {
                var pl = new testMazePath(game, (c * 175) + 250, (r * 175) + 400, r, c); // x, y, width, height
                game.addEntity(pl);
            }
		}
//		string += '\r\n';
	}
	
	var shade = new VisibilityCircle(game, 300); //TODO  shade
    shade.gradleTriger = true;
    game.addEntity(shade);
    
	for(var i = 0; i < tempCoins.length; i++) {
		var pl = tempCoins[i];
		game.addEntity(pl);
		mazePieces.push(pl);
		
	}
	// Static coin counter
	var pl = new Coin(game, 0, 50)
	pl.deactivate = true;
	game.addEntity(pl);
	
	//Starting block blocker
    var pl = new MazePiece(game, ( 175) + 175, (-175) + 295 , 175, 175);
    pl.startTop = true;
    pl.boxes = false;
    game.addEntity(pl);
    mazePieces.push(pl);
	return mazePieces;
};

//solve the path with the current x, y coordinate
function pathSolver(game, r, c){
    var correctPath = new Maze(game.mazeSize, game.mazeSize, game);
    var temp = new Maze(game.mazeSize, game.mazeSize, game);

    var ms = new solveMaze(game.myMaze, correctPath.maze, temp.maze);
    console.log(ms.traverse(r, c));
    printMaze(correctPath.maze);

    this.length = game.myMaze.length;
    this.width = game.myMaze[0].length;

    for(var r = 0; r < this.length; r++) {
        for(var c = 0; c < this.width; c++) {
            if(correctPath.maze[r][c]){
                for(var t = 0; t < game.entities.length; t++){
                    var cp = game.entities[t];
                    if(cp instanceof(testMazePath) && cp.row === r && cp.column ===c){
                        cp.color = 0;
                    }
                }
            }  
        }
    }

};

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

//ASSET_MANAGER.queueDownload("./img/ninja.png");
ASSET_MANAGER.queueDownload("./img/coin.png");
ASSET_MANAGER.queueDownload("./img/bricks.jpg");
ASSET_MANAGER.queueDownload("./img/trap2.png"); // pre-download of .png images.
ASSET_MANAGER.queueDownload("./img/trap1.png");
ASSET_MANAGER.queueDownload("./img/exitFlag.png");


ASSET_MANAGER.downloadAll(function () {
	
    console.log("starting up da sheild");
    
	var  canvas = document.getElementById('gameWorld');
	canvas.focus();
	var   ctx = canvas.getContext('2d');
    
    
    var gameEngine = new GameEngine();
    gameEngine.mazeSize = 3;
    gameEngine.level = 1;
    gameEngine.totCoins = 0;
    gameEngine.numTraps = 0;
    gameEngine.numCoins = 3;
    gameEngine.screenOff = false;
    gameEngine.showSolution = false;

    //instantiate the 3d ball
    init();
    
    var myMaze = new Maze(gameEngine.mazeSize, gameEngine.mazeSize, gameEngine);
    var myMazeC = new Maze(gameEngine.mazeSize, gameEngine.mazeSize, gameEngine);
    var myMazeW = new Maze(gameEngine.mazeSize, gameEngine.mazeSize, gameEngine);
    myMaze.printMaze();

    //make the myMaze a game entity variable
    gameEngine.myMaze = myMaze.maze;
   
    var ms = new solveMaze(myMaze.maze, myMazeC.maze, myMazeW.maze);
    console.log(ms.traverse(0, 1));
    printMaze(myMazeW.maze);


     var mazePieces = createMazePieces(gameEngine, myMaze, myMazeC.maze);

    
    //mazePieces.push(pl);
   
    gameEngine.mazePieces  = mazePieces;


//    var ninja = new Ninja(gameEngine); Dont need



    var circle3d = new Circle3d(gameEngine, 399.5, 399, 40);
    gameEngine.addEntity(circle3d);

    var gamelabel = new gameLabel(gameEngine);
    gameEngine.addEntity(gamelabel);
    gameEngine.gameLabel = gamelabel;

//    gameEngine.addEntity(shade);
    //gameEngine.addEntity(ninja);
    
    gameEngine.init(ctx);
    gameEngine.start();
});

function nextLevel(mazeSize, game) {
	var so = false
    
    
    //remove the enities
	for(var i = 0; i < game.entities.length; i++) {
		var temp = game.entities[i];
		if(temp instanceof(testMazePath) || temp instanceof(VisibilityCircle) || temp instanceof(Coin) || temp instanceof(gameLabel)) {
			temp.removeFromWorld = true;
		}
	}
	
	for (var i = 0; i < game.mazePieces.length; i++) {
		game.mazePieces[i].removeFromWorld = true;
	}
	
	
	var myMaze = new Maze(mazeSize, mazeSize, game);

	var myMazeC = new Maze(mazeSize, mazeSize, game);
    var myMazeW = new Maze(mazeSize, mazeSize, game);

    myMaze.printMaze();

    //make the maze we are solving a game variable
    game.myMaze = myMaze.maze;

   
    var ms = new solveMaze(myMaze.maze, myMazeC.maze, myMazeW.maze);
    console.log(ms.traverse(0, 1));
    printMaze(myMazeC.maze);


    var mazePieces = createMazePieces(game, myMaze, myMazeC.maze);

    game.mazePieces  = mazePieces;

    var gamelabel = new gameLabel(game);
    gamelabel.nextLevelLabel = true;
    game.addEntity(gamelabel);

    game.gameLabel = gamelabel;

}


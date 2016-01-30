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

function MazePiece(game, x, y, width, height) {
    this.width = width;
    this.height = height;
    this.startX = x;
    this.startY = y;
    this.moveIncrement = 0;
    this.boundingbox = new BoundingBox(x, y, width, height);

    
    Entity.call(this, game, x, y);
    this.radius = 200;
}

MazePiece.prototype = new Entity();
MazePiece.prototype.constructor = MazePiece;

MazePiece.prototype.update = function () {
    
    /*for(var i = 0; i < this.game.entities.length; i++){
        var mazepiece = this.game.entities[i];
        if(mazepiece instanceof Ninja){
            this.x = this.x - mazepiece.tx;
            this.y = this.y - mazepiece.ty;
            //console.log(mazepiece.tx);
        }
    }*/

    this.x = this.x - this.game.tx;
    this.y = this.y - this.game.ty;
    this.boundingbox = new BoundingBox(this.x, this.y, this.width, this.height);
    Entity.prototype.update.call(this);
    
}

MazePiece.prototype.draw = function (ctx) {
    //ctx.drawImage(ASSET_MANAGER.getAsset("./img/Maze.png"), 0, 0, 800, 800);
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height); 

    Entity.prototype.draw.call(this);
}




function Ninja(game) {
    //this.animation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 0, 0, 206, 110, 0.02, 30, true, true);
    //this.jumpAnimation = new Animation(ASSET_MANAGER.getAsset("./img/RobotUnicorn.png"), 618, 334, 174, 138, 0.02, 40, false, true);

    this.animation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 0, 0, 50, 77, 0.05, 1, true, false);
    this.walkRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 0, 155, 50, 77, 0.08, 8, true, false);
    this.LookRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 0, 155, 50, 77, 0.08, 1, true, false);
    this.walkLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 0, 77, 50, 77, 0.08, 8, true, false);
    this.LookLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 0, 77, 50, 77, 0.08, 1, true, false);
    this.goUpAndDownAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 200, 0, 50, 77, 0.08, 4, true, false);
    this.jumpRightAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 200, 309, 50, 77, 0.13, 3, false, false);
    this.jumpLeftAnimation = new Animation(ASSET_MANAGER.getAsset("./img/ninja.png"), 0, 309, 50, 77, 0.13, 3, false, true);
    
    this.radius = 100;
    this.ground = 430;
    this.boxes = true;
    this.stay = true;
    this.boundingbox = new BoundingBox(this.x, this.y, this.animation.frameWidth, this.animation.frameHeight);
    this.lookRight = null;
    this.lookLeft = null;
    this.lookDownAndUp = null;

    //used this trigers for the colision detections
    this.t1 = null;
    this.t2 = null;
    this.t3 = null;
    //this.tx = 0;
    //this.ty = 0;
    this.platform = game.mazePieces[0];

    Entity.call(this, game, 370, 360);
}

Ninja.prototype = new Entity();
Ninja.prototype.constructor = Ninja;

Ninja.prototype.update = function () {

    if (this.game.jumping && this.lookRightOrLeftActive) {
        

        if (this.jumpRightAnimation.isDone()) {
            this.jumpRightAnimation.elapsedTime = 0;
            this.game.jumping = false;
        } else if (this.jumpLeftAnimation.isDone()) {
            this.jumpLeftAnimation.elapsedTime = 0;
            this.game.jumping = false;
        }
        
        var jumpDistance;
        if(this.lookRight){
            jumpDistance = this.jumpRightAnimation.elapsedTime / this.jumpRightAnimation.totalTime;
             //this.x += 10;
             this.boundingbox = new BoundingBox(this.x, this.y, this.jumpRightAnimation.frameWidth, this.jumpRightAnimation.frameHeight);
        } else if(this.lookLeft){
            jumpDistance = this.jumpLeftAnimation.elapsedTime / this.jumpLeftAnimation.totalTime;
            this.boundingbox = new BoundingBox(this.x, this.y, this.jumpLeftAnimation.frameWidth, this.jumpLeftAnimation.frameHeight);
             //this.x -= 10;
        }
         
        var totalHeight = 50;

        if (jumpDistance > 0.5){
            jumpDistance = 1 - jumpDistance;
        }
            

        //var height = jumpDistance * 2 * totalHeight;
        var height = totalHeight*(-4 * (jumpDistance * jumpDistance - jumpDistance));

        this.y = this.ground - height; 
        //console.log(this.y);
        
        
    } else if(this.game.walkRight && !this.game.goDown && !this.game.goUp){
        
        this.lookRightOrLeftActive = true;
        this.lookLeft = false;
        //this.stay = false;
        this.ground = this.y;
        this.lookRight = true;

        this.boundingbox = new BoundingBox(this.x, this.y, this.walkRightAnimation.frameWidth, this.walkRightAnimation.frameHeight);
        for (var i = 0; i < this.game.mazePieces.length; i++) {
                var pf = this.game.mazePieces[i];
                console.log(this.game.tx);
                if (this.boundingbox.collide(pf.boundingbox) && this.t1 && this.t2) {
                    //this.x = pf.boundingbox.left - this.animation.frameWidth + 10;                             
                    this.game.tx = 0;
                    this.platform = pf;
                    
                    break;
                } else {
                    this.game.tx = 1;
                }
            }
        this.t1 = true;
        this.t2 = true;
        //console.log(this.tx);
        //this.x += 1;
    } else if(this.game.walkLeft && !this.game.goDown && !this.game.goUp){
        this.lookLeft = true;
        
        this.lookRightOrLeftActive = true;
        this.ground = this.y;
        
        this.boundingbox = new BoundingBox(this.x, this.y, this.walkLeftAnimation.frameWidth, this.walkLeftAnimation.frameHeight);
        for (var i = 0; i < this.game.mazePieces.length; i++) {
                var pf = this.game.mazePieces[i];
                console.log(this.game.tx);
                if (this.boundingbox.collide(pf.boundingbox) && !this.t1 && !this.t2) {
                    //this.x = pf.boundingbox.left - this.animation.frameWidth + 10;                             
                    this.game.tx = 0;
                    break;
                } else {
                    this.game.tx = -1;
                }
            }
        this.t1 = false;
        this.t2 = false;
       
        this.lookRight = false;
        //this.x -= 1;
    } else if(this.game.goUp ){
        
         this.boundingbox = new BoundingBox(this.x, this.y, this.goUpAndDownAnimation.frameWidth, this.goUpAndDownAnimation.frameHeight);
        for (var i = 0; i < this.game.mazePieces.length; i++) {
                var pf = this.game.mazePieces[i];
                console.log(this.boundingbox.collide(pf.boundingbox) && this.lookDownAndUp);
                if (this.boundingbox.collide(pf.boundingbox) && this.t1 && !this.t2) {
                    //this.x = pf.boundingbox.left - this.animation.frameWidth + 10;                             
                    this.game.ty = 0;
                    //this.platform = pf;
                    break;
                } else {
                    this.game.ty = -1;
                }
            }
        this.t1 = true;
        this.t2 = false;


        this.lookRightOrLeftActive = false;
        this.lookLeft = false;
        this.lookRight = false;
   
        //this.y -= 1;
    } else if(this.game.goDown){
         this.boundingbox = new BoundingBox(this.x, this.y, this.goUpAndDownAnimation.frameWidth, this.goUpAndDownAnimation.frameHeight);
        for (var i = 0; i < this.game.mazePieces.length; i++) {
                var pf = this.game.mazePieces[i];
                console.log(this.game.ty);
                if (this.boundingbox.collide(pf.boundingbox) && !this.t1 && this.t2) {
                    //this.x = pf.boundingbox.left - this.animation.frameWidth + 10;                             
                    this.game.ty = 0;
                    //this.platform = pf;
                    break;
                } else {
                    this.game.ty = 1;
                }
            }

        this.t1 = false;
        this.t2 = true;

        this.lookRightOrLeftActive = false;
        this.lookLeft = false;
        this.lookRight = false;

        //this.y += 1;
    }
    

    Entity.prototype.update.call(this);
}

Ninja.prototype.draw = function (ctx) {
    if (this.game.jumping && this.lookRight) {
        this.jumpRightAnimation.drawFrame(this.game.clockTick, ctx, this.x + 10, this.y - 40);
    }else if (this.game.jumping && this.lookLeft) {
        this.jumpLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x + 10, this.y - 40);
    } else if (this.game.walkRight && !this.game.goDown && !this.game.goUp){
        this.walkRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
         if (this.boxes) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.x, this.y, this.walkRightAnimation.frameWidth, this.walkRightAnimation.frameHeight);
            ctx.strokeStyle = "green";
            ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
        }
    } else if (this.game.walkLeft){
        this.walkLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.lookLeft) {
        this.LookLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.lookRight){
        this.LookRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.game.goUp && !this.game.walkRight && !this.game.walkLeft){
        this.goUpAndDownAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else if (this.game.goDown){
        this.goUpAndDownAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } else {
        this.animation.drawFrame(this.game.clockTick, ctx, this.x, this.y);
    } 
   
       
    Entity.prototype.draw.call(this);
}

function VisibilityCircle(game) {
    //this.animation1 = new Animation(ASSET_MANAGER.getAsset("./img/Capture.png"), 0, 0, 10, 10, 0.05, 1, true, false);
    Entity.call(this, game, 0, 0);
}
VisibilityCircle.prototype = new Entity();
VisibilityCircle.prototype.constructor = VisibilityCircle;

VisibilityCircle.prototype.update = function () {
    Entity.prototype.update.call(this);
}

VisibilityCircle.prototype.draw = function (ctx) {
    //this.animation1.drawFrame(this.game.clockTick, ctx, this.x + 10, this.y - 100);
    Entity.prototype.draw.call(this);
    //ctx.fillStyle = "SaddleBrown";
    
    var gradient = ctx.createRadialGradient(400, 400, 150, 400, 400, 0);
    gradient.addColorStop(0, "black");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);  
}

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/ninja.png");
ASSET_MANAGER.queueDownload("./img/Maze.png");
ASSET_MANAGER.queueDownload("./img/Capture.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

    var gameEngine = new GameEngine();
    var mazePieces = [];
    var pl = new MazePiece(gameEngine, 200, 300, 100, 100);
    gameEngine.addEntity(pl);
    mazePieces.push(pl);
    pl = new MazePiece(gameEngine, 500, 300, 100, 100);
    gameEngine.addEntity(pl);
    mazePieces.push(pl);
   
    pl = new MazePiece(gameEngine, 400, 200, 100, 100);
    gameEngine.addEntity(pl);
    mazePieces.push(pl);

    pl = new MazePiece(gameEngine, 400, 450, 100, 100);
    gameEngine.addEntity(pl);
    mazePieces.push(pl);
   
    gameEngine.mazePieces  = mazePieces;

    var ninja = new Ninja(gameEngine);
    var box = new VisibilityCircle(gameEngine);

    //gameEngine.addEntity(bg);
    //gameEngine.addEntity(box);
    gameEngine.addEntity(ninja);
 
    gameEngine.init(ctx);
    gameEngine.start();
});

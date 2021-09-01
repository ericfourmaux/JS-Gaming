const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

context.canvas.height = 300;
context.canvas.width = 600;

// Create the player, and the projectiles
let projectiles = [];
let enemies = [];
let pickups = [];
let platforms = [];
let collected = 0;
let score = 0;

// Define a player
// ***************
class Player{
    constructor(x ,y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.width = 32;
        this.height = 32;
        this.jump = true;
        this.isOnGround = true;
        this.hasShot = false;
    }

    draw() {
        context.fillStyle = '#ff0000'; 
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.fill();
    }
}

// Define a projectile
// *******************
class Pickup{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 9;
        this.width = this.radius;
        this.height = this.radius;
        this.color = 'yellow';
        this.isColliding = false;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }
}

// Define a projectile
// *******************
class Projectile{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.width = this.radius;
        this.height = this.radius;
        this.color = 'orange';
        this.velocity = 5;
        this.isColliding = false;
    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
    }

    update() {
        this.draw();
        this.x = this.x + this.velocity;
    }
}

// Define an enemy
// ***************
class Enemy{
    constructor(x, y) {
        this.width = 32;
        this.height = 56;
        this.x = x;
        this.y = y;
        this.velocity = 1.5;
        this.isColliding = false;
    }

    draw() {
        context.fillStyle = '#993300'; 
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.fill();
    }

    update() {
        this.draw();
        this.x = this.x - this.velocity;
    }
}

class Platform{
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 30;
        this.isColliding = false;
    }

    draw() {
        context.fillStyle = '#cc00ff'; 
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.fill();
    }
}

let player;
player = new Player(context.canvas.width / 2, 0);

// Display a new pickup
setInterval( () => {
    pickups = [];
    pickups.push(new Pickup(Math.random()*canvas.width, canvas.height - 32 - (player.height/2)));
}, 10000);

// Create an enemy
setInterval( function() {
    enemies.push(new Enemy(canvas.width-32, canvas.height-88));
}, 5000);



// Handle keys
// ***********
let controller = {
    left: false,
    right: false,
    up: false,
    down: false,
    fire: false,

    keyListener:function(event) {
        var key_state = (event.type == 'keydown') ? true : false;

        switch(event.keyCode){
            case 37:            // Right key
                controller.right = key_state;
                break;

            case 38:            // Up key
                controller.up = key_state;
                break;

            case 39:            // Left key
                controller.left = key_state;
                break;

            case 40:
                controller.down = key_state;
                break;

            case 32:            // Space key
                controller.fire = key_state;
                break;
        }
    }
};

// Define the loop game
// ********************
let loop = function() {
    // ...re-draw everything indefinitely
    window.requestAnimationFrame(loop);
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Add sky
    context.fillStyle = '#cceeff'; 
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
    // Add ground
    context.fillStyle = '#008000'; 
    context.beginPath();
    context.rect(0, canvas.height-32, canvas.width, canvas.height-32);
    context.fill();
    // Draw the ground line
    context.strokeStyle = '#202830';
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(0, canvas.height - 32);
    context.lineTo(canvas.width, canvas.height - 32);
    context.stroke();


    // Draw the player
    player.draw();



    if (controller.up && !player.jump) {
        player.velocityY -= 20;
        player.jump = true;
        player.isOnGround = false;
    }

    if (controller.right) {
        player.velocityX -= 0.5;  // Adds or remove easing effect on the player
    }

    if (controller.left) {
        player.velocityX += 0.5;
    }

    if (controller.down) {
        player.height = 22;
    }

    if (controller.fire && player.hasShot == false) {
        projectiles.push(new Projectile( (player.x + player.width), (player.y + (player.height / 2)) ));
        player.hasShot = true;
    }



    player.velocityY += 1.5; // Gives gravity to the player (on every frame)
    player.x += player.velocityX;
    player.y += player.velocityY;
    player.velocityX *= 0.9 // Adds friction in X
    player.velocityY *= 0.9 // Adds friction in Y

    if (!controller.down) {
        player.height = 32;
    }


    // Puts the player on the ground
    if (player.y > canvas.height - 32 - player.height) {
        player.jump = false;
        player.y = canvas.height - 32 - player.height;
        player.velocityY = 0;
        player.isOnGround = true;
    }

    // Define the limits of the gameplay
    if (player.x >= canvas.width - player.width) {
        player.x = canvas.width - player.width;
    } else if (player.x <= 0) {
        player.x = 0;
    }

    // Draw and detect collision with platforms
    // Draw the platform
    // let platform = new Platform(300, canvas.height - 32 - 60);
    platforms.push(new Platform(300, canvas.height - 29 - 60));
    platforms.push(new Platform(200, canvas.height - 64 - 60));
    platforms.push(new Platform(50, canvas.height - 64 - 60));
    platforms.forEach((platform) => {
        platform.draw();

        var direction = platformDetect(player, platform);

        if(direction == "left" || direction == "right"){
            player.velocityX = 0;
        } else if(direction == "bottom"){
            player.jump = false;
            // player.velocityX = 0;
            player.isOnGround = true;
        } else if(direction == "top"){
            // player.velocityY *= -1;
            // player.velocityX += 1;
        }
    });
    

    pickups.forEach((pickup) => {
        pickup.draw();
        if (collisionDetect(player, pickup)) {
            collected ++;
            pickups.splice(pickup, 1);
            console.log("Pickups collected: " + collected);
        }
    });

    // Update each projectile
    projectiles.forEach((projectile, projectileIndex) => {
        if (projectile.x >= canvas.width) { 
            projectiles.splice(projectileIndex, 1);
            player.hasShot = false;
        } else {
            projectile.update();
        }
    });

    // Check if an enemy collides with a projectile (or the player)
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        projectiles.forEach((projectile, projectileIndex) => {
            if (collisionDetect(projectile, enemy)) {
                setTimeout(() => {
                    player.hasShot = false;
                    enemies.splice(enemyIndex, 1);
                    projectiles.splice(projectileIndex, 1);
                    score ++;
                    console.log("Score: " + score);
                },1);
            }
        });

        if (collisionDetect(player, enemy)) {
            console.log("Ouch!");
        }

        if (enemyIndex.x <= 0) {
            setTimeout(() => {
                enemies.splice(enemyIndex, 1);
            },1);
        }
    });
};



// Collision detection
function collisionDetect(object1, object2) {
    if (object1 == null || object2 == null) {
        return false;
    }

    var left1 = object1.x;
    var left2 = object2.x;
    var right1 = object1.x + object1.width;
    var right2 = object2.x + object2.width;
    var top1 = object1.y;
    var top2 = object2.y;
    var bottom1 = object1.y + object1.height;
    var bottom2 = object2.y + object2.height;
                
    if (bottom1 < top2) {
        return (false);
    }             
    if (top1 > bottom2) {
        return (false);
    }             
    if (right1 < left2) {
        return (false);
    }             
    if (left1 > right2) {
        return (false);
    }   
                
    return (true);  
}

function platformDetect(object1, object2) {
    var vectorX = (object1.x + (object1.width/2)) - (object2.x + (object2.width/2));
	var vectorY = (object1.y + (object1.height/2)) - (object2.y + (object2.height/2));

	var halfWidths = (object1.width/2) + (object2.width/2);
	var halfHeights = (object1.height/2) + (object2.height/2);

	var collisionDirection = null;

	if(Math.abs(vectorX) < halfWidths && Math.abs(vectorY) < halfHeights){

		var offsetX = halfWidths - Math.abs(vectorX);
		var offsetY = halfHeights - Math.abs(vectorY);
		if(offsetX < offsetY){

			if (vectorX > 0){
				collisionDirection = "left";
				object1.x += offsetX;
			} else {
				collisionDirection = "right";
				object1.x -= offsetX;
			}

		} else {

			if (vectorY > 0){
				collisionDirection = "top";
				object1.y += offsetY;
			} else {
				collisionDirection = "bottom";
				object1.y -= offsetY;
			}

		}

	}

	return collisionDirection;
}

window.addEventListener('keydown', controller.keyListener);
window.addEventListener('keyup', controller.keyListener);
window.requestAnimationFrame(loop);
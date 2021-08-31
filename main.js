const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

context.canvas.height = 300;
context.canvas.width = 600;

const playerLimits = canvas.width / 5;

// Create the player, and the projectiles
let projectiles = [];
let enemies = [];
let pickups = [];
let collected = 0;

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
}, 3000);



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
    }

    // Define the limits of the gameplay
    if (player.x >= canvas.width - playerLimits) {
        player.x = canvas.width - playerLimits;
    } else if (player.x <= canvas.width - (4 * playerLimits)) {
        player.x = canvas.width - (4 * playerLimits);
    }

    pickups.forEach((pickup) => {
        pickup.draw();
        if (collide(player,pickup)){
            collected ++;
            pickups.splice(pickup,1);
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
        // setTimeout(()=>{
        //     player.hasShot = false;
        // },1000); 

        enemy.update();

        projectiles.forEach((projectile, projectileIndex) => {
            if (collide(projectile,enemy)) {
                setTimeout(() => {
                    player.hasShot = false;
                    enemies.splice(enemyIndex, 1);
                    projectiles.splice(projectileIndex, 1);
                },1);
            }
        });

        if (collide(player, enemy)) {
            console.log("Ouch!");
        }

        if (enemyIndex.x <= 0) {
            setTimeout(() => {
                enemies.splice(enemyIndex, 1);
            },1);
        }
    });
};

function collide(obj1, obj2) {
    if (obj2.x > obj1.width + obj1.x || obj1.x > obj2.width + obj2.x || obj2.y > obj1.height + obj1.y || obj1.y > obj2.height + obj2.y){
        return false;
    }
    return true;
}

window.addEventListener('keydown', controller.keyListener);
window.addEventListener('keyup', controller.keyListener);
window.requestAnimationFrame(loop);
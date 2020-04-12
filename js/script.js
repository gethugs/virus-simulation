'use strict';

const link = 'https://www.washingtonpost.com/graphics/2020/world/corona-simulator/';

const healthyColor = 'white';
const sickColor = 'orangered';
const recoveredColor = 'lightseagreen';

var btn = document.querySelector('#btn');

let count = 200,    // 150
    ballSize = 5,   // 5
    staticPart = 0.7,
    recoveryTime = 9000,
    speed = 1,
    status = 'started',
    requestId,
    ballsArr = [];


// Canvas и контекст
let canvas = document.querySelector('#canvas');

canvas.width = 800;       // window.innerWidth
canvas.height = 400;     // window.innerHeight

let c = canvas.getContext('2d');

// Конструктор шариков
function Ball(x, y, radius, speed) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = healthyColor;
    this.timer = new Date();

    this.alpha = Math.random() * 2 * Math.PI;    
    this.velocity = {
        x: Math.cos(this.alpha) * speed,
        y: Math.sin(this.alpha) * speed
    }

    this.draw = function() {
        c.beginPath();
        // c.strokeStyle = 'lightgrey';
        c.fillStyle = this.color;
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c.closePath();
        c.fill();
        // c.stroke();
    }

    this.update = function(arr) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Walls collision
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvas.width) {
            this.velocity.x = - this.velocity.x;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.velocity.y = - this.velocity.y;
        }

        // Resolving collision between particles
        for (let i = 0; i < arr.length; i++) {
            if (this === arr[i]) continue;

            // console.log(this, arr[i], checkCollision(this, arr[i]));
            if (getDistance(this.x, this.y, arr[i].x, arr[i].y) <= this.radius + arr[i].radius) {
                console.log('collided');
                // this.color = 'red';
                this.resolveCollision(this, arr[i]);
            };
            
        }

        // Время выздоровления
        if (this.color === sickColor && new Date() - this.timer >= recoveryTime) {
            this.color = recoveredColor;
        }

        this.draw();
    }
    
    this.resolveColor = function(a, b) {
        if (a.color === sickColor && b.color === healthyColor) {
            b.timer = new Date();
            b.color = sickColor;
        }
    }

    this.resolveCollision = function(ball, otherBall) {
        var xVelocityDiff = ball.velocity.x - otherBall.velocity.x;
        var yVelocityDiff = ball.velocity.y - otherBall.velocity.y;
        var xDist = otherBall.x - ball.x;
        var yDist = otherBall.y - ball.y;

        // Меняем цвет
        this.resolveColor(ball, otherBall);
        this.resolveColor(otherBall, ball);

        // cancelAnimationFrame(requestId);
        // Если скалярное произведение векторов > 0, шары сближаются
        if (xVelocityDiff * xDist + yVelocityDiff * yDist > 0) {    // >=
            // Угол между шарами
            let angle = -Math.atan2(otherBall.y - ball.y, otherBall.x - ball.x);
            let angleBall = -Math.atan2(ball.velocity.y, ball.velocity.x);
            let angleOtherBall = -Math.atan2(ball.velocity.y, ball.velocity.x);
            console.log('угол: ', angle * 180 / Math.PI);
            
            console.log('ball.velocity = ', ball.velocity);
            console.log('otherBall.velocity = ', otherBall.velocity);

            const u1 = rotate(ball.velocity, angle);
            const u2 = rotate(otherBall.velocity, angle);
            console.log('u1 = ', u1);
            console.log('u2 = ', u2);

            const v1 = { x: -u1.x, y: u1.y };
            const v2 = { x: -u2.x, y: u2.y };
            console.log('v1 = ', v1);
            console.log('v2 = ', v2);

            const vFinal1 = rotate(v1, -angle);
            const vFinal2 = rotate(v2, -angle);
            console.log('vFinal1 = ', vFinal1);
            console.log('vFinal2 = ', vFinal2);
            if (ball.velocity.x !== 0 || ball.velocity.y !== 0) {
                console.log('ball: ', ball.color);
                // ball.velocity = rotate(v1, -angle);
                ball.velocity = vFinal1;
            }
            if (otherBall.velocity.x !== 0 || otherBall.velocity.y !== 0) {
                // otherBall.velocity = rotate(v2, -angle);
                console.log('otherBall: ', otherBall.color, '\n\n');
                otherBall.velocity = vFinal2;
            }
        }
    }
}

function createBalls(count, staticPart) {
    for (let i = 0; i < count; i++) {
        let x = getRandom(canvas.width, ballSize),
            y = getRandom(canvas.height, ballSize);
        
        if (i !== 0) {
            for (let j = 0; j < ballsArr.length; j++) {
                if (getDistance(x, y, ballsArr[j].x, ballsArr[j].y) <= ballSize + ballsArr[j].radius) {
                    x = getRandom(canvas.width, ballSize);
                    y = getRandom(canvas.height, ballSize);
                    j = -1;
                }
            }  
        }

        if (i < count * staticPart) {
            ballsArr.push(new Ball(x, y, ballSize, 0));
        } else {
            ballsArr.push(new Ball(x, y, ballSize, speed));
        }
        
    }
    
    
    ballsArr[0].color = sickColor;
}



// Общие функции-утилиты
function getRandom(max, radius) {
    return radius + Math.round(Math.random() * (max - 2 * radius));
}

function getDistance(x1, y1, x2, y2) {
    return Math.pow(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2), .5);
}

function checkCollision(a, b) {
    return getDistance(a, b) < (a.radius + b.radius);
}

function rotate(velocity, angle) {
    return {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle), // velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)  // y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
}

// Анимация
function animate() {
    requestId = requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height);
    ballsArr.forEach(function(ball) {
        ball.update(ballsArr);
    });
}
// Инициализируем
createBalls(count, staticPart)
animate();


// Pause
canvas.addEventListener('click', function(evt) {
    if (status === 'started') {
       status = 'paused';
       cancelAnimationFrame(requestId);
    } else {
        // init();
        status = 'started';
        animate();
    }
});

btn.addEventListener('click', function(evt) {
    console.log(rotate(ballsArr[0].velocity, Math.PI/2));
    ballsArr[0].velocity = rotate(ballsArr[0].velocity, Math.PI/2);
});



// this.resolveCollision = function(ball, otherBall) {
//     var xVelocityDiff = ball.velocity.x - otherBall.velocity.x;
//     var yVelocityDiff = ball.velocity.y - otherBall.velocity.y;
//     var xDist = otherBall.x - ball.x;
//     var yDist = otherBall.y - ball.y;

//     // Меняем цвет
//     this.resolveColor(ball, otherBall);
//     this.resolveColor(otherBall, ball);

//     // Если скалярное произведение векторов > 0, шары сближаются
//     if (xVelocityDiff * xDist + yVelocityDiff * yDist > 0) {    // >=
//         // Угол между шарами
//         let angle = -Math.atan2(otherBall.y - ball.y, otherBall.x - ball.x);

//         const u1 = rotate(ball.velocity, angle);
//         const u2 = rotate(otherBall.velocity, angle);

//         const v1 = { x: u2.x, y: u1.y };
//         const v2 = { x: u1.x, y: u2.y };

//         // const vFinal1 = rotate(v1, -angle);
//         // const vFinal2 = rotate(v2, -angle);
//         if (ball.velocity.x !== 0 || ball.velocity.y !== 0) {
//             ball.velocity = rotate(v1, -angle);
//         }
//         if (otherBall.velocity.x !== 0 || otherBall.velocity.y !== 0) {
//             otherBall.velocity = rotate(v2, -angle);
//         }
//     }
// }
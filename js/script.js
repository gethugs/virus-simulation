'use strict';

const link = 'https://www.washingtonpost.com/graphics/2020/world/corona-simulator/';

const healthyColor = 'white';
const sickColor = 'orangered';
const recoveredColor = 'lightseagreen';

let btn = document.querySelector('#btn');

let count = 1000,    // 200
    ballSize = 2,   // 5
    staticPart = 0.8,
    recoveryTime = 9000,
    speed = 2,
    status = 'started',
    requestId,
    ballsArr = [];


// canvasModel и контекст
let canvasModel = document.querySelector('#canvas-model');

canvasModel.width = 800;       // window.innerWidth
canvasModel.height = 400;     // window.innerHeight

let c1 = canvasModel.getContext('2d');

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
        c1.beginPath();
        // c1.strokeStyle = 'lightgrey';
        c1.fillStyle = this.color;
        c1.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        c1.closePath();
        c1.fill();
        // c1.stroke();
    }

    this.update = function(arr) {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Walls collision
        if (this.x - this.radius <= 0 || this.x + this.radius >= canvasModel.width) {
            this.velocity.x = - this.velocity.x;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvasModel.height) {
            this.velocity.y = - this.velocity.y;
        }

        // Resolving collision between particles
        for (let i = 0; i < arr.length; i++) {
            if (this === arr[i]) continue;

            // console.log(this, arr[i], checkCollision(this, arr[i]));
            if (getDistance(this.x, this.y, arr[i].x, arr[i].y) <= this.radius + arr[i].radius) {
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
        let xVelocityDiff = ball.velocity.x - otherBall.velocity.x;
        let yVelocityDiff = ball.velocity.y - otherBall.velocity.y;
        let xDist = otherBall.x - ball.x;
        let yDist = otherBall.y - ball.y;

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

            const u1 = rotate(ball.velocity, angle);
            const u2 = rotate(otherBall.velocity, angle);

            const v1 = { x: -u1.x, y: u1.y };
            const v2 = { x: -u2.x, y: u2.y };

            const vFinal1 = rotate(v1, -angle);
            const vFinal2 = rotate(v2, -angle);
            if (ball.velocity.x !== 0 || ball.velocity.y !== 0) {
                // ball.velocity = rotate(v1, -angle);
                ball.velocity = vFinal1;
            }
            if (otherBall.velocity.x !== 0 || otherBall.velocity.y !== 0) {
                // otherBall.velocity = rotate(v2, -angle);
                otherBall.velocity = vFinal2;
            }
        }
    }
}

function createBalls(count, staticPart) {
    for (let i = 0; i < count; i++) {
        let x = getRandom(canvasModel.width, ballSize),
            y = getRandom(canvasModel.height, ballSize);
        
        if (i !== 0) {
            for (let j = 0; j < ballsArr.length; j++) {
                if (getDistance(x, y, ballsArr[j].x, ballsArr[j].y) <= ballSize + ballsArr[j].radius) {
                    x = getRandom(canvasModel.width, ballSize);
                    y = getRandom(canvasModel.height, ballSize);
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


// this.resolveCollision = function(ball, otherBall) {
//     let xVelocityDiff = ball.velocity.x - otherBall.velocity.x;
//     let yVelocityDiff = ball.velocity.y - otherBall.velocity.y;
//     let xDist = otherBall.x - ball.x;
//     let yDist = otherBall.y - ball.y;

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

// canvasGraphic и контекст
let canvasGraphic = document.querySelector('#canvas-graphic');
canvasGraphic.width = 800;
canvasGraphic.height = 150;
let c2 = canvasGraphic.getContext('2d');

let stats = {};
function countStats(obj) {
	obj.healthy = 0;
	obj.sick = 0;
	obj.recovered = 0;
	ballsArr.forEach(function(ball) {
		if(ball.color === healthyColor) obj.healthy++;
		if(ball.color === sickColor) obj.sick++;
		if(ball.color === recoveredColor) obj.recovered++;
	});
}

// Элементы статистики
let healthyCount = document.querySelector('.healthy');
let sickCount = document.querySelector('.sick');
let recoveredCount = document.querySelector('.recovered');

function printStats(obj) {
	countStats(obj);
	healthyCount.innerHTML = obj.healthy;
	sickCount.innerHTML = obj.sick;
	recoveredCount.innerHTML = obj.recovered;
}

let linesArr = [],
		lineX = 0,
		graphicXSpeed = 0.5;

function VerticalLine(x, y, width, height, stats) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	console.log(stats);

	this.rHeight = height * stats.recovered / count;
	this.hHeight = height * stats.healthy / count;
	this.sHeight = height * stats.sick / count;

	this.drawLine = function(a, b, c, d, col) {
		c2.beginPath();
		c2.fillStyle = col;
		c2.rect(a, b, c, d);
		c2.closePath();
		c2.fill();
	}

	this.draw = function() {
		this.drawLine(this.x, this.y, this.width, this.rHeight, recoveredColor);
		// this.y += this.rHeight;
		this.drawLine(this.x, this.y + this.rHeight, this.width, this.hHeight, healthyColor);
		// this.y += this.hHeight;
		this.drawLine(this.x, this.y + this.rHeight + this.hHeight, this.width, this.sHeight, sickColor);
	}

}


// Анимация
function animate() {
	requestId = requestAnimationFrame(animate);

	// c1
	c1.clearRect(0, 0, canvasModel.width, canvasModel.height);
	ballsArr.forEach(function(ball) {
		ball.update(ballsArr);
	});

	// c2
	if (linesArr.length < canvasGraphic.width / graphicXSpeed) {
		linesArr.push(new VerticalLine(lineX, 0, graphicXSpeed, canvasGraphic.height, stats));
	}
	linesArr.forEach(function(line) {
		line.draw();
	});
	lineX += graphicXSpeed;

	console.log(linesArr);

	printStats(stats);
}
// Инициализируем
createBalls(count, staticPart)
animate();


// Pause
canvasModel.addEventListener('click', function(evt) {
	if (status === 'started') {
		 status = 'paused';
		 cancelAnimationFrame(requestId);
	} else {
			// init();
			status = 'started';
			animate();
	}
});

// btn.addEventListener('click', function(evt) {
// 	console.log(rotate(ballsArr[0].velocity, Math.PI/2));
// 	ballsArr[0].velocity = rotate(ballsArr[0].velocity, Math.PI/2);
// });

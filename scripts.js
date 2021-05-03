const canvas = document.getElementById('bg-canvas');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gravityConstant = .25;
const numOfParticles = Math.floor(canvas.width * 0.015);
let particlesArr = [];
const colorsArr = [
	'#8be9fd',
	'#50fa7b',
	'#ffb86c',
	'#ff79c6',
	'#bd93f9',
	'#ff5555',
	'#f1fa8c',
];

let div = getDivMeasurements();

class Particle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = Math.random() * 10 + 7.5;
		this.color = colorsArr[Math.floor(Math.random() * colorsArr.length)];
		this.gravity = gravityConstant;
		this.directionX = Math.random() * 0.75 + 0.5;
		this.directionX = this.directionX * (Math.random() < 0.5 ? -1 : 1);
	}

	update() {
		// Check for out of bounds
		if (
			this.y - this.radius > canvas.height ||
			this.x + this.radius < 0 ||
			this.x - this.radius > canvas.width
		) {
			this.x = Math.random() * canvas.width;
			this.y = 0 - this.radius;
			this.color =
				colorsArr[Math.floor(Math.random() * colorsArr.length)];
			this.gravity = gravityConstant;
		}

		// Check for top div collision
		if (
			this.x > div.x &&
			this.x < div.x + div.width &&
			this.y + this.radius > div.y &&
			this.y + this.radius < div.y + 10
		) {
			this.y -= 2;
			this.gravity *= -.9;
		}

		// Check for left side div collision
		if (
			this.y + this.radius > div.y + 10 &&
			this.y - this.radius < div.y + div.height &&
			this.x + this.radius > div.x &&
			this.x - this.radius < div.x + 10
		) {
			this.x -= 3;
			this.directionX *= -1;
		}
		// Check for right side div collision
		if (
			this.y + this.radius > div.y + 10 &&
			this.y - this.radius < div.y + div.height &&
			this.x > div.x + div.width - 10 &&
			this.x - this.radius < div.x + div.width
		) {
			this.x += 3;
			this.directionX *= -1;
		}

		this.gravity += 0.075;
		this.x += this.directionX;
		this.y += this.gravity;
	}

	draw() {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
}

function init() {
	particlesArr = [];
	for (let i = 0; i < numOfParticles; i++) {
		particlesArr.push(
			new Particle(
				Math.random() * canvas.width,
				-(Math.random() * canvas.height)
			)
		);
	}
}

function animate() {
	ctx.fillStyle = 'rgba(40, 42, 54, 1)';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	// ctx.clearRect(0, 0, canvas.width, canvas.height);
	particlesArr.forEach((particle) => {
		particle.update();
		particle.draw();
	});
	requestAnimationFrame(animate);
}

function getDivMeasurements() {
	divMeasurements = document
		.getElementById('content')
		.getBoundingClientRect();
	return {
		x: divMeasurements.left,
		y: divMeasurements.top,
		width: divMeasurements.width,
		height: divMeasurements.height,
	};
}

init();
animate();

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	div = getDivMeasurements();
	numOfParticles = Math.floor(canvas.width * 0.05);
	init();
	console.log(canvas.width);
});

window.addEventListener('keydown', (key) => {
	if (key.code === 'KeyS') {
		console.log('click');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx = null;
	}
});

document.getElementById('stop').addEventListener('click', () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx = null;
});

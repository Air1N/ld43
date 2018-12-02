const display = document.getElementById('canvas');
const ctx = display.getContext('2d');

// Idea: Game where you have control over a cult, send them to fight enemies for you :^)

let tick = 0;

let entities = [];

const player = {
	x: 1920 / 2,
	y: 1080 / 2,
	width: 48,
	height: 64,
	depth: 10,
	animation: undefined,
	speed: 3,
	health: 100,
	type: "player"
};

player.walk = new Animation("./assets/player.png", 2, 5, 32, 48);
player.animation = player.walk;

entities.push(player);

let followers = [];
let enemies = [];

let particles = [];
let projectiles = [];

let score = 0;

let floor = new Image();
floor.src = "./assets/floor.png";

let reticle = {
	x: 0,
	y: 0
};

let testBox = {
	x: 200,
	y: 250,
	width: 50,
	height: 500,
	depth: 500,
	animation: undefined,
	type: "box"
};

entities.push(testBox);

function Follower() {
	this.x = player.x;
	this.y = player.y;
	this.width = 48;
	this.height = 64;
	this.depth = 10;
	this.animation = undefined;
	this.speed = Math.random() * 7 + 3;

	this.walk = new Animation("./assets/follower.png", 2, 5, 32, 48);
	this.animation = this.walk;

	this.type = "follower";

	score += 100;

	followers.push(this);
	entities.push(this);
}

function Enemy(x, y, t) {
	this.x = x;
	this.y = y;
	this.depth = 10;
	this.animation = undefined;
	this.speed = Math.random() * 4 + 3;

	this.enemyType = t || "";

	if (Math.random() <= 0.2 && !this.enemyType) {
		this.enemyType = "thrower";

		this.walk = new Animation("./assets/thrower.png", 2, 5, 64, 64);
		this.throw = new Animation("./assets/throwerthrow.png", 2, 2, 64, 64);
    
    this.first = true;
    
    if (tick < 7000) {
			this.damage = tick / 2000;
		} else {
			this.damage = 3.5;
		}

		this.width = 48 * (this.damage / 3.5 + 1);
		this.height = 64 * (this.damage / 3.5 + 1);
    
		this.throwTime = 0;
	} else {
		this.enemyType = "basic";
		this.walk = new Animation("./assets/basic.png", 2, 5, 32, 48);

		if (tick < 7000) {
			this.damage = tick / 1000;
		} else {
			this.damage = 7;
		}

		this.width = 48 * (this.damage / 7 + 0.5);
		this.height = 64 * (this.damage / 7 + 0.5);
	}

	this.animation = this.walk;

	this.type = "enemy";

	enemies.push(this);
	entities.push(this);
}

function Animation(sprite, frames, fps, width, height) {
	this.sprite = new Image();
	this.sprite.src = sprite;

	this.frame = 0;
	this.frames = frames;
	this.fps = fps;

	this.width = width,
		this.height = height;

	this.loop = function () {
		this.playing = true;
		this.ticker = setInterval(this.tick, 1000 / fps, this, true);
	};

	this.play = function () {
		this.playing = true;
		this.ticker = setInterval(this.tick, 1000 / fps, this, false);
	};

	this.stop = function () {
		this.playing = false;
		clearInterval(this.ticker);
	};

	this.tick = function (animation, loop) {
		if (animation.frame < animation.frames - 1) {
			animation.frame++;
		} else if (loop) {
			animation.frame = 0;
		} else {
			animation.stop();
		}
	};
}

function zindexSort(a, b) {
	return (a.y + a.height / 2) - (b.y + b.height / 2);
}

function overlapping(a, b) {
	if (a.x > b.x + b.width) {
		return false;
	} else if (b.x > a.x + a.width) {
		return false;
	}

	if (a.y + a.height / 2 < b.y + b.height / 2 - b.depth) {
		return false;
	} else if (b.y + b.height / 2 < a.y + a.height / 2 - a.depth) {
		return false;
	}

	return true;
}

function fromSide(a, b) {
	if (a.y + a.height / 2 >= b.y + b.height / 2 - b.depth && b.y + b.height / 2 >= a.y + a.height / 2 - a.depth) {
		if ((a.x + a.width >= b.x && a.x + a.width <= b.x + a.speed) || (a.x <= b.x + b.width && a.x >= b.x + b.width - a.speed)) {
			return true;
		}
	}

	return false;
}

function fromVertical(a, b) {
	if (a.x <= b.x + b.width && b.x <= a.x + a.width) {
		if ((a.y + a.height / 2 >= b.y + b.height / 2 - b.depth && a.y + a.height / 2 <= b.y + b.height / 2 - b.depth + a.speed) || (a.y + a.height / 2 - a.depth <= b.y + b.height / 2 && a.y + a.height / 2 - a.depth >= b.y + b.height / 2 - a.speed)) {
			return true;
		}
	}

	return false;
}

function Explosion(x, y, particles, size, maxvx, maxvy) {
	for (let i = 0; i < particles; i++) {
		let angle = Math.random() * Math.PI * 2;

		let vx = Math.cos(angle) * maxvx * Math.random() * 0.7 + 0.3;
		let vy = Math.sin(angle) * maxvy * Math.random() * 0.7 + 0.3;

		if (Math.random() < 0.5) vx *= -1;
		if (Math.random() < 0.5) vy *= -1;

		new Particle(x + Math.random() * 10 - 5, y + Math.random() * 10 - 5, size * Math.random() * 0.7 + 0.3, vx, vy);
	}
}

function Particle(x, y, s, vx, vy) {
	this.x = x;
	this.y = y;

	this.sx = x;
	this.sy = y;

	this.size = s;

	this.velocity = {
		x: vx,
		y: vy
	};

	particles.push(this);
}

function killDead() {
	for (let i = entities.length - 1; i >= 0; i--) {
		let entity = entities[i];

		if (entity.willDie) {
			if (entity.type == "follower") followers.splice(followers.indexOf(entity), 1);
			if (entity.type == "enemy") enemies.splice(enemies.indexOf(entity), 1);

			entities.splice(entities.indexOf(entity), 1);
		}
	}

	if (player.dead) player.x = -1000;
}

function Projectile(x, y, s, velx, vely) {
	this.x = x;
	this.y = y;
	this.sx = x;
	this.sy = y;

	this.size = s;

	this.velocity = {
		x: velx,
		y: vely
	}

	projectiles.push(this);
	entities.push(this);
}
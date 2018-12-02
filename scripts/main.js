function controls() {
	if (keyDown("W") || keyDown("A") || keyDown("S") || keyDown("D") || keyDown("Left") || keyDown("Right") || keyDown("Up") || keyDown("Down")) {
		if (keyDown("A") || keyDown("Left")) {
			player.lastXMove = -player.speed;
			player.x -= player.speed;
			player.direction = "left";
		} else if (keyDown("D") || keyDown("Right")) {
			player.lastXMove = player.speed;
			player.x += player.speed;
			player.direction = "right";
		} else {
			player.lastXMove = 0;
		}

		if (keyDown("W") || keyDown("Up")) {
			player.lastYMove = -player.speed;
			player.y -= player.speed;
		} else if (keyDown("S") || keyDown("Down")) {
			player.lastYMove = player.speed;
			player.y += player.speed;
		} else {
			player.lastYMove = 0;
		}

		player.animation = player.walk;
		if (!player.animation.playing) player.animation.loop();
	} else {
		player.animation.stop();

		player.overlapping = false;
	}
}

function update() {
	if (player.dead) {
		if (score > localStorage.getItem('highscore')) localStorage.setItem('highscore', score);
		return;
	}

	controls();

	tick++;

	score += Math.floor(tick / 1000);

	if (tick % 100 === 0) {
		let rand = Math.random();
		if (rand < 0.25) {
			new Enemy(-1000, Math.random() * display.height);
		} else if (rand < 0.5) {
			new Enemy(display.width + 1000, Math.random() * display.height);
		} else if (rand < 0.75) {
			new Enemy(Math.random() * display.width, -1000);
		} else {
			new Enemy(Math.random() * display.width, display.height + 1000);
		}
	}

	if (player.health <= 0) {
		player.dead = true;
		player.health = 0;
	} else if (player.health < 100) {
		player.health += 0.01;
	}

	for (let i = entities.length - 1; i >= 0; i--) {
		let entity1 = entities[i];

		for (let j = entities.length - 1; j >= 0; j--) {
			let entity2 = entities[j];

			if (overlapping(entity1, entity2)) {
				if ((entity1.type == "player" || entity1.type == "follower" || entity1.type == "enemy") && entity2.type == "box") {
					if (fromSide(entity1, entity2)) entity1.x -= entity1.lastXMove;
					if (fromVertical(entity1, entity2)) entity1.y -= entity1.lastYMove;

					entity1.overlapping = true;
				}

				if (entity1.type == "enemy" && entity2.type == "follower") {
					new Explosion(entity1.x, entity1.y, 100, 20, 20, 30);

					entity1.willDie = true;
					entity2.willDie = true;
				}

				if (entity1.type == "enemy" && entity2.type == "player") {
					entity2.health -= entity1.damage;

					new Explosion(entity1.x, entity1.y, 100, 20, 20, 30);
					entity1.willDie = true;

					new Follower();
					new Follower();
				}
			}
		}
	}

	for (let i = 0; i < followers.length; i++) {
		let follower = followers[i];
		let xdir = ((reticle.x || 0) - follower.x + Math.random() * 200 * 2 - 200) * Math.random() * 40 * 2 - 40;
		let ydir = ((reticle.y || 0) - follower.y + Math.random() * 200 * 2 - 200) * Math.random() * 40 * 2 - 40;
		let angle = Math.atan2(ydir, xdir);

		if (xdir < 0) follower.direction = "left";
		else if (xdir > 0) follower.direction = "right";

		follower.animation = follower.walk;
		if (!follower.animation.playing) follower.animation.loop();

		follower.lastXMove = Math.cos(angle) * follower.speed;
		follower.lastYMove = Math.sin(angle) * follower.speed;

		follower.x += follower.lastXMove;
		follower.y += follower.lastYMove;
	}

	for (let i = 0; i < enemies.length; i++) {
		let enemy = enemies[i];
		let xdir = ((player.x || 0) - enemy.x) * Math.random() * 40 * 2;
		let ydir = ((player.y + player.height / 2) - (enemy.y + enemy.height / 2)) * Math.random() * 40 * 2;
		let angle = Math.atan2(ydir, xdir);

		if (xdir < 0) enemy.direction = "left";
		else if (xdir > 0) enemy.direction = "right";

		if (enemy.enemyType == "thrower") {
			if (Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) < 600) {
				if (enemy.animation.playing && enemy.animation == enemy.walk) enemy.animation.stop();
				else {

					if (enemy.throwTime >= 60) {
						enemy.throwTime = 0;
						enemy.animation = enemy.throw;
						enemy.animation.frame = 0;
						enemy.first = true;
						enemy.animation.play();
					} else if (!enemy.animation.playing) {
						enemy.animation = enemy.walk;
						enemy.throwTime++;
					} else if (enemy.animation.frame == 1 && enemy.first) {
						enemy.first = false;
						new Projectile(enemy.x, enemy.y, 8, Math.cos(angle) * 10, Math.sin(angle) * 30 - Math.random() * 40);
					}
				}
				continue;
			}
		}

		enemy.animation = enemy.walk;
		if (!enemy.animation.playing) enemy.animation.loop();

		enemy.lastXMove = Math.cos(angle) * enemy.speed;
		enemy.lastYMove = Math.sin(angle) * enemy.speed;

		enemy.x += enemy.lastXMove;
		enemy.y += enemy.lastYMove;
	}

	for (let i = particles.length - 1; i >= 0; i--) {
		let particle = particles[i];

		particle.velocity.y += 0.8;

		particle.velocity.x *= 1 - 0.01;

		particle.x += particle.velocity.x;
		particle.y += particle.velocity.y;

		if (particle.y > particle.sy) particles.splice(particles.indexOf(particle), 1);
	}

	for (let i = projectiles.length - 1; i >= 0; i--) {
		let projectile = projectiles[i];

		projectile.velocity.y += 0.8;

		projectile.velocity.x *= 1 - 0.01;

		projectile.x += projectile.velocity.x;
		projectile.y += projectile.velocity.y;

		if (projectile.y > projectile.sy) {
			projectile.willDie = true;
			new Enemy(projectile.x, projectile.y, "basic");
			projectiles.splice(projectiles.indexOf(projectile), 1);
		}
	}

	killDead();
}

ctx.lineWidth = 2;

function render() {
	ctx.fillStyle = "black";
	ctx.strokeStyle = "black";
	ctx.clearRect(0, 0, display.width, display.height);
	//ctx.drawImage(floor, 0, 0, display.width, display.height);
	entities.sort(zindexSort);

	for (let i = 0; i < entities.length; i++) {
		let entity = entities[i];

		ctx.save();
		ctx.translate(entity.x, entity.y);
		if (entity.direction == "left") ctx.scale(-1, 1);
		if (entity.animation) ctx.drawImage(entity.animation.sprite, entity.animation.width * entity.animation.frame, 0, entity.animation.width, entity.animation.height, -entity.width / 2, -entity.height / 2, entity.width, entity.height);
		else if (entity.width) ctx.fillRect(-entity.width / 2, -entity.height / 2, entity.width, entity.height);
		else {
			ctx.beginPath();
			ctx.arc(-entity.size, -entity.size, entity.size, 0, 2 * Math.PI);
			ctx.fill();
		}

		ctx.restore();
	}

	for (let i = 0; i < particles.length; i++) {
		let particle = particles[i];

		ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
	}

	ctx.fillRect(1920 - 80, 40, -player.health * 3, 30);

	ctx.beginPath();
	ctx.arc(reticle.x, reticle.y, 10, 0, Math.PI * 2);
	ctx.stroke();

	ctx.strokeStyle = "white";
	ctx.textAlign = "center";
	ctx.font = "Bold 32px Calibri";
	ctx.strokeText("SCORE", 1920 / 2, 35);
	ctx.fillText("SCORE", 1920 / 2, 35);

	ctx.font = "Bold 48px Calibri";
	ctx.strokeText(score, 1920 / 2, 75);
	ctx.fillText(score, 1920 / 2, 75);

	ctx.fillStyle = "gray";
	ctx.font = "Bold 24px Calibri";
	let hs = localStorage.getItem('highscore');
	ctx.strokeText(hs || 0, 1920 / 2, 100);
	ctx.fillText(hs || 0, 1920 / 2, 100);

	if (player.dead) {
		ctx.font = "Bold 152px Calibri";
		ctx.fillStyle = "black";
		ctx.strokeText("POST YOUR SCORE BELOW!", 1920 / 2, 1080 / 2);
		ctx.fillText("POST YOUR SCORE BELOW!", 1920 / 2, 1080 / 2);
	}

	requestAnimationFrame(render);
}

setInterval(update, 1000 / 60);
requestAnimationFrame(render);
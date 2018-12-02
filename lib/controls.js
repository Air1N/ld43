var keys = {
	"`": 192,
	"1": 49,
	"2": 50,
	"3": 51,
	"4": 52,
	"5": 53,
	"6": 54,
	"7": 55,
	"8": 56,
	"9": 57,
	"0": 48,
	"-": 189,
	"=": 187,
	"q": 81,
	"w": 87,
	"e": 69,
	"r": 82,
	"t": 84,
	"y": 89,
	"u": 85,
	"i": 73,
	"o": 79,
	"p": 80,
	"[": 219,
	"]": 221,
	"backslash": 220,
	"a": 65,
	"s": 83,
	"d": 68,
	"f": 70,
	"g": 71,
	"h": 72,
	"j": 74,
	"k": 75,
	"l": 76,
	";": 186,
	"'": 222,
	"z": 90,
	"x": 88,
	"c": 67,
	"v": 86,
	"b": 66,
	"n": 78,
	"m": 77,
	",": 188,
	".": 190,
	"/": 191,
	"home": 36,
	"up": 38,
	"pageup": 33,
	"left": 37,
	"right": 39,
	"end": 35,
	"down": 40,
	"pagedown": 45,
	"shift": 16 || 13,
	"ctrl": 17,
	"alt": 18,
	"space": 32
};

let activeKeys = [];

let mouse = {
	up: {},
	down: {},
	current: {},
	scroll: {},
	last: {},
	move: {}
};

window.onkeydown = function (e) {
	activeKeys.push(e.keyCode);
};

window.onkeyup = function (e) {
	var z = activeKeys.indexOf(e.keyCode);
	toggle = true;

	for (i = activeKeys.length; i > 0; i--) {
		if (z == -1) break;
		activeKeys.splice(z, 1);
		z = activeKeys.indexOf(e.keyCode);
	}
};

function keyDown(key) {
	if (activeKeys.indexOf(keys[key.toLowerCase()]) > -1) return true;
	return false;
}

window.onmousedown = function (e) {
	mouse.down.x = (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth);
	mouse.down.y = (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight);
  
  if (document.pointerLockElement != display) {
    reticle.x = mouse.down.x;
    reticle.y = mouse.down.y;
  }
  canvas.requestPointerLock();
  
	mouse.isDown = true;
};

window.onmouseup = function (e) {
	mouse.up.x = (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth);
	mouse.up.y = (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight);

	mouse.isDown = false;
};

window.onmousemove = function (e) {
	mouse.last.x = mouse.current.x;
	mouse.last.y = mouse.current.y;
  
  mouse.move.x = e.movementX;
  mouse.move.y = e.movementY;
  
  reticle.x += mouse.move.x;
  reticle.y += mouse.move.y;
  
	mouse.current.x = (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth);
	mouse.current.y = (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight);
};

window.onmousewheel = function (e) {
	mouse.delta = e.wheelDelta / 60;
	mouse.scroll.x = (e.clientX - canvas.getBoundingClientRect().left) * (canvas.width / canvas.clientWidth);
	mouse.scroll.y = (e.clientY - canvas.getBoundingClientRect().top) * (canvas.height / canvas.clientHeight);
};
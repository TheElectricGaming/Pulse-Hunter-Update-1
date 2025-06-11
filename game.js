const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


let player, enemies, lasers, enemyLasers, barriers, level = 1, coins = 0;
let moveSpeed = 5, laserSpeed = 7, lives = 3, points = 0;
let keys = {}, canShoot = true;
let gameActive = false;


function startGame() {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("shop-menu").classList.add("hidden");
  canvas.classList.remove("hidden");
  resetGame();
  gameActive = true;
  gameLoop();
}


function openShop() {
  document.getElementById("main-menu").classList.add("hidden");
  document.getElementById("shop-menu").classList.remove("hidden");
  document.getElementById("shop-coins").textContent = localStorage.getItem("ph-coins") || "0";
}


function goToMenu() {
  document.getElementById("main-menu").classList.remove("hidden");
  document.getElementById("shop-menu").classList.add("hidden");
}


function buyUpgrade(cost) {
  let stored = parseInt(localStorage.getItem("ph-coins") || "0");
  if (stored >= cost) {
    if (cost === 50) laserSpeed += 1;
    if (cost === 75) moveSpeed += 1;
    stored -= cost;
    localStorage.setItem("ph-coins", stored);
    document.getElementById("shop-coins").textContent = stored;
  }
}


function resetGame() {
  player = { x: 375, y: 550, width: 50, height: 20 };
  lasers = [];
  enemyLasers = [];
  barriers = [
    { x: 150, y: 450, w: 80, h: 30, hp: 3 },
    { x: 350, y: 450, w: 80, h: 30, hp: 3 },
    { x: 550, y: 450, w: 80, h: 30, hp: 3 }
  ];
  spawnEnemies();
  lives = 3;
  points = 0;
}


function spawnEnemies() {
  enemies = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 8; c++) {
      enemies.push({ x: 60 + c * 80, y: 50 + r * 60, w: 40, h: 30, dir: 1 });
    }
  }
}


document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if (e.key === "ArrowUp" && canShoot && gameActive) {
    lasers.push({ x: player.x + 20, y: player.y });
    canShoot = false;
    setTimeout(() => canShoot = true, 400);
  }
});


function gameLoop() {
  if (!gameActive) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);


  // Move player
  if (keys["ArrowLeft"] && player.x > 0) player.x -= moveSpeed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width) player.x += moveSpeed;


  // Draw player
  ctx.fillStyle = "#0ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);


  // Lasers
  lasers = lasers.filter(l => l.y > 0);
  lasers.forEach(l => {
    l.y -= laserSpeed;
    ctx.fillStyle = "#0ff";
    ctx.fillRect(l.x, l.y, 4, 10);
  });


  // Enemies
  let edgeHit = false;
  enemies.forEach(e => {
    e.x += e.dir * 1;
    if (e.x <= 0 || e.x + e.w >= canvas.width) edgeHit = true;
  });


  if (edgeHit) {
    enemies.forEach(e => {
      e.y += 20;
      e.dir *= -1;
    });
  }


  enemies.forEach(e => {
    ctx.fillStyle = "#f0f";
    ctx.fillRect(e.x, e.y, e.w, e.h);
    // Randomly shoot
    if (Math.random() < 0.005) {
      enemyLasers.push({ x: e.x + e.w / 2, y: e.y + e.h });
    }
  });


  // Enemy lasers
  enemyLasers = enemyLasers.filter(l => l.y < canvas.height);
  enemyLasers.forEach(l => {
    l.y += 5;
    ctx.fillStyle = "#f00";
    ctx.fillRect(l.x, l.y, 3, 10);


    // Hit player
    if (l.x >= player.x && l.x <= player.x + player.width && l.y >= player.y) {
      lives--;
      enemyLasers = [];
      if (lives <= 0) {
        alert("Game Over!");
        goToMenu();
        canvas.classList.add("hidden");
        gameActive = false;
      }
    }
  });


  // Barriers
  barriers.forEach(b => {
    if (b.hp > 0) {
      ctx.fillStyle = "#0f0";
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  });


  // Laser hits
  lasers.forEach(l => {
    enemies.forEach((e, ei) => {
      if (l.x >= e.x && l.x <= e.x + e.w && l.y <= e.y + e.h) {
        enemies.splice(ei, 1);
        coins += 5;
        points += 10;
        localStorage.setItem("ph-coins", coins);
      }
    });


    barriers.forEach(b => {
      if (b.hp > 0 && l.x >= b.x && l.x <= b.x + b.w && l.y >= b.y && l.y <= b.y + b.h) {
        b.hp--;
      }
    });
  });


  // Enemy reaches player
  enemies.forEach(e => {
    if (e.y + e.h >= player.y) {
      lives = 0;
    }
  });


  if (lives <= 0) {
    alert("Game Over!");
    goToMenu();
    canvas.classList.add("hidden");
    gameActive = false;
    return;
  }


  // Level Progression
  if (enemies.length === 0) {
    level++;
    if (level > 15) {
      alert("You beat all 15 levels!");
      goToMenu();
      canvas.classList.add("hidden");
      gameActive = false;
    } else {
      spawnEnemies();
    }
  }


  // Draw HUD
  ctx.fillStyle = "#fff";
  ctx.fillText("Lives: " + lives, 10, 20);
  ctx.fillText("Coins: " + coins, 100, 20);
  ctx.fillText("Level: " + level, 200, 20);
  ctx.fillText("Points: " + points, 300, 20);


  requestAnimationFrame(gameLoop);
}
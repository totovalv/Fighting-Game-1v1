const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

// Configuration for game balance and layout
const gameConfig = {
  baseWidth: 1024,
  baseHeight: 576,
  groundOffset: 96
}

function resizeCanvas() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  // Update background scale to cover the screen and center it
  if (background.image.complete) {
    background.scale = Math.max(
      canvas.width / background.image.width,
      canvas.height / background.image.height
    )
    background.position.x =
      (canvas.width - background.image.width * background.scale) / 2
    background.position.y =
      (canvas.height - background.image.height * background.scale) / 2

    // Calculate ground level based on background image (floor is at ~83.3% of original image height)
    // Original 1024x576, floor at 480. 480/576 = 0.8333
    window.gameGroundLevel =
      background.position.y +
      background.image.height * background.scale * 0.8333
  } else {
    window.gameGroundLevel = canvas.height - gameConfig.groundOffset
  }

  // Update shop scale relative to screen size and keep it on the ground
  if (shop.image.complete) {
    const currentScale = canvas.height / gameConfig.baseHeight
    shop.scale = currentScale * 2.75
    shop.position.x = canvas.width * 0.6 // Keep shop at 60% of width
    // Align shop's bottom with the ground
    shop.position.y =
      window.gameGroundLevel - shop.image.height * shop.scale + 1 // Adjusted to ground it
  }

  // Adjust floor positions for fighters
  if (player) {
    player.position.y = window.gameGroundLevel - player.height
  }
  if (enemy) {
    enemy.position.x = window.innerWidth - enemy.width
    enemy.position.y = window.gameGroundLevel - enemy.height
  }

  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
}

const gravity = 0.7 // Reduced gravity for smoother feel on larger screens

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 0, // Start at the left edge
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  spriteFacing: 'right',
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 75,
      y: 50
    },
    width: 180,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: window.innerWidth - 50, // Start at the right edge (collision box width is 50)
    y: 200
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  spriteFacing: 'left', // Kenji naturally faces left in his sprites
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: 75,
      y: 50
    },
    width: 180,
    height: 50
  }
})

// Initialize sizes
background.image.onload = resizeCanvas
shop.image.onload = resizeCanvas // Added shop onload to prevent floating issue
window.addEventListener('resize', resizeCanvas)
// Fallback if images already loaded
if (background.image.complete && shop.image.complete) resizeCanvas()

console.log(player)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

// Game start logic moved to event listener

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  // Update facing direction based on relative position
  if (player.position.x < enemy.position.x) {
    player.facing = 'right'
    enemy.facing = 'left'
  } else {
    player.facing = 'left'
    enemy.facing = 'right'
  }

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement
  if (!player.dead) {
    if (keys.a.pressed && player.lastKey === 'a') {
      player.velocity.x = -10
      player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
      player.velocity.x = 10
      player.switchSprite('run')
    } else {
      player.switchSprite('idle')
    }
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (!enemy.dead) {
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
      enemy.velocity.x = -10
      enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
      enemy.velocity.x = 10
      enemy.switchSprite('run')
    } else {
      enemy.switchSprite('idle')
    }
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

document.querySelector('#start-button').addEventListener('click', () => {
  document.querySelector('#start-menu').style.display = 'none'
  decreaseTimer()
  animate()
})

window.addEventListener('keydown', (event) => {
  if (player.health <= 0 || enemy.health <= 0) return // Block all inputs when game ends

  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20

        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    // case 'w':
    //   player.velocity.y = 20

    //   break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})

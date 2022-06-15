const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d')

canvas.width = 1024;
canvas.height = 576;

const collisionsMap = []
for (let i = 0; i < collisions.length; i+= 70) {
    collisionsMap.push(collisions.slice(i, i+70))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i+= 70) {
    battleZonesMap.push(battleZonesData.slice(i, i+70))
}

const boundaries = []

const offset = {
    x: -675,
    y: -750
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            boundaries.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025) {
            battleZones.push(
                new Boundary({
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                })
            )
        }
    })
})

const image = new Image();
image.src = './img/pokemon map.png'

const foregroundImage = new Image();
foregroundImage.src = './img/foregroundObjects.png'

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png'
const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png'
const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png'
const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png'

const player = new Sprite({
    position: {
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 86 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage,
    }
})


const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    }, 
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    }, 
    image: foregroundImage
})

const keys = {
    z: {
        pressed: false
    },
    ArrowUp: {
        pressed: false
    },
    q: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
    s: {
        pressed: false
    },
    ArrowDown: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    }
}

const movables = [background, ...boundaries, foreground, ...battleZones]

function rectangularCollision({rectangle1, rectangle2}) {
    return(
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y
    )
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()
    
    let moving = true
    player.animate = false

    if (battle.initiated) {
        return
    }

    if (keys.z.pressed || keys.q.pressed || keys.s.pressed || keys.d.pressed || keys.ArrowDown.pressed || keys.ArrowLeft.pressed || keys.ArrowRight.pressed || keys.ArrowUp.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y))
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: battleZone
            }) && 
            overlappingArea > (player.width * player.height) / 2 &&
            Math.random() < 0.02) {
                window.cancelAnimationFrame(animationId)

                audio.map.stop()
                audio.initBattle.play()
                audio.battle.play()
                battle.initiated = true

                gsap.to('#overlapping-div', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlapping-div', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                initBattle()
                                animateBattle()
                                gsap.to('#overlapping-div', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })

                    }
                })
                break
            }
        }
    }
    

    if ((keys.z.pressed && lastKey == 'z') || (keys.ArrowUp.pressed && lastKey == 'ArrowUp')) {
        player.animate = true
        player.image = player.sprites.up
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
            })) {
                moving = false
                break
            }
        }

        if (moving) {
            movables.forEach(movable => {
                movable.position.y += 3
            });
        }
       
    } else if ((keys.q.pressed && lastKey == 'q') || (keys.ArrowLeft.pressed && lastKey == 'ArrowLeft')) {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x += 3
            });
        }
    } else if ((keys.s.pressed && lastKey == 's') || (keys.ArrowDown.pressed && lastKey == 'ArrowDown')) {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }
                }
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.y -= 3
            });
        }
    } else if ((keys.d.pressed && lastKey == 'd') || (keys.ArrowRight.pressed && lastKey == 'ArrowRight')) {
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player, 
                rectangle2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false
                break
            }
        }
        if (moving) {
            movables.forEach(movable => {
                movable.position.x -= 3
            });
        }
    }

}

// animate()

let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'z':
            keys.z.pressed = true
            lastKey = 'z'
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = true
            lastKey = 'ArrowUp'
            break
        case 'q':
            keys.q.pressed = true
            lastKey = 'q'
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true
            lastKey = 'ArrowLeft'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = true
            lastKey = 'ArrowDown'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = true
            lastKey = 'ArrowRight'
            break
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'z':
            keys.z.pressed = false
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false
            break
        case 'q':
            keys.q.pressed = false
            break
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false
            break
    }
})

let clicked = false
addEventListener('click', () => {
    if (!clicked) {
        audio.map.play()
    }
    clicked = true
})
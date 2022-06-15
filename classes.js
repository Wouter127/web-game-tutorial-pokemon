class Sprite {
    constructor({position, image, frames = {max:1, hold:10}, sprites, animate = false, rotation = 0}) {
        this.position = position
        this.image = new Image()
        this.frames = {...frames, val: 0, elapsed: 0}
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }
        this.image.src = image.src
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    }

    draw() {
        context.save()
        context.translate(this.position.x + this.width/2, this.position.y + this.height/2)
        context.rotate(this.rotation)
        context.translate(-this.position.x - this.width/2, -this.position.y - this.height/2)
        context.globalAlpha = this.opacity
        context.drawImage(
            this.image,
            this.frames.val * this.width, // crop x point
            0, // crop y point
            this.image.width / this.frames.max, // crop width 
            this.image.height, // crop height
            this.position.x, // image position x
            this.position.y, // image position y
            this.image.width / this.frames.max, // image width
            this.image.height // image height
        );
        context.restore()

        if (!this.animate) {return}

        if (this.frames.max > 1) {
            this.frames.elapsed ++
        }

        if (this.frames.elapsed % this.frames.hold == 0) {
            if (this.frames.val < this.frames.max - 1) {
                this.frames.val ++
            } else {
                this.frames.val = 0
            }      
        }
    }
}

class Monster extends Sprite {
    constructor({position, image, frames = {max:1, hold:10}, sprites, animate = false, rotation = 0, isEnemy = false, name, attacks}) {
        super({
            position, image, frames, sprites, animate, rotation
        })
        this.isEnemy = isEnemy
        this.name = name
        this.health = 100
        this.attacks = attacks
    }

    attack({attack, recipient, renderedSprites}) {
        document.querySelector('#dialogue-box').style.display = 'block'
        document.querySelector('#dialogue-box').innerHTML = this.name + " used " + attack.name + "!"
        let healthBar = "#enemy-health-bar"
        if (this.isEnemy) {
            healthBar = "#player-health-bar"
        }

        recipient.health -= attack.damage

        switch (attack.name) {
            case 'Tackle':
                const timeline = gsap.timeline()

                let movementDistanceX = 20
                let movementDistanceY = 5
                if (this.isEnemy) {
                    movementDistanceX = -20
                    movementDistanceY = -5
                }

                timeline.to(this.position, {
                    x: this.position.x - movementDistanceX,
                    y: this.position.y + movementDistanceY
                }).to(this.position, {
                    x: this.position.x + movementDistanceX * 2,
                    y: this.position.y - movementDistanceY * 3,
                    duration: 0.1,
                    onComplete: () => {
                        audio.tackleHit.play()
                        gsap.to(healthBar, {
                            width: recipient.health + "%"
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.04,
                            delay: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x,
                    y: this.position.y
                })
                break;
        
            case 'Fireball':
                audio.initFireball.play()
                let rotation = 1
                if (this.isEnemy) {
                    rotation += 3
                }
                const fireballImage = new Image()
                fireballImage.src = "./img/fireball.png"
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 4
                    },
                    animate: true,
                    rotation: rotation
                })
                
                renderedSprites.splice(1, 0, fireball)

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        audio.fireballHit.play()
                        renderedSprites.splice(1, 1)
                        gsap.to(healthBar, {
                            width: recipient.health + "%"
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.04,
                            delay: 0.08
                        })                        
                    }
                })
            break;
        }
    }

    faint() {
        document.querySelector('#dialogue-box').innerHTML = this.name + " fainted."
        gsap.to(this.position, {
            y: this.position.y + 20,
            yoyo: true,
            repeat: 1,
            duration: 0.8
        })
        gsap.to(this, {
            opacity: 0,
            duration: 0.4
        })
        audio.battle.stop()
        audio.victory.play()
    }
}

// Map is zoomed in by 300%
const zoom = 4

class Boundary {
    static width = 12 * zoom
    static height = 12 * zoom

    constructor({position}) {
        this.position = position
        this.width = 12 * zoom
        this.height = 12 * zoom
    }

    draw() {
        context.fillStyle = 'rgba(255, 0, 0, 0)'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}
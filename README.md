Color and Music Coding Game.

Go to the refactor branch for latest working concept.

`/   \ *     :   . .    .        .    .> -  . .  \*   /  \`

# Simulates the physics of Large Hodran Collider with simple Cartesian distance formula

    // Check collisions between bullets and splashes
    this.bulletStream.forEach((bullet, bulletIndex) => {
      this.splashes.forEach((splash, splashIndex) => {
        const dx = bullet.x - splash.x;
        const dy = bullet.y - splash.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < bullet.radius + splash.radius) {
          // Collision detected! Create explosion
          this.createExplosion(bullet.x, bullet.y, splash.color);

          // Remove collided bullet
          this.bulletStream.splice(bulletIndex, 1);

          // Instead of creating new splash, just reset opacity of existing one
          splash.opacity = 1;
        }
      })
    })

MAKES USE OF THE PARTICLES PHYSICS

- Super Accelerator to collide with musical notes
- Levels of Difficulty are increased by three Games:

* Color Festival Game
  Basically use the seven key musical scale to collide
  with oncoming particle streams. When you
  create collisions you collect points. Still its quite challenging
  as you may need to understand the basic musical scale.

* Color Code Game
  Make a pattern by turning the tides and try catch the collision
  "hot zones" indicated by color coded musical notes. There will
  be a simple melody to be caught and unlocks new levels of
  melody difficulty.

* Multiplayer Game
  This essentialy takes both ideas from festival and
  code games and connects to a web socket server to challenge others.
  Still working exactly what that means...

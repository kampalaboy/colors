class Graphics {
  constructor(sheet) {
    this.sheet = sheet;
    this.canvas = document.getElementById("musicSheet");
    this.ctx = this.canvas.getContext("2d");
    this.bulletStream = [];
    this.splashes = []; // Add this to track active splashes

    this.fallingNotes = []; // Track active falling notes
    this.gravity = 0.2; // Gravity constant
    this.bounce = 0.6; // Bounce dampening (0-1)

    this.explosions = []; // Add this to track explosions

    // Start animation loop
    this.animate();
  }

  drawMusicSheet() {
    const lineSpacing = this.canvas.height / 12; // Divide canvas height into sections
    const startY = this.canvas.height / 3; // Start at 1/3 of canvas height

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw 5 music sheet lines
    this.ctx.strokeStyle = "#000";
    for (let i = 0; i < 10; i++) {
      const y = startY + i * lineSpacing;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y); // Start from left edge
      this.ctx.lineTo(this.canvas.width, y); // Go to right edge
      this.ctx.stroke();
    }
  }

  playNote(note, key, color) {
    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;
    const staffBottom = staffTop + lineSpacing * 4;

    const x = 50 + key.charCodeAt(0) * 10;
    const y = staffTop + Math.random() * (staffBottom - staffTop); // Constrain to staff area

    this.ctx.beginPath();
    this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();

    console.log(`Playing note: ${note}, at position (${x}, ${y})`);
  }

  splashColor(color) {
    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;
    const staffBottom = staffTop + lineSpacing * 4;

    const splash = {
      x: Math.random() * this.canvas.width,
      y: staffTop + Math.random() * (staffBottom - staffTop),
      radius: 10, // Math.random() * 20 + 5,
      opacity: 1,
      color: color,
    };

    console.log("Creating splash:", splash); // Debug log
    this.splashes.push(splash);
  }

  // Add new method to create falling notes
  createFallingNote(note, key, color) {
    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;

    // Calculate positions for top 3 lines
    const startLines = [
      staffTop, // First line
      staffTop + lineSpacing, // Second line
      staffTop + lineSpacing * 2, // Third line
    ];

    const startY = startLines[Math.floor(Math.random() * startLines.length)];

    const noteObj = {
      note: note,
      x: 50 + key.charCodeAt(0) * 10,
      y: startY,
      currentLine: Math.floor((startY - staffTop) / lineSpacing),
      progress: 0, // Progress through current arc (0 to 1)
      radius: 10,
      color: color,
      active: true,
    };
    this.fallingNotes.push(noteObj);
  }

  // Random Bullets coming from right to left
  streamBullets() {
    // Create new bullets periodically
    if (Math.random() < 0.1) {
      // Adjust probability to control bullet density
      const staffTop = this.canvas.height / 3;
      const lineSpacing = this.canvas.height / 12;

      // Calculate spaces between the 5 staff lines
      const gaps = [
        { min: staffTop, max: staffTop + lineSpacing }, // Between lines 1-2
        { min: staffTop + lineSpacing, max: staffTop + lineSpacing * 2 }, // Between lines 2-3
        { min: staffTop + lineSpacing * 2, max: staffTop + lineSpacing * 3 }, // Between lines 3-4
        { min: staffTop + lineSpacing * 3, max: staffTop + lineSpacing * 4 }, // Between lines 4-5
        { min: staffTop + lineSpacing * 4, max: staffTop + lineSpacing * 5 }, // Between lines 5-6
        { min: staffTop + lineSpacing * 5, max: staffTop + lineSpacing * 6 }, // Between lines 6-7
        { min: staffTop + lineSpacing * 6, max: staffTop + lineSpacing * 7 }, // Between line 7-8
      ];

      // Randomly choose a gap between staff lines
      const gap = gaps[Math.floor(Math.random() * gaps.length)];

      const bullet = {
        x: this.canvas.width, // Start from right
        y: gap.min + Math.random() * (gap.max - gap.min), // Random position in chosen gap
        speed: 2 + Math.random() * 2, // Random speed
        radius: 2,
      };

      this.bulletStream.push(bullet);
    }

    // Update and draw bullets
    this.bulletStream = this.bulletStream.filter((bullet) => {
      // Move bullet left
      bullet.x -= bullet.speed;

      // Draw bullet
      this.ctx.beginPath();
      this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = "black";
      this.ctx.fill();
      this.ctx.closePath();

      // Keep bullet if still on screen
      return bullet.x > -bullet.radius;
    });
  }

  createExplosion(x, y, color) {
    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: color,
        opacity: 1,
        life: 1, // Add life counter
      });
    }

    this.explosions.push({
      particles: particles,
      age: 0,
    });

    const audioExplosion = document.getElementById("audio");
    audioExplosion.src = "./public/cannon.mp3";

    var explosionAudio = audioExplosion.play();
    if (explosionAudio !== undefined) {
      explosionAudio
        .then((_) => {
          explosionAudio;
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Add animation loop
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMusicSheet();

    // Draw splashes first
    console.log("Current splashes:", this.splashes.length); // Debug log
    this.splashes = this.splashes.filter((splash) => {
      splash.opacity -= 0.02;

      if (splash.opacity <= 0) return false;

      this.ctx.beginPath();
      this.ctx.fillStyle = splash.color;
      this.ctx.globalAlpha = splash.opacity;
      this.ctx.shadowColor = splash.color;
      this.ctx.shadowBlur = 10 * splash.opacity;
      this.ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.globalAlpha = 1; // Reset alpha

      return true;
    });

    // Draw explosions
    this.explosions = this.explosions.filter((explosion) => {
      explosion.age++;

      explosion.particles = explosion.particles.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.opacity -= 0.05;
        particle.life -= 0.05;

        if (particle.life <= 0) return false;

        this.ctx.beginPath();
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = 5 * particle.opacity;
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1; // Reset alpha after each particle

        return true;
      });

      return explosion.particles.length > 0 && explosion.age < 60;
    });

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

          // Reset splash opacity
          splash.opacity = 1;
        }
      });
    });

    // Continue with bullets
    this.streamBullets();

    requestAnimationFrame(() => this.animate());
  }

  // Modify drawNoteOnPress to create both a splash and a falling note
  drawNoteOnPress(note, key, color) {
    console.log("Drawing note with color:", color); // Debug log
    this.splashColor(color);
    this.createFallingNote(note, key, color);
  }
}

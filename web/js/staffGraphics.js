class SheetGraphics {
  constructor(sheet) {
    this.sheet = sheet;
    this.canvas = document.getElementById("musicSheet");
    this.ctx = this.canvas.getContext("2d");
    this.bulletStream = [];
    this.splashes = []; // Add this to track active splashes

    this.explosions = []; // Add this to track explosions

    this.shakeIntensity = 0;
    this.shakeDecay = 0.9; // How quickly the shake settles
    this.canvasOffset = { x: 0, y: 0 }; // Track shake offset

    // Setup Web Audio API
    this.audioContext = new window.AudioContext();
    this.explosionBuffer = null;
    this.loadExplosionSound();

    // Start animation loop
    this.animate();
  }

  async loadExplosionSound() {
    try {
      const response = await fetch("./public/explosion.mp3");
      const arrayBuffer = await response.arrayBuffer();
      this.explosionBuffer = await this.audioContext.decodeAudioData(
        arrayBuffer
      );
    } catch (error) {
      console.error("Error loading explosion sound:", error);
    }
  }

  playExplosionSound() {
    if (!this.explosionBuffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = this.explosionBuffer;

    // Add volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.5; // Adjust volume as needed

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
  }

  drawMusicSheet() {
    const lineSpacing = this.canvas.height / 12; // Divide canvas height into sections
    const startY = this.canvas.height / 3; // Start at 1/3 of canvas height

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw 5 music sheet lines
    this.ctx.strokeStyle = "#000";
    for (let i = 0; i < 8; i++) {
      const y = startY + i * lineSpacing;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y); // Start from left edge
      this.ctx.lineTo(this.canvas.width, y); // Go to right edge
      this.ctx.stroke();
    }
  }

  splashColor(color, note) {
    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;
    const staffBottom = staffTop + lineSpacing * 7;

    const splash = {
      x: Math.random() * this.canvas.width,
      y: 0, //staffTop + Math.random() * (staffBottom - staffTop),
      radius: 10,
      opacity: 1,
      color: color,
      note: note,
    };
    switch (note) {
      case "Dr":
        splash.y = staffTop;
        break;
      case "C":
        splash.y = staffBottom;
        break;
      case "D":
        splash.y = staffTop + lineSpacing * 6;
        break;
      case "E":
        splash.y = staffTop + lineSpacing * 5;
        break;
      case "F":
        splash.y = staffTop + lineSpacing * 4;
        break;
      case "G":
        splash.y = staffTop + lineSpacing * 3;
        break;
      case "A":
        splash.y = staffTop + lineSpacing * 2;
        break;
      case "B":
        splash.y = staffTop + lineSpacing;
        break;
    }
    this.splashes.push(splash);
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
        { min: staffTop + lineSpacing * 7, max: staffTop + lineSpacing * 8 }, // Between line 8-9
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
      const angle =
        (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 3;

      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: color,
        opacity: 1,
        life: 1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.1 + Math.random() * 0.2,
        wobbleRadius: 2 + Math.random() * 4,
      });
    }

    this.explosions.push({
      particles: particles,
      age: 0,
    });

    // Play explosion sound using pool
    this.playExplosionSound();

    // Trigger shake
    this.shakeIntensity = 15;
  }

  updateShake() {
    if (this.shakeIntensity > 0) {
      // Create random offset based on intensity
      this.canvasOffset = {
        x: (Math.random() - 0.5) * this.shakeIntensity,
        y: (Math.random() - 0.5) * this.shakeIntensity,
      };

      // Decay the shake
      this.shakeIntensity *= this.shakeDecay;

      // Cut off small shakes
      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
        this.canvasOffset = { x: 0, y: 0 };
      }
    }
  }

  // Add animation loop
  animate() {
    // Update shake at start of frame
    this.updateShake();

    // Apply shake offset to entire canvas
    this.ctx.save();
    this.ctx.translate(this.canvasOffset.x, this.canvasOffset.y);

    // Clear and draw everything
    this.ctx.clearRect(
      -this.canvasOffset.x,
      -this.canvasOffset.y,
      this.canvas.width,
      this.canvas.height
    );

    this.drawMusicSheet();

    // Draw splashes first
    // console.log("Current splashes:", this.splashes.length); // Debug log
    // console.log("Current explosions:", this.explosions.length);
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
      // Debug log
      explosion.age++;

      explosion.particles = explosion.particles.filter((particle) => {
        // Update particle position with wobble
        particle.wobble += particle.wobbleSpeed;

        // Add wobble to velocity
        particle.x +=
          particle.vx + Math.cos(particle.wobble) * particle.wobbleRadius * 0.1;
        particle.y +=
          particle.vy + Math.sin(particle.wobble) * particle.wobbleRadius * 0.1;

        particle.vx += (Math.random() - 0.5) * 0.3;
        particle.vy += (Math.random() - 0.5) * 0.3;
        particle.opacity -= 0.05;
        particle.life -= 0.05;

        if (particle.life <= 0) return false;

        this.ctx.beginPath();
        this.ctx.fillStyle = particle.color;
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = 5 * particle.opacity;
        this.ctx.arc(
          particle.x,
          particle.y,
          particle.radius * (1 + Math.sin(particle.wobble) * 0.2),
          0,
          Math.PI * 2
        );
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

          // Instead of creating new splash, just reset opacity of existing one
          splash.opacity = 1;
        }
      });
    });

    // Continue with bullets
    this.streamBullets();

    // Reset canvas transform
    this.ctx.restore();

    requestAnimationFrame(() => this.animate());
  }

  // Modify drawNoteOnPress to create both a splash and a falling note
  drawNoteOnPress(note, color) {
    console.log("Drawing note with color:", color); // Debug log
    this.splashColor(color, note);
    //this.createFallingNote(note, key, color);
  }
}

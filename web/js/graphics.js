class Graphics {
  constructor(sheet) {
    this.sheet = sheet;
    this.canvas = document.getElementById("musicSheet");
    this.ctx = this.canvas.getContext("2d");

    this.glowBlur = "";
    this.glowIncreasing = true;

    this.splashes = []; // Add this to track active splashes

    // Draw initial music sheet lines
    this.drawMusicSheet();
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
    // Calculate staff boundaries
    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;
    const staffBottom = staffTop + lineSpacing * 4;

    // Create new splash within staff boundaries
    const splash = {
      x: Math.random() * this.canvas.width,
      y: staffTop + Math.random() * (staffBottom - staffTop), // Constrain to staff area
      radius: Math.random() * 20 + 5,
      opacity: 1,
      color: color,
    };

    this.splashes.push(splash);

    const animateGlow = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.drawMusicSheet(); // Redraw the music sheet lines

      // Update and draw each splash
      this.splashes = this.splashes.filter((splash) => {
        splash.opacity -= 0.02; // Adjust fade speed

        if (splash.opacity <= 0) return false; // Remove completely faded splashes

        this.ctx.beginPath();
        this.ctx.fillStyle = `${splash.color}${Math.floor(splash.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        this.ctx.shadowColor = splash.color;
        this.ctx.shadowBlur = 15 * splash.opacity; // Blur fades with opacity
        this.ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2, false);
        this.ctx.fill();

        return true;
      });

      // Continue animation if there are active splashes
      if (this.splashes.length > 0) {
        requestAnimationFrame(animateGlow);
      }
    };

    // Start animation loop
    animateGlow();
  }

  drawNoteOnPress(note, key, color) {
    // Draw note on canvas and add splash effect
    this.playNote(note, key, color);
    this.splashColor(
      color,
      50 + key.charCodeAt(0) * 10,
      100 + Math.random() * 200
    );
  }
}

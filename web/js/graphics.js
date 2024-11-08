class Graphics {
  constructor(sheet) {
    this.sheet = sheet;
    this.canvas = document.getElementById("musicSheet");
    this.ctx = this.canvas.getContext("2d");

    this.splashes = []; // Add this to track active splashes

    this.fallingNotes = []; // Track active falling notes
    this.gravity = 0.2; // Gravity constant
    this.bounce = 0.6; // Bounce dampening (0-1)

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
    // Calculate staff boundaries
    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;
    const staffBottom = staffTop + lineSpacing * 4;

    // Create new splash within staff boundaries
    const splash = {
      x: Math.random() * this.canvas.width,
      y: staffTop + Math.random() * (staffBottom - staffTop), // Constrain to staff area
      radius: 10,
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

  // Add animation loop
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMusicSheet();

    // Draw splashes first
    this.splashes = this.splashes.filter((splash) => {
      splash.opacity -= 0.02;

      if (splash.opacity <= 0) return false;

      this.ctx.beginPath();
      this.ctx.fillStyle = `${splash.color}${Math.floor(splash.opacity * 255)
        .toString(16)
        .padStart(2, "0")}`;
      this.ctx.shadowColor = splash.color;
      this.ctx.shadowBlur = 15 * splash.opacity;
      this.ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2, false);
      this.ctx.fill();

      return true;
    });

    const staffTop = this.canvas.height / 3;
    const lineSpacing = this.canvas.height / 12;

    // Then draw falling notes
    this.fallingNotes.forEach((note) => {
      // Update progress
      note.progress += 0.05; // Controls speed of movement

      if (note.progress >= 1) {
        // Move to next line
        note.currentLine++;
        note.progress = 0;
        // Create splash when landing on a line
        this.splashColor(note.color);
      }

      // Calculate current and next line y-positions
      const currentLineY = staffTop + note.currentLine * lineSpacing;
      const nextLineY = currentLineY + lineSpacing;

      // Create parabolic arc between lines
      const t = note.progress;
      const arcHeight = lineSpacing * 0.3; // Maximum height of the arc

      // Parabolic interpolation
      note.y =
        currentLineY +
        t * lineSpacing + // Linear movement down
        -4 * arcHeight * t * (t - 1); // Parabolic arc

      // Draw the note
      this.ctx.beginPath();
      this.ctx.arc(note.x, note.y, note.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = note.color;
      this.ctx.fill();
      this.ctx.closePath();
    });

    // Clean up notes that have passed the last line
    const lastLineY = staffTop + lineSpacing * 4;
    this.fallingNotes = this.fallingNotes.filter(
      (note) => note.currentLine < 5 // Remove after passing last line
    );

    requestAnimationFrame(() => this.animate());
  }

  // Modify drawNoteOnPress to create both a splash and a falling note
  drawNoteOnPress(note, key, color) {
    //this.splashColor(color);
    this.createFallingNote(note, key, color);
  }
}

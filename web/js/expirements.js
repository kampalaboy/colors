/*
This is the random splashes fast and random
*/

class Graphics {
  constructor(sheet) {
    this.sheet = sheet;
    this.canvas = document.getElementById("musicSheet");
    this.ctx = this.canvas.getContext("2d");

    this.glowBlur = "";
    this.glowIncreasing = true;

    this.splashes = []; // Add this to track active splashes

    this.fallingNotes = []; // Track active falling notes
    this.gravity = 0.2; // Gravity constant
    this.bounce = 0.6; // Bounce dampening (0-1)

    // Draw initial music sheet lines
    this.drawMusicSheet();

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
      radius: 5,
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
    const noteObj = {
      note: note,
      x: 50 + key.charCodeAt(0) * 10,
      y: 0, // Start at top
      vy: 0, // Vertical velocity
      radius: 8,
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

    // Then draw falling notes
    this.fallingNotes.forEach((note) => {
      note.vy += this.gravity;
      note.y += note.vy;

      const staffTop = this.canvas.height / 3;
      const lineSpacing = this.canvas.height / 12;
      const staffLines = Array(5)
        .fill(0)
        .map((_, i) => staffTop + i * lineSpacing);

      staffLines.forEach((lineY) => {
        if (
          note.y + note.radius > lineY &&
          note.y + note.radius < lineY + note.vy &&
          note.vy > 0
        ) {
          note.y = lineY - note.radius;
          note.vy *= -this.bounce;
          // Create a splash when note hits a line
          this.splashColor(note.color);
        }
      });

      this.ctx.beginPath();
      this.ctx.arc(note.x, note.y, note.radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = note.color;
      this.ctx.fill();
      this.ctx.closePath();
    });

    // Clean up settled notes
    this.fallingNotes = this.fallingNotes.filter(
      (note) => Math.abs(note.vy) > 0.1 || note.y < this.canvas.height
    );

    requestAnimationFrame(() => this.animate());
  }

  // Modify drawNoteOnPress to create both a splash and a falling note
  drawNoteOnPress(note, key, color) {
    //this.splashColor(color);
    this.createFallingNote(note, key, color);
  }

  // drawNoteOnPress(note, key, color) {
  //   // Draw note on canvas and add splash effect
  //   this.playNote(note, key, color);
  //   this.splashColor(
  //     color,
  //     50 + key.charCodeAt(0) * 10,
  //     100 + Math.random() * 200
  //   );
  // }
}

/*
This is animation with stream but no explosions
*/

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

  // Add animation loop
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawMusicSheet();

    // Add streamBullets to animation loop
    this.streamBullets();

    // Draw splashes first
    this.splashes = this.splashes.filter((splash) => {
      splash.opacity -= 0.02;

      if (splash.opacity <= 0) return false;

      this.ctx.beginPath();
      this.ctx.fillStyle = splash.color;
      this.ctx.globalAlpha = splash.opacity;
      this.ctx.shadowColor = splash.color;
      this.ctx.shadowBlur = 15 * splash.opacity;
      this.ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2, false);
      this.ctx.fill();
      this.ctx.globalAlpha = 1; // Reset global alpha

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

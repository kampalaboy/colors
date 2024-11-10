class RadarGraphics {
  constructor() {
    this.canvas = document.getElementById("radar");
    this.ctx = this.canvas.getContext("2d");
    this.centerX = 175; // Center x position (half of 350)
    this.centerY = 175; // Center y position (half of 350)
    this.radius = 150; // Radius of the radar circle
    this.angle = 0; // Starting angle in radians

    // Start animation loop
    this.animate();
  }

  // Draw radar circles
  drawRadar() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const numCircles = 8;
    const radiusStep = this.radius / numCircles;

    for (let i = 0; i < numCircles; i++) {
      const radius = this.radius - i * radiusStep;
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, radius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = "#96f97b";
      this.ctx.fill();
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#000";
      this.ctx.stroke();
    }
  }

  // Draw the rotating radar line
  radarPing() {
    // Calculate the moving end of the line
    // const x = this.centerX + this.radius * Math.cos(this.angle);
    // const y = this.centerY + this.radius * Math.sin(this.angle);
    const beamWidth = 0.2;
    const x1 = 175 + this.radius * Math.cos(this.angle - beamWidth / 2);
    const y1 = 175 + this.radius * Math.sin(this.angle - beamWidth / 2);
    const x2 = 175 + this.radius * Math.cos(this.angle + beamWidth / 2);
    const y2 = 175 + this.radius * Math.sin(this.angle + beamWidth / 2);

    // Draw the line from the center to the moving point on the circumference
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "green";
    this.ctx.shadowColor = "rgba(0, 255, 0, 0.6)";
    this.ctx.shadowBlur = 15;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fill();
    this.ctx.stroke();

    // Increment the angle for rotation
    this.angle += 0.02; // Adjust speed by changing the increment value
  }

  // Animation loop
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawRadar(); // Draw the radar background
    this.radarPing(); // Draw the rotating line

    requestAnimationFrame(() => this.animate());
  }
}

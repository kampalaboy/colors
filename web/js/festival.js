const piano = new Player();
const festivalGraphics = new SheetGraphics();

// Access mapped data from backgrounds
piano.backgrounds.forEach((background) => {
  console.log(`Color: ${background.color}, Note: ${background.note}`);
  festivalGraphics.drawNoteOnPress(background.musicNote, background.color);
});

export function getGasImage(imagePath) {
  try {
    return require(`../assets/${imagePath}`);
  } catch (err) {
    console.error('Image not found:', imagePath);
    return require('../assets/gasImages/default.png'); // fallback
  }
}
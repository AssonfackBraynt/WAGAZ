// utils/getGasImage.ts (make this a TypeScript file if you can)
const images = import.meta.glob('../assets/gasImages/*.{jpg,jpeg,png,svg}', {
  eager: true,
  import: 'default',
});

export function getGasImage(imageName: string): string {
  const path = `../assets/gasImages/${imageName}`;
  if (images[path]) {
    return images[path] as string;
  } else {
    console.error('Image not found >>>>>>>>>>>>>>:', imageName);
    return images['../assets/gasImages/default.png'] as string; // fallback image
  }
}

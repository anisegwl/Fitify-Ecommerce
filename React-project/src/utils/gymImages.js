/** Normalize gym images for legacy docs that only had `image: string[]`. */
export function getGymMainImage(gym) {
  if (!gym) return "";
  if (gym.mainImage) return gym.mainImage;
  if (Array.isArray(gym.image) && gym.image[0]) return gym.image[0];
  return "";
}

export function getGymGallery(gym) {
  if (!gym) return [];
  if (Array.isArray(gym.gallery) && gym.gallery.length > 0) return [...gym.gallery];
  if (Array.isArray(gym.image) && gym.image.length > 1) return gym.image.slice(1);
  return [];
}

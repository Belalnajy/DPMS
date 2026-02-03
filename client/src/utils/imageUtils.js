export const getProfilePictureUrl = (profilePicture) => {
  if (!profilePicture) return null;
  if (profilePicture.startsWith('http')) {
    return profilePicture;
  }
  return `/uploads/${profilePicture}`;
};

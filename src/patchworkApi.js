/* globals fetch */
export const getPatch = async id => {
  const response = await fetch(`/api/v1/patches/${id}`);
  return await response.text();
};

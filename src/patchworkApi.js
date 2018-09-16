/* globals fetch */

const baseServerUrl = "https://wheelibin-patchwork.herokuapp.com";

export const getPatch = async id => {
  //await timeout(4000);
  const response = await fetch(`${baseServerUrl}/api/v1/patches/${id}`);
  return await response.text();
};

const timeout = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

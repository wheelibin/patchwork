/* globals fetch */

//const baseServerUrl = "https://wheelibin-patchwork.herokuapp.com";
const baseServerUrl = "";

export const getPatch = async id => {
  //await timeout(4000);
  const response = await fetch(`${baseServerUrl}/api/v1/patches/${id}`);
  const patch = await response.json();
  return patch.markup;
};

export const savePatch = async markup => {
  const response = await fetch(`${baseServerUrl}/api/v1/patches/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ markup: markup })
  });
  return await response.text();
};

// const timeout = ms => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// };

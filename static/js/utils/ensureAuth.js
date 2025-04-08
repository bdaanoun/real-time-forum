import { go } from "../router.js";
let isAuthenticated = null;

/**
  @param {null | boolean} state - The authentication state, which can be null, true, or false.
*/

export const changeAuthState = (state = null) => {
  if (state === null || typeof state == "boolean") {
    isAuthenticated = state;
  } else {
    throw new Error("state can only be null or boolean");

  }
};

export const ensureAuth = async () => {
  let res = await fetch("/api/CheckAuth")
  console.log(res);
  return res.ok
};

export default ensureAuth;

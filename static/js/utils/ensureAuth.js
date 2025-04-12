
export const ensureAuth = async () => {
  let res = await fetch("/api/CheckAuth")
  console.log(res);
  return res.ok
};

export default ensureAuth;

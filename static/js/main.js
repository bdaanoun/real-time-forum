let res = await fetch("/api/auth/checkAUth")

import login from "../login.js";

login()


if (!res.ok) {
    console.log("unnlogged");
}


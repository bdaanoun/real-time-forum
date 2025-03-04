
import login from "../login.js";

let res = await fetch("/api/auth/checkAUth")
console.log(res);

    if (!res.ok) {
        console.log("unnlogged");
        login()
    }else {
        console.log("logged");
        
       // homePage()
    }
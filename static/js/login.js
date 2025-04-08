import div from "./utils/div.js"
import input from "./utils/input.js"
import button from "./utils/button.js"
import link from "./utils/link.js"
import navigateTo from "./main.js"
export  default async function login() {
    document.body.innerHTML =""
    let name = input("name", "name")
    let pass = input("password", "password")
    let errorPlace = div("errorPlace")
    let logo = document.createElement("img")
    logo.src = "./static/svg/logo.svg"
    let btn = button("login", () => logUser(name, pass, errorPlace));
    let login = div("login").add(
        div("tocenter").add(
            div("texts",).add(
                logo, div("smalltext", "login to access premium posts")
            ),
            div("form").add(
                name, pass, errorPlace, btn ,  div("smalltext" , "Don't have an account? ").add(link("Register", "/register", () => navigateTo("/register")))
            )
        )
    )
    document.body.append(login)
}
async function logUser(name, pass, errorPlace) {

    if (!name.value.length || !pass.value.length) {
        errorPlace.textContent = "please enter  both name and password"
        return
    }
    let resp = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname: name.value,
            password: pass.value
        })
    })
    if (resp.ok) {
        console.log("logged successfully");
        routIt()
    } else {
        let data = await resp.json()
        errorPlace.textContent = data.error
        console.log("failed to login");
    }
}
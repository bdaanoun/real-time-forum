import navigateTo from "./main.js";
import button from "./utils/button.js";
import div from "./utils/div.js";
import input from "./utils/input.js";
import link from "./utils/link.js";
import select from "./utils/select.js";
export default function register() {
    document.body.innerHTML =""
    let nickname = input("text", "Nickname")
    let age = input("number", "Age")
    let gender = select("gender", ["Male", "Female"])
    let firstName = input("text", "First Name")
    let lastName = input("text", "Last Name")
    let email = input("email", "E-mail")
    let password = input("password", "Password")
    let errorPlace = div("errorPlace")
     let logo = document.createElement("img")
    logo.src = "./static/svg/logo.svg"
    let btn = button("Register", () => registerUser(nickname, age, gender, firstName, lastName, email, password, errorPlace))

    let registerDiv = div("register").add(
        div("tocenter").add(
            div("texts").add(
               logo ,  div("smalltext", "Create a new account")
            ),
            div("form").add(
                nickname,
                age,
                gender,
                firstName,
                lastName,
                email,
                password,
                errorPlace,
                btn ,
                div("smalltext" , "Don't have an account? ").add(link("login", "/login", () => navigateTo("/login")))
            )

        )
    )
    document.body.append(registerDiv)

}

async function registerUser(nickname, age, gender, firstName, lastName, email, password, errorPlace) {
    if (!nickname.value || !age.value || !gender.value || !firstName.value || !lastName.value || !email.value || !password.value) {
        errorPlace.textContent = "Please fill in all fields"
        return
    }

    let resp = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nickname: nickname.value,
            age: age.value,
            gender: gender.value,
            firstName: firstName.value,
            lastName: lastName.value,
            email: email.value,
            password: password.value
        })
    })

    if (resp.ok) {
        console.log("registered successfully")
        navigateTo("/")
    } else {
        let data = await resp.json()
        errorPlace.textContent = data.error || "Failed to register"
        console.log("failed to register")
    }
}


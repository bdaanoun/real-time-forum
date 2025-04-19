import navigateTo from "./main.js";
import button from "./utils/button.js";
import div from "./utils/div.js";
import input from "./utils/input.js";
import link from "./utils/link.js";
import select from "./utils/select.js";
export default function register() {
    console.log("in register");

    document.body.innerHTML = ""
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
    let btn = button("Register", async() => { await registerUser(nickname, age, gender, firstName, lastName, email, password, errorPlace)})

    let registerDiv = div("register").add(
        div("tocenter").add(
            div("texts").add(
                logo, div("smalltext", "Create a new account")
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
                btn,
                div("smalltext", "already have an account? ").add(link("login", "/login", () => navigateTo("/login")))
            )

        )
    )
    document.body.append(registerDiv)

}

async function registerUser(nickname, age, gender, firstName, lastName, email, password, errorPlace) {


    // if (!nickname.value || !age.value || !gender.value || !firstName.value || !lastName.value || !email.value || !password.value) {
    //     errorPlace.textContent = "Please fill in all fields"
    // } else if (parseInt(age.value) <= 16) {
    //     console.log(typeof (age.value));
    //     errorPlace.textContent = "The age should be greater than 16 years. GO AWAY"
    // } else if (nickname.value.length >= 12) {
    //     errorPlace.textContent = "Nickname should be less than 8 characters."
    // } else if (!/^[a-zA-Z0-9_]+$/.test(nickname.value)) {
    //     errorPlace.textContent = "Nickname must not contain special characters.";
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    //     errorPlace.textContent = "Invalid email format.";
    // } else if (password.value.length < 6) {
    //     errorPlace.textContent = "Password must be at least 6 characters long.";
    // } else {
    //     errorPlace.textContent = ""
    //     console.log("Form is valid, ready to submit!")
    // }

    let resp = await fetch("/api/Register", {
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
        let data = await resp.text()
        console.log(data);
        let errorMessage = data || "Failed to register"
        errorPlace.textContent = errorMessage
        console.log(errorMessage)
    }
}


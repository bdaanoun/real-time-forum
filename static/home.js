// import tag from "../utils/createInput.js";

export default function home() {
    let app = document.getElementById("apps")


    let home = `
    <section>
        welcome home
    </section>
    `

    if (app) {
        console.log("rout")

        app.innerHTML = home
    } else {
        console.log("there is no app")
    }
}

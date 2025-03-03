import tag from "./utils/createInput.js";

export default function login() {

    let body = document.body
    let lblUserName = tag('label', 'username', { 'for': 'username' })
    let username = tag('input', "", { 'placeholder': 'ur username.', 'id': 'username', 'class': 'username' })

    let lblEmail = tag('label', 'Email', {'for':"Email"})
    let Email = tag('input', '')

    body.append(lblUserName, username)
}

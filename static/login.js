import tag from "./utils/createInput.js";

export default function login() {

    let body = document.body
    let LoginDiv = tag('div', '', { 'class': 'loginPlace' })
    let logo = tag('img', '', { 'class': 'logo', 'src': '/static/images/logo.png' })

    let loginBtn = tag('button', 'Login', { 'class': 'loginBtn' })
    let registerBtn = tag('button', 'Register', { 'class': 'registerBtn' })

    let lblUserName = tag('label', 'username', { 'for': 'username' })
    let username = tag('input', "", { 'placeholder': 'ur username.', 'id': 'username', 'class': 'username' })

    let lblPassword = tag('label', 'password', { 'for': "password" })
    let password = tag('input', '', { 'type': 'password', 'placeholder': 'password' })

    let loginSubmitBtn = tag('button', 'Login', { 'class': 'loginSubmit' });

    LoginDiv.append(logo, loginBtn, registerBtn, lblUserName, username, lblPassword, password, loginSubmitBtn)
    body.append(LoginDiv)
}

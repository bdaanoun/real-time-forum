import tag from "./utils/createInput.js";
import { navigate } from "./js/main.js";

export default function login() {

    let LoginDiv = tag('div', '', { 'class': 'loginPlace' })
    let logo = tag('img', '', { 'class': 'logo', 'src': '/static/images/logo.png' })

    let Btnscontainer = tag('div', '', { 'class': 'Btnscontainer' })
    let loginBtn = tag('span', 'Login', { 'class': 'loginBtn active' })
    let registerBtn = tag('span', 'Register', { 'class': 'registerBtn' })

    loginBtn.addEventListener('click', () => navigate('/login'))
    registerBtn.addEventListener('click', () => navigate('/register'))
    Btnscontainer.append(loginBtn, registerBtn)

    let inputsContainer = tag('div', '', { 'class': 'inputsContainer' })
    let lblUserName = tag('label', 'username', { 'for': 'username' });
    let username = tag('input', "", { 'placeholder': 'ur username.', 'id': 'username', 'class': 'username' });

    let lblPassword = tag('label', 'password', { 'for': "password" });
    let password = tag('input', '', { 'type': 'password', 'placeholder': 'password', 'id': 'password' });

    let loginSubmitBtn = tag('button', 'Login', { 'class': 'loginSubmit' });

    // Add event listener for login submission
    loginSubmitBtn.addEventListener('click', () => {
        const usernameValue = username.value;
        const passwordValue = password.value;
        navigate('/')
        // Basic validation
        // if (!usernameValue || !passwordValue) {
        //     alert('Please enter both username and password');
        //     return;
        // }

        // Here you would typically handle login logic, 
        // such as sending credentials to a backend API
        console.log('Login attempt:', { usernameValue, passwordValue });
    });

    inputsContainer.append(lblUserName, username, lblPassword, password, loginSubmitBtn);

    LoginDiv.append(logo, Btnscontainer, inputsContainer);
    let app = document.getElementById("apps")
    if (app) {
        app.innerHTML = ""
        console.log(app)
        app.appendChild(LoginDiv);
    } else {
        console.log('there is no app we are in the login');
    }
}
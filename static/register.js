import tag from "./utils/createInput.js";
import { navigate } from "./js/main.js";

export default function register() {
    let app = document.getElementById("apps")
    if (app) {
        app.innerHTML = '';
    } else {
        app = tag('div', '', { 'class': 'con' });
        document.body.appendChild(app);
    }

    let RegisterDiv = tag('div', '', { 'class': 'registerPlace' });
    let logo = tag('img', '', { 'class': 'logo', 'src': '/static/images/logo.png' });

    let Btnscontainer = tag('div', '', { 'class': 'Btnscontainer' });
    let loginBtn = tag('span', 'Login', { 'class': 'loginBtn' });
    let registerBtn = tag('span', 'Register', { 'class': 'registerBtn active' });

    loginBtn.addEventListener('click', () => navigate('/login'));
    registerBtn.addEventListener('click', () => navigate('/register'));
    Btnscontainer.append(loginBtn, registerBtn);

    let inputsContainer = tag('div', '', { 'class': 'inputsContainer' });
    // let lblNickname = tag('label', 'nickname', { 'for': 'nickname' });
    let Nickname = tag('input', "", { 'placeholder': 'Choose a Nickname', 'id': 'Nickname', 'class': 'Nickname' });

    var age_gender = tag('div', '', { 'class': 'age_gender' });
    // let age = tag('label', 'age', { 'for': 'age' });
    var ageInput = tag('input', "", { 'placeholder': 'Enter your age', 'id': 'age', 'class': 'age' });

    // let lblGender = tag('label', 'Gender', { 'for': 'gender' });
    let gender = tag('select', '', { 'id': 'gender', 'class': 'gender' });
    let defaultOption = tag('option', 'Choose your gender', { 'value': '', 'selected': true, 'disabled': true });
    let male = tag('option', 'Male', { 'value': 'male' });
    let female = tag('option', 'Female', { 'value': 'female' });
    gender.append(defaultOption, male, female);
    age_gender.append(ageInput, gender);

    let FI_LA_names = tag('div', '', { 'class': 'FI_LA_names' });

    let Firstname = tag('input', "", { 'placeholder': 'Firstname', 'id': 'Firstname', 'class': 'Firstname' });
    let Lastname = tag('input', "", { 'placeholder': 'Lastname', 'id': 'Lastname', 'class': 'Lastname' });

    FI_LA_names.append(Firstname, Lastname);


    // let lblEmail = tag('label', 'email', { 'for': 'email' });
    let email = tag('input', "", { 'type': 'email', 'placeholder': 'Enter your email', 'id': 'email', 'class': 'email' });

    // let lblPassword = tag('label', 'password', { 'for': "password" });
    let password = tag('input', '', { 'type': 'password', 'placeholder': 'Create a password', 'id': 'password' });

    let registerSubmitBtn = tag('button', 'Register', { 'class': 'registerSubmit' });



    // Add event listener for registration submission
    registerSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        fetchNewUser()
    });

    inputsContainer.append(Nickname, age_gender, FI_LA_names, email, password, registerSubmitBtn);

    RegisterDiv.append(logo, Btnscontainer, inputsContainer);
    app.appendChild(RegisterDiv);
}

async function fetchNewUser() {
    // Add event listener for registration submission
    const NicknameValue = document.getElementById('Nickname').value;
    const ageValue = document.getElementById('age').value;
    const genderValue = document.getElementById('gender').value;
    const FirstnameValue = document.getElementById('Firstname').value;
    const LastnameValue = document.getElementById('Lastname').value;
    const emailValue = document.getElementById('email').value;
    const passwordValue = document.getElementById('password').value;
    let res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Nickname: NicknameValue,
            age: ageValue,
            gender: genderValue,
            Firstname: FirstnameValue,
            Lastname: LastnameValue,
            email: emailValue,
            password: passwordValue,
        }),
    })
    

    console.log(NicknameValue, ageValue, genderValue, FirstnameValue, LastnameValue, emailValue, passwordValue);

}
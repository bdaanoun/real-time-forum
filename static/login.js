import tag from "./utils/createInput.js";

export default function login() {

    let body = document.body

    let LoginDiv = tag('div', '', { 'class': 'loginPlace' })
    let logo = tag('img', '', { 'class': 'logo', 'src': '/static/images/logo.png' })

    let Btnscontainer = tag('div', '', { 'class': 'Btnscontainer' })
    let loginBtn = tag('span', 'Login', { 'class': 'loginBtn active' })
    let registerBtn = tag('span', 'Register', { 'class': 'registerBtn' })
    Btnscontainer.append(loginBtn, registerBtn)

    //...
    let inputsContainer = tag('div', '', { 'class': 'inputsContainer' })
    let lblUserName = tag('label', 'username', { 'for': 'username' })
    let username = tag('input', "", { 'placeholder': 'ur username.', 'id': 'username', 'class': 'username' })

    let lblPassword = tag('label', 'password', { 'for': "password" })
    let password = tag('input', '', { 'type': 'password', 'placeholder': 'password' })

    let loginSubmitBtn = tag('button', 'Login', { 'class': 'loginSubmit' });
    inputsContainer.append(lblUserName, lblPassword, username, lblPassword, password, loginSubmitBtn)
    //...

    let registerArea = tag('div', '', {'class':'inputsContainer'})

    let lblNickname = tag('label', 'Nickname', {'for':'nickname'})
    let nickname = tag('input', '' , {'id':'nickname', 'name':'nickname'})

    let lblAge = tag('label', 'Age', {'for':'age'})
    let age = tag('input', '' , {'id':'age', 'name':'age'})

    let lblGender = tag('label', 'gender', {'for':'gender'})
    let gender = tag('input', '' , {'id':'gender', 'name':'gender'})


    let lblFirstName = tag('label', 'firstName', {'for':'firstName'})
    let firstName = tag('input', '' , {'id':'firstName', 'name':'firstName'})

    let lblLastName = tag('label', 'LastName', {'for':'LastName'})
    let LastName = tag('input', '' , {'id':'LastName', 'name':'LastName'})

    let lblEmail = tag('label', 'email', {'for':'email'})
    let email = tag('input', '' , {'id':'email', 'name':'email'})

    let lblPssword = tag('label', 'password', { 'for': "password" })
    let pssword = tag('input', '', { 'type': 'password', 'placeholder': 'password' })

    registerArea.append(lblNickname, nickname, lblAge, age,
        lblGender, gender, lblFirstName,firstName, 

    )
    

    loginBtn.addEventListener('click', () => {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
        registerArea.style.display = 'none';
        inputsContainer.style.display = 'flex';
    });
    
    registerBtn.addEventListener('click', () => {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
        inputsContainer.style.display = 'none';
        registerArea.style.display = 'flex';
    });

    LoginDiv.append(logo, Btnscontainer, inputsContainer, registerArea)
    body.append(LoginDiv)
}

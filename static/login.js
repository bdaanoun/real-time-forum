import tag from "./utils/createInput.js";

const routes = {
    '/': login,
    '/login': login,
    '/register': register,
};

let app

export default function login() {
    if (app) {
        app.innerHTML = ''
    } else {
        app = tag('div', '', { 'class': 'con' })
        document.body.appendChild(app)
    }

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
        
        // Basic validation
        if (!usernameValue || !passwordValue) {
            alert('Please enter both username and password');
            return;
        }

        // Here you would typically handle login logic, 
        // such as sending credentials to a backend API
        console.log('Login attempt:', { usernameValue, passwordValue });
    });

    inputsContainer.append(lblUserName, username, lblPassword, password, loginSubmitBtn);

    LoginDiv.append(logo, Btnscontainer, inputsContainer);
    app.appendChild(LoginDiv);
}

export function register() {
    // Clear previous content
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
    let lblUserName = tag('label', 'username', { 'for': 'username' });
    let username = tag('input', "", { 'placeholder': 'Choose a username', 'id': 'username', 'class': 'username' });

    let lblEmail = tag('label', 'email', { 'for': 'email' });
    let email = tag('input', "", { 'type': 'email', 'placeholder': 'Enter your email', 'id': 'email', 'class': 'email' });

    let lblPassword = tag('label', 'password', { 'for': "password" });
    let password = tag('input', '', { 'type': 'password', 'placeholder': 'Create a password', 'id': 'password' });

    let registerSubmitBtn = tag('button', 'Register', { 'class': 'registerSubmit' });

    // Add event listener for registration submission
    registerSubmitBtn.addEventListener('click', () => {
        const usernameValue = username.value;
        const emailValue = email.value;
        const passwordValue = password.value;
        
        // Basic validation
        if (!usernameValue || !emailValue || !passwordValue) {
            alert('Please fill in all fields');
            return;
        }

        // Here you would typically handle registration logic, 
        // such as sending user details to a backend API
        console.log('Registration attempt:', { usernameValue, emailValue, passwordValue });
    });

    inputsContainer.append(lblUserName, username, lblEmail, email, lblPassword, password, registerSubmitBtn);

    RegisterDiv.append(logo, Btnscontainer, inputsContainer);
    app.appendChild(RegisterDiv);
}

function renderRoute() {
    const path = window.location.pathname;
    
    const renderFunc = routes[path];
    console.log(renderFunc);

    if (renderFunc) {
        renderFunc();
    } else {
        if (app) {
            app.innerHTML = '<h1>404 - Page Not Found</h1>';
        } else {
            app = tag('div', '', { 'class': 'con' });
            document.body.appendChild(app);
            app.innerHTML = '<h1>404 - Page Not Found</h1>';
        }
    }
}

function navigate(path) {
    window.history.pushState(null, null, path);
    renderRoute();
}

// Initial route render when the page loads
window.addEventListener('popstate', renderRoute);
window.addEventListener('DOMContentLoaded', renderRoute);

export { navigate, routes };
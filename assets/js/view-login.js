import { SetCookie } from "./cookie.js";
import { ProfileView } from "./view-profile.js";

export function LoginView(){
    const login = loginForm();

    const root = document.querySelector('#app');
    root.replaceChildren();    
    root.append(login);
}

function loginForm(){
    const loginContainer = document.createElement('div');
    loginContainer.className = 'login-container';

    const loginForm = document.createElement('form');

    const usernameLabel = document.createElement("label");
    usernameLabel.textContent = "Username or email:";
    usernameLabel.for = "usernameOrEmail";

    const usernameInput = document.createElement("input");
    usernameInput.type = "text";
    usernameInput.id = "usernameOrEmail";
    usernameInput.placeholder = "Username or email";
    usernameInput.required = true;
    usernameInput.minlength = 2;
    usernameInput.maxlength = 64;

    const passwordLabel = document.createElement("label");
    passwordLabel.textContent = "Password:";
    passwordLabel.for = "password";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password";
    passwordInput.placeholder = "Password";
    passwordInput.minlength = 7;
    passwordInput.maxlength = 64;
    passwordInput.required = true;

    const loginButton = document.createElement("button");
    loginButton.onclick = (e) => {
        e.preventDefault();
        login(usernameInput, passwordInput);
    }
    loginButton.innerText = "Login";

    loginForm.append(
        usernameLabel,
        usernameInput,
        passwordLabel,
        passwordInput,
        loginButton,
    );

    loginContainer.append(loginForm);

    return loginContainer;
}

function login(ident, password) {
    const credentials = ident.value + ":" + password.value
    const basicCredentials = btoa(credentials);

    fetch ('https://01.kood.tech/api/auth/signin', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicCredentials}`
        }
    }).then(response => {
        if (response.ok) {
            return response.json();
        }else{
            alert ("sigin in failed");
            location.reload();
            return Promise.reject("Sign-in failed"); // Exit early with rejection
        }
    }).then ((token) => {

        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 6 * 60 * 60 * 1000); // 6 hours in milliseconds

        SetCookie("token", token, expirationDate);

        ProfileView();

    }).catch((err) => {
        console.error(err);
    });
 
}
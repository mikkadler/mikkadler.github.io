import { LoginView } from "./view-login.js";
import { ProfileView } from "./view-profile.js";

function index() {
    const token = getCookieValue("token");

    if (!token) {
        LoginView();
    }else {
        ProfileView(token);
    }
}

function getCookieValue(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName + '=') === 0) {
                return cookie.substring(cookieName.length + 1);
            }
        }
    return null;
}

index();
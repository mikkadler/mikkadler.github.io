import { LoginView } from "./view-login.js";
import { ProfileView } from "./view-profile.js";
import { GetCookieValue } from "./cookie.js";

function index() {
    const token = GetCookieValue("token");

    if (!token) {
        LoginView();
    }else {
        ProfileView(token);
    }
}

index();
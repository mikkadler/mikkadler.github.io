export function SetCookie(name, value, expirationDate) {

    const expires = `expires=${expirationDate.toUTCString()}`;

    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

export function GetCookieValue(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
            if (cookie.indexOf(cookieName + '=') === 0) {
                return cookie.substring(cookieName.length + 1);
            }
        }
    return null;
}

export function DeleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax';
}
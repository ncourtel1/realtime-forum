import "../shared/title.js";
import "../shared/nav.js";
import "../shared/posts.js";
import "../shared/sign_in.js";

export default function Sign() {
    return `
        <c-title></c-title>
        <c-nav></c-nav>
        <c-sign-in></c-sign-in>
    `;
}
import navigateTo from "./main.js";

export default async function logUserOut() {
    const resp = await fetch(`/api/Logout`, { method: "POST" });
    if (!resp.ok) {
        console.log("haven't logged out!");
        return;
    } else {
        console.log("logged out");

        navigateTo("/login");
    }
}
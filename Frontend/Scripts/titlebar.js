const titlebar = document.getElementById("titlebar");

const devToolsBtn = document.getElementById("dev-tools-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const minimizeBtn = document.getElementById("minimize-btn");
const maximizeBtn = document.getElementById("maximize-btn");
const closeBtn = document.getElementById("close-btn");

window.addEventListener("keydown", (event) => {
    if(event.key.toLowerCase() === "r" && event.ctrlKey) {
        window.electronAPI.reload(0);
    }
});

devToolsBtn.addEventListener("click", () => {
    window.electronAPI.devtools(0);
});
fullscreenBtn.addEventListener("click", () => {
    window.electronAPI.fullscreen(0);
});
minimizeBtn.addEventListener("click", () => {
    window.electronAPI.minimize(0);
});
maximizeBtn.addEventListener("click", () => {
    window.electronAPI.maximize(0);
});
closeBtn.addEventListener("click", () => {
    window.electronAPI.close(0);
});
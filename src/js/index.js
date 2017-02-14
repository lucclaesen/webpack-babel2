import button from "./button";
var globalStyle = require("../style/globalStyle.css");

const app = document.getElementById("app");


app.innerHTML = `<div class="${globalStyle.bordered}">` + button.domElement + "</div>";
button.onClick((ev) => {
    console.log("I've been clicked");
});

if(module.hot) {
    module.hot.accept();
}
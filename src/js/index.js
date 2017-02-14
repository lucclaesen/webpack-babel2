import button from "./button";
var globalStyle = require("../style/globalStyle.css");

const app = document.getElementById("app");


app.innerHTML = button.domElement;
button.onClick((ev) => {
    console.log("I've been clicked");
});

if(module.hot) {
    module.hot.accept();
}
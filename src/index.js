import button from "./button";

const app = document.getElementById("app");


app.innerHTML = button.domElement;
button.onClick((ev) => {
    console.log("I've been clicked");
});

if(module.hot) {
    module.hot.accept();
}
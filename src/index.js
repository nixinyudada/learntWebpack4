import "./js/app.js"
import "./css/index.css"
import "./css/index.less"

document.body.innerHTML = "I am text!"

document.body.setAttribute("class","cssText");
document.body.innerHTML += "<b>123</b>"

if(module.hot){
    module.hot.accept();
}
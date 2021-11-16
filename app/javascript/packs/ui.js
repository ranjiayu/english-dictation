/**
 * @file ui.js
 * @description ui控制相关
 * @author ranjiayu
 */


function disableBtn(selector) {
  selector.setAttribute("aria-disabled", "true");
}

function enableBtn(selector) {
  selector.setAttribute("aria-disabled", "false");
}

module.exports = {
  disableBtn,
  enableBtn,
}
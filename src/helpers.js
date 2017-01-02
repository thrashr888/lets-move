
//
// HELPERS
//
var style = function (el, styles) {
  for (let i in styles) {
    if (Number.isInteger(styles[i])) {
      el.style[i] = styles[i] + 'px';
    } else {
      el.style[i] = styles[i];
    }
  }
}
var event = function (el, name, cb) {
  el.addEventListener(name, cb);
  return el;
}
var el = function (parentEl, className, innerHTML, styles, type='div') {
  var el = document.createElement(type);
  if (className) {
    el.className = className;
  }
  if (innerHTML) {
    el.innerHTML = innerHTML;
  }
  if (styles) {
    style(el, styles);
  }
  parentEl.appendChild(el);
  return el;
}
var div = function (parentEl, className, innerHTML, styles) {
  return el(parentEl, className, innerHTML, styles, 'div');
}
var span = function (parentEl, className, innerHTML, styles) {
  return el(parentEl, className, innerHTML, styles, 'span');
}
var br = function (parentEl) {
  return el(parentEl, null, null, null, 'br');
}

module.exports = {style, event, el, div, span, br};

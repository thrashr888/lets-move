
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
};

var event = function (el, name, cb) {
  el.addEventListener(name, cb);
  return el;
};

var el = function (parentEl, className=null, innerHTML=null, styles=null, type='div') {
  var el = document.createElement(type);
  if (className) {
    el.className = className;
  };

  if (innerHTML) {
    el.innerHTML = innerHTML;
  };

  if (styles) {
    style(el, styles);
  };

  parentEl.appendChild(el);
  return el;
};

var div = function (parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'div');
};

var span = function (parentEl, className=null, innerHTML=null, styles=null) {
  // console.log('span', arguments)
  return el(parentEl, className, innerHTML, styles, 'span');
};

var br = function (parentEl) {
  return el(parentEl, null, null, null, 'br');
};

var h1 = function (parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'h1');
};

var h2 = function (parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'h2');
};

var input = function (parentEl, className=null, placeholder=null, cb=null) {
  var el = document.createElement('input');
  if (className) {
    el.className = className;
  };

  if (placeholder) {
    el.placeholder = placeholder;
  };

  if (cb) {
    el.addEventListener(name, cb);
  };

  parentEl.appendChild(el);
  return el;
};

var getPosDistance = function (pos1, pos2) {
  let xs = 0;
  let ys = 0;

  xs = pos2[0] - pos1[0];
  xs *= xs;

  ys = pos2[1] - pos1[1];
  ys *= ys;

  return Math.sqrt(xs + ys);
};

var pickRandomMove = function (pos) {
  let out = [pos[0], pos[1]];
  switch (Math.floor(Math.random() * 4)) {
    case 0:
      out[0]++;
      break;
    case 1:
      out[0]--;
      break;
    case 2:
      out[1]++;
      break;
    case 3:
      out[1]--;
      break;
    default:
      break;
  }
  return out;
}

module.exports = { style, event, el, div, span, br, h1, h2, input, getPosDistance, pickRandomMove };

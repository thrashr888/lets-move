
//
// HELPERS
//
function style(el, styles) {
  for (let i in styles) {
    if (Number.isInteger(styles[i])) {
      el.style[i] = styles[i] + 'px';
    } else {
      el.style[i] = styles[i];
    }
  }
};

function event(el, name, cb) {
  el.addEventListener(name, cb);
  return el;
};

function el(parentEl, className=null, innerHTML=null, styles=null, type='div') {
  let el = document.createElement(type);
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

function div(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'div');
};

function span(parentEl, className=null, innerHTML=null, styles=null) {
  // console.log('span', arguments)
  return el(parentEl, className, innerHTML, styles, 'span');
};

function br(parentEl) {
  return el(parentEl, null, null, null, 'br');
};

function h1(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'h1');
};

function h2(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'h2');
};

function input(parentEl, className=null, placeholder=null, cb=null) {
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

function getPosDistance(pos1, pos2) {
  let xs = 0;
  let ys = 0;

  xs = pos2[0] - pos1[0];
  xs *= xs;

  ys = pos2[1] - pos1[1];
  ys *= ys;

  return Math.sqrt(xs + ys);
};

function pickRandomMove(pos) {
  let out = [pos[0], pos[1]];
  switch (getRandomInt(0, 3)) {
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
};

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

//
// Pseudo-Random number generator that follows a Normal or Log-Normal distribution.
// https://gist.github.com/bluesmoon/7925696

// Generate random numbers that follow a Normal distribution.
var spareRandom = null;
function normalRandom() {
  var val;
  var u;
  var v;
  var s;
  var mul;

  if (spareRandom !== null) {
    val = spareRandom;
    spareRandom = null;
  } else {
    do {
      u = Math.random() * 2 - 1;
      v = Math.random() * 2 - 1;

      s = u * u + v * v;
    } while (s === 0 || s >= 1);

    mul = Math.sqrt(-2 * Math.log(s) / s);
    val = u * mul;
    spareRandom = v * mul;
  };

  return val / 14; // 7 standard deviations on either side
}

// Generate random numbers that follow a Normal distribution but are clipped to fit within a range
function normalRandomInRange(min, max) {
  var val;
  do {
    val = normalRandom();
  } while (val < min || val > max);
  return val;
}

// Generate random numbers that follow a Normal
// distribution with a given mean and standard deviation
function normalRandomScaled(mean, stddev) {
  var r = normalRandomInRange(-1, 1);
  r = r * stddev + mean;
  return Math.round(r);
}

// Generate random numbers that follow a Log-normal distribution
// with a given geometric mean and geometric standard deviation
function lnRandomScaled(gmean, gstddev) {
  var r = normalRandomInRange(-1, 1);
  r = r * Math.log(gstddev) + Math.log(gmean);

  // console.log('lnRandomScaled', gmean, gstddev, r, Math.round(Math.exp(r)));
  return Math.round(Math.exp(r));
}

module.exports = {
  style, event, el, div, span, br, h1, h2, input,
  getPosDistance, pickRandomMove,
  getRandomArbitrary, getRandomInt,
  normalRandom, normalRandomInRange, normalRandomScaled, lnRandomScaled,
};

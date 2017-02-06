
//
// CONSTANTS
//
const WORLD_MAP_COLOR = '#8bc34a';
const UI_SPLASH_COLOR = '#363636';

function setSplashBg() {
  document.body.style.backgroundColor = UI_SPLASH_COLOR;
};

function setMapBg(world) {
  document.body.style.backgroundColor = world ? world.map.bgColor : WORLD_MAP_COLOR;
};

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

// set up an event on an element
function event(el, name, cb) {
  if (name && cb) {
    el.addEventListener(name, cb);
  };

  return el;
};

// create a new html element and insert it into the parent element
function el(parentEl, className='', innerHTML='', styles=[], type='div', attrs=[]) {
  let el = document.createElement(type);
  if (className) {
    el.className = className;
  };

  if (typeof innerHTML === 'function') {
    el.innerHTML = innerHTML(el);
  } else if (innerHTML) {
    el.innerHTML = innerHTML;
  };

  if (styles) {
    style(el, styles);
  };

  if (attrs) {
    for (let i in attrs) {
      if (el.hasAttribute(i)) {
        el.setAttribute(i, attrs[i]);
      }
    }
  }

  parentEl.appendChild(el);
  return el;
};

function muteButton(parentEl, world) {
  let el = event(
    span(parentEl, 'Button Mute', world.sounds.isMuted() ? '🔇' : '🔈'), 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      world.sounds.toggleMute();
      el.innerHTML = world.sounds.isMuted() ? '🔇' : '🔈';
    });
  return el;
}

function div(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'div');
};

function span(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'span');
};

function a(parentEl, href=null, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'a', {
    href: href,
  });
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

function h3(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'h3');
};

function ul(parentEl, className=null, innerHTML=null, styles=null) {
  return el(parentEl, className, innerHTML, styles, 'ul');
};

function input(parentEl, {
  type='text', className=null, autocomplete=null, autofocus=null, autocapitalize=null,
  name=null, placeholder=null, value=null, disabled=false, required=false,
}) {
  var el = document.createElement('input');
  if (type) {
    el.type = type;
  };

  if (className) {
    el.className = className;
  };

  if (name) {
    el.name = name;
  };

  if (autocomplete) {
    el.autocomplete = autocomplete;
  };

  if (autofocus) {
    el.autofocus = autofocus;
  };

  if (autocapitalize) {
    el.autocapitalize = autocapitalize;
  };

  if (placeholder) {
    el.placeholder = placeholder;
  };

  if (value) {
    el.value = value;
  };

  el.disabled = disabled;
  el.required = required;

  parentEl.appendChild(el);
  return el;
};

function scrollToPos(pos, world, cb=null) {
  let left = (pos[0] * world.chunkSize);
  let top = (pos[1] * world.chunkSize);

  let leftTo = left - (window.innerWidth / 2);
  let topTo = top - (window.innerHeight / 2);

  window.scrollTo(leftTo, topTo);
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
  let val;
  let u;
  let v;
  let s;
  let mul;

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
  let val;
  do {
    val = normalRandom();
  } while (val < min || val > max);
  return val;
}

// Generate random numbers that follow a Normal
// distribution with a given mean and standard deviation
function normalRandomScaled(mean, stddev) {
  let r = normalRandomInRange(-1, 1);
  r = r * stddev + mean;
  return Math.round(r);
}

// Generate random numbers that follow a Log-normal distribution
// with a given geometric mean and geometric standard deviation
function lnRandomScaled(gmean, gstddev) {
  let r = normalRandomInRange(-1, 1);
  r = r * Math.log(gstddev) + Math.log(gmean);

  // console.log('lnRandomScaled', gmean, gstddev, r, Math.round(Math.exp(r)));
  return Math.round(Math.exp(r));
}

module.exports = {
  setSplashBg, setMapBg,
  style, event, muteButton, el, div, span, a, br, h1, h2, h3, ul, input,
  scrollToPos, getPosDistance, pickRandomMove,
  getRandomArbitrary, getRandomInt,
  normalRandom, normalRandomInRange, normalRandomScaled, lnRandomScaled,
};

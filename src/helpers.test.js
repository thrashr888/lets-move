
import { style, el, event, getPosDistance, pickRandomMove } from './helpers';

describe('style', () => {
  it('should apply styles', () => {
    let e = {
      style: {},
    };
    let toStyle = {
      top: 5,
      display: 'inline-block',
    };
    style(e, toStyle);
    expect(e.style.top).toBe('5px');
    expect(e.style.display).toBe('inline-block');
  });
});

describe('el', () => {
  document.body.innerHTML =
    `<div>
      <span id="username" />
    </div>`;

  let e = el(document.body, 'Test', 'Test Content', { width: 5, display: 'inline-block' }, 'div');

  it('should create a div', () => {
    expect(e.innerHTML).toBe('Test Content');
    expect(e.className).toBe('Test');
    expect(e.nodeName).toBe('DIV');
  });

  it('apply styles', () => {
    expect(e.style.width).toBe('5px');
    expect(e.style.display).toBe('inline-block');
  });
});

describe('event', () => {
  document.body.innerHTML = `<div class="click-me"></div>`;

  it('should add event listener', () => {
    let callback = jest.fn();
    event(document.body, 'click', callback);
    document.body.click();
    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBeGreaterThan(0);
    document.body.click();
    document.body.click();
    expect(callback.mock.calls.length).toBeGreaterThan(2);
  });
});

describe('getPosDistance', () => {
  it('should calculate distance', () => {
    var dist = getPosDistance([0, 0], [1, 1]);
    expect(dist).toBe(1.4142135623730951);

    dist = getPosDistance([999, 999], [1, 1]);
    expect(dist).toBe(1411.385135248349);
  });
});

describe('pickRandomMove', () => {
  it('should return a different pos', () => {
    var pos = pickRandomMove([0, 0]);
    expect(pos).not.toBe([0, 0]);

    pos = pickRandomMove([1, 1]);
    expect(pos).not.toBe([1, 1]);
  });
});

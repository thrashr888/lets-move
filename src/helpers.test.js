
import { style, el, event } from './helpers';

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
    expect(e.parentElement).toBe(document.body);
  });

  it('apply styles', () => {
    expect(e.style.width).toBe('5px');
    expect(e.style.display).toBe('inline-block');
  });
});

describe('event', () => {
  document.body.innerHTML = `<div></div>`;

  it('should add event listener', () => {
    event(document.body, 'click', () => {
      console.log('test');
    });
    expect(document.body).toBe('5px');
  });
});

/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const newObj = JSON.parse(json);
  Object.setPrototypeOf(newObj, proto);
  return newObj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CSSBuilder {
  constructor() {
    this.stringifyArr = [];
    this.order = [];
    this.orderInfo = {
      element: 100000,
      id: 10000,
      class: 1000,
      attribute: 100,
      pseudoClass: 10,
      pseudoElement: 1,
    };
    this.elArr = [];
    this.idArr = [];
    this.clArr = [];
    this.attrArr = [];
    this.psClArr = [];
    this.psElArr = [];
  }

  element(value) {
    this.stringifyArr.push(value);
    this.elArr.push(value);
    this.checkMoreThanOnce(this.elArr);
    this.order.push(this.orderInfo.element);
    this.checkOrder(this.orderInfo.element);
    return this;
  }

  id(value) {
    this.stringifyArr.push(`#${value}`);
    this.idArr.push(`#${value}`);
    this.order.push(this.orderInfo.id);
    this.checkMoreThanOnce(this.idArr);
    this.checkOrder(this.orderInfo.id);
    return this;
  }

  class(value) {
    this.stringifyArr.push(`.${value}`);
    this.clArr.push(`.${value}`);
    this.order.push(this.orderInfo.class);
    this.checkOrder(this.orderInfo.class);
    return this;
  }

  attr(value) {
    this.stringifyArr.push(`[${value}]`);
    this.attrArr.push(`[${value}]`);
    this.order.push(this.orderInfo.attribute);
    this.checkOrder(this.orderInfo.attribute);
    return this;
  }

  pseudoClass(value) {
    this.stringifyArr.push(`:${value}`);
    this.psClArr.push(`:${value}`);
    this.order.push(this.orderInfo.pseudoClass);
    this.checkOrder(this.orderInfo.pseudoClass);
    return this;
  }

  pseudoElement(value) {
    this.stringifyArr.push(`::${value}`);
    this.psElArr.push(`::${value}`);
    this.order.push(this.orderInfo.pseudoElement);
    this.checkMoreThanOnce(this.psElArr);
    this.checkOrder(this.orderInfo.pseudoElement);
    return this;
  }

  stringify() {
    return this.stringifyArr.join('');
  }

  checkMoreThanOnce(obj) {
    if (obj.length > 1) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    return this;
  }

  checkOrder(selector) {
    if (this.order !== 0 && selector > this.order[this.order.length - 2]) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.stringifyArr.push(selector1.stringify());
    this.stringifyArr.push(` ${combinator} `);
    this.stringifyArr.push(selector2.stringify());
    return this;
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CSSBuilder().element(value);
  },

  id(value) {
    return new CSSBuilder().id(value);
  },

  class(value) {
    return new CSSBuilder().class(value);
  },

  attr(value) {
    return new CSSBuilder().attr(value);
  },

  pseudoClass(value) {
    return new CSSBuilder().pseudoClass(value);
  },

  pseudoElement(value) {
    return new CSSBuilder().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    return new CSSBuilder().combine(selector1, combinator, selector2);
  },

  stringify() {
    return new CSSBuilder().stringify();
  },

};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};

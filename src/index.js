import createTransparencySlider from './TransparencySlider.jsx';

// Some regular expressions for rgb() and hsl() Colors are borrowed from tinyColor
// https://github.com/bgrins/TinyColor

// https://www.w3.org/TR/css3-values/#integers
const CSS_INTEGER = `[-\\+]?\\d+%?`;
// http://www.w3.org/TR/css3-values/#number-value
const CSS_NUMBER = `[-\\+]?\\d*\\.\\d+%?`;
// Allow positive/negative integer/number. Don't capture the either/or, just the entire outcome
const CSS_UNIT = `(?:${CSS_INTEGER})|(?:${CSS_NUMBER})`;

// Parse function params
// Parens and commas are optional, and this also allows for whitespace between numbers
const PERMISSIVE_MATCH_4 = `[\\s|\\(]+(${ CSS_UNIT })[,|\\s]+(${ CSS_UNIT })[,|\\s]+(${ CSS_UNIT })[,|\\s]+(${ CSS_UNIT })\\s*\\)?`;

// Regex patterns for functional colors
const REGEX_FUNCTIONAL_RGBA = new RegExp(`rgba${PERMISSIVE_MATCH_4}`);
const REGEX_FUNCTIONAL_HSLA = new RegExp(`hsla${PERMISSIVE_MATCH_4}`);

const HEX_START = `^(?:#?|0x?)`;
const HEX_INT_SINGLE = `([0-9a-fA-F]{1})`;
const HEX_INT_DOUBLE = `([0-9a-fA-F]{2})`;
const REGEX_HEX_4 = new RegExp(`${ HEX_START }${ HEX_INT_SINGLE }${ HEX_INT_SINGLE }${ HEX_INT_SINGLE }${ HEX_INT_SINGLE }$`);
const REGEX_HEX_8 = new RegExp(`${ HEX_START }${ HEX_INT_DOUBLE }${ HEX_INT_DOUBLE }${ HEX_INT_DOUBLE }${ HEX_INT_DOUBLE }$`);

const TransparencyPlugin = function(iro, pluginOptions) {

  const TransparencySlider = createTransparencySlider(iro.ui, iro.util);
  const { parseHexInt, parseUnit, intToHex } = iro.util;

  iro.ColorPicker.addHook('init:after', function() {
    if (this.props.transparency) {
      this.layout.push({
        component: TransparencySlider,
        options: {}
      })
    }
  });

  // extend set method to work with alpha colors
  const set = iro.Color.prototype.set; 
  iro.Color.prototype.set = function(value) {
    const isString = typeof value === 'string';
    const isObject = typeof value === 'object';
    if ((isString) && (/^(?:#?|0x?)[0-9a-fA-F]{8}$/.test(value))) {
      this.hex8String = value;
    }
    else if ((isString) && (/^(?:#?|0x?)[0-9a-fA-F]{4}$/.test(value))) {
      let match;
      if (match = REGEX_HEX_4.exec(value)) {
        this.rgba = {
          r: parseHexInt(match[1]),
          g: parseHexInt(match[2]),
          b: parseHexInt(match[3]),
          a: parseHexInt(match[4]) / 255,
        }
      }
      else {
        throw new Error('invalid hex8 string');
      }
    }
    else if ((isString) && (/^rgba/.test(value))) {
      this.rgbaString = value;
    }
    else if ((isString) && (/^hsla/.test(value))) {
      this.hlsaString = value;
    }
    else if ((isObject) && ('r' in value) && ('g' in value) && ('b' in value) && ('a' in value)) {
      this.rgba = value;
    }
    else if ((isObject) && ('h' in value) && ('s' in value) && ('v' in value) && ('a' in value)) {
      this.hsva = value;
    }
    else if ((isObject) && ('h' in value) && ('s' in value) && ('l' in value) && ('a' in value)) {
      this.hsla = value;
    }
    else {
      set.call(this, value);
    }
  }

  // add extra properties to color class
  Object.defineProperties(iro.Color.prototype, {
    alpha: {
      get: function() {
        const hsv = this.hsv;
        return hsv.a;
      },
      set: function (value) {
        this.hsv = { ...this.hsv, a: value };
      }
    },
    hsva: {
      get: function() {
        return this.hsv;
      },
      set: function(value) {
        this.hsv = value;
      }
    },
    rgba: {
      get: function() {
        return { ...this.rgb, a: this.alpha };
      },
      set: function(value) {
        const { a, ...rgb } = value;
        this.rgb = rgb;
        this.alpha = a;
      }
    },
    hsla: {
      get: function() {
        return { ...this.hsl, a: this.alpha };
      },
      set: function(value) {
        const { a, ...hsl } = value;
        this.hsl = hsl;
        this.alpha = a;
      }
    },
    hex8String: {
      get: function() {
        const { r, g, b, a } = this.rgba;
        return `#${intToHex(r)}${intToHex(g)}${intToHex(b)}${intToHex(Math.floor(a * 255))}`
      },
      set: function(value) {
        let match;
        if (match = REGEX_HEX_8.exec(value)) {
          this.rgba = {
            r: parseHexInt(match[1]),
            g: parseHexInt(match[2]),
            b: parseHexInt(match[3]),
            a: parseHexInt(match[4]) / 255,
          }
        }
        else {
          throw new Error('invalid hex8 string');
        }
      }
    },
    rgbaString: {
      get: function() {
        let { r, g, b, a } = this.rgba;
        return `rgba(${r}, ${g}, ${b}, ${a})`
      },
      set: function(value) {
        let match;
        if (match = REGEX_FUNCTIONAL_RGBA.exec(value)) {
          console.log(match)
          this.rgba = {
            r: parseUnit(match[1], 255),
            g: parseUnit(match[2], 255),
            b: parseUnit(match[3], 255),
            a: parseUnit(match[4], 1)
          };
        }
        else {
          throw new Error('invalid rgba string');
        }
      }
    },
    hslaString: {
      get: function() {
        let { h, s, l, a } = this.hsla;
        return `hsla(${h}, ${s}%, ${l}%, ${a})`
      },
      set: function(value) {
        let match;
        if (match = REGEX_FUNCTIONAL_HSLA.exec(value)) {
          this.hsla = {
            h: parseUnit(match[1], 360),
            s: parseUnit(match[2], 100),
            l: parseUnit(match[3], 100),
            a: parseUnit(match[4], 1)
          };
        }
        else {
          throw new Error('invalid hsla string');
        }
      }
    },
  });

  iro.ui.TransparencySlider = TransparencySlider;

  iro.transparencyPlugin = {
    version: VERSION
  };

}

export default TransparencyPlugin;
import createTransparencySlider from './TransparencySlider.jsx';

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
    const isObject = typeof value === 'object';
    if ((isObject) && ('r' in value) && ('g' in value) && ('b' in value) && ('a' in value)) {
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
    hsva: {
      get: function() { 
        const value = this._value;
        return {h: value.h, s: value.s, v: value.v, a: value.a};
      },
      set: function(value) {
        this.hsv = value;
      }
    },
    alpha: {
      get: function() {
        const { a } = this._value;
        return a;
      },
      set: function (value) {
        this.hsv = { ...this.hsv, a: value };
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
        this.hexString = value;
      }
    },
    rgbaString: {
      get: function() {
        let { r, g, b, a } = this.rgba;
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`
      },
      set: function(value) {
        this.rgbString = value;
      }
    },
    hslaString: {
      get: function() {
        let { h, s, l, a } = this.hsla;
        return `hsla(${h}, ${s}%, ${l}%, ${a.toFixed(2)})`
      },
      set: function(value) {
        this.hslString = value;
      }
    },
  });

  iro.ui.TransparencySlider = TransparencySlider;

  iro.transparencyPlugin = {
    version: VERSION
  };

}

export default TransparencyPlugin;
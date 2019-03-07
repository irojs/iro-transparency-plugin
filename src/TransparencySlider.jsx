export default function({ h, Slider, Handle }, { resolveUrl }) {

  class IroTransparencySlider extends Slider {

    render(props) {
      let { width, sliderHeight, borderWidth, handleRadius } = props;
      sliderHeight = sliderHeight ? sliderHeight : props.padding * 2 + handleRadius * 2 + borderWidth * 2;
      this.width = width;
      this.height = sliderHeight;
      const cornerRadius = sliderHeight / 2;
      const range = width - cornerRadius * 2
      const hslString = props.color.hslString;
      const alpha = props.color.hsv.a;

      return (
        <svg 
          class="iro__slider iro__slider--transparency"
          width={ width }
          height={ sliderHeight }
          style= {{
            marginTop: props.sliderMargin,
            overflow: 'visible',
            display: 'block'
          }}
        >
          <defs>
            <linearGradient id={ `gradient_${this.uid}` }>
              <stop offset="0%" stop-color={ hslString } stop-opacity="0"/>
              <stop offset="100%" stop-color={ hslString } stop-opacity="1"/>
            </linearGradient>
            <pattern id={ `grid_${this.uid}` } width="8" height="8" patternUnits="userSpaceOnUse">
              <rect 
                class="iro__slider__grid"
                x="0"
                y="0" 
                width="4"
                height="4"
                fill="#fff"
              />
              <rect 
                class="iro__slider__grid iro__slider__grid--alt"
                x="4"
                y="0" 
                width="4"
                height="4"
                fill="#ccc"
              />
              <rect 
                class="iro__slider__grid"
                x="4"
                y="4" 
                width="4"
                height="4"
                fill="#fff"
              />
              <rect 
                class="iro__slider__grid iro__slider__grid--alt"
                x="0"
                y="4" 
                width="4"
                height="4"
                fill="#ccc"
              />
            </pattern>
            <pattern id={ `fill_${this.uid}` } width="100%" height="100%">
              <rect x="0" y="0" width="100%" height="100%" fill={`url(${resolveUrl( '#grid_' + this.uid )})`}></rect>
              <rect x="0" y="0" width="100%" height="100%" fill={`url(${resolveUrl( '#gradient_' + this.uid )})`}></rect>
            </pattern>
          </defs>
          <rect 
            class="iro__slider__value"
            rx={ cornerRadius } 
            ry={ cornerRadius } 
            x={ borderWidth / 2 } 
            y={ borderWidth / 2 } 
            width={ width - borderWidth } 
            height={ sliderHeight - borderWidth }
            stroke-width={ borderWidth }
            stroke={ props.borderColor }
            fill={ `url(${resolveUrl( '#fill_' + this.uid )})` }
          />
          <Handle
            r={ handleRadius }
            url={ props.handleSvg }
            origin={ props.handleOrigin }
            x={ cornerRadius + alpha  * range }
            y={ sliderHeight / 2 }
          />
        </svg>
      );
    }

    handleInput(x, y, bounds, type) {
      this.props.onInput(type, {
        a: this.getValueFromPoint(x, y, bounds) / 100
      });
    }

  }

  return IroTransparencySlider;

}
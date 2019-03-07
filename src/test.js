import iro from '@jaames/iro';
import iroTransparencyPlugin from './index';

iro.use(iroTransparencyPlugin);

var colorPicker = new iro.ColorPicker(document.body, {
  color: '#ff00ff55',
  transparency: true
});

window.colorPicker = colorPicker;
window.iro = iro;
export default iro;
import { Color } from '../math/Color.js';


function Fog(color, near, far) {
  this.name = '';

  this.color = new Color(color);

  this.near = (near !== undefined) ? near : 1.0;
  this.far = (far !== undefined) ? far : 1000.0;
}

Fog.prototype.isFog = true;

Fog.prototype.clone = function () {
  return new Fog(this.color.getHex(), this.near, this.far);
};


export { Fog };

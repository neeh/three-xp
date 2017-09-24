import { SceneNode } from '../core/SceneNode';
import { Material } from '../core/Material';
import { BufferGeometry } from '../core/BufferGeometry';
import { TrianglesDrawMode } from '../constants';


function Mesh(geometry, material) {
  SceneNode.call(this);

  this.type = 'Mesh';

  this.geometry = geometry !== undefined ? geometry : new BufferGeometry();
  this.material = material !== undefined ? material : new Material();

  this.drawMode = TrianglesDrawMode;
}

Mesh.prototype = Object.assign(Object.create(SceneNode.prototype), {

  constructor: Mesh,

  isMesh: true,

  setDrawMode: function (value) {
    this.drawMode = value;
  },

  copy: function (source) {
    SceneNode.prototype.copy.call(this, source);
    this.drawMode = source.drawMode;
    return this;
  },

  clone: function () {
    return new this.constructor(this.geometry, this.material).copy(this);
  }

});


export { Mesh };

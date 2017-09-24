import { SceneNode } from './SceneNode';


function Scene() {
  SceneNode.call(this);

  this.type = 'Scene';

  this.spatialGraph = null;
  this.renderGraph = null;
  this.fog = null;

  this.autoUpdate = true;
}

Scene.prototype = Object.assign(Object.create(SceneNode.prototype), {

  constructor: Scene,

  copy: function (source, recursive) {
    SceneNode.prototype.copy.call(this, source, recursive);

    if (source.fog !== null) this.fog = source.fog.clone();

    this.autoUpdate = source.autoUpdate;
    this.matrixAutoUpdate = source.matrixAutoUpdate;

    return this;
  }

});


export { Scene };

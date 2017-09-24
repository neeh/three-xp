import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Euler } from '../math/Euler';
import { Matrix4 } from '../math/Matrix4';
import { Matrix3 } from '../math/Matrix3';
import { _Math } from '../math/Math';


var sceneNodeId = 0;

function SceneNode() {
  this.id = sceneNodeId++;
  // Problem: Mesh id can override SceneNode id.
  // -> object.id cannot be used as global identifier

  // TODO: Remove uuid when possible.
  // Still used in AnimationMixer.js, for memory management
  // in AnimationObjectGroup.js, for managing indices..
  // in PropertyBinding.js for finding nodes...
  this.uuid = _Math.generateUUID();

  this.name = ''; // this one is used very often

  this.parent = null;
  this.children = [];

  this.up = SceneNode.DefaultUp.clone(); // Only used for lookAt()

  var position = new Vector3();
  var rotation = new Euler();
  var quaternion = new Quaternion(); // The quaternion is used for Bones
  var scale = new Vector3(1.0, 1.0, 1.0);

  function onRotationChange() {
    quaternion.setFromEuler(rotation, false);
  }

  function onQuaternionChange() {
    rotation.setFromQuaternion(quaternion, undefined, false);
  }

  rotation.onChange(onRotationChange);
  quaternion.onChange(onQuaternionChange);

  Object.defineProperties(this, {
    position: {
      enumerable: true,
      value: position
    },
    rotation: {
      enumerable: true,
      value: rotation
    },
    quaternion: {
      enumerable: true,
      value: quaternion
    },
    scale: {
      enumerable: true,
      value: scale
    },
    modelViewMatrix: {
      value: new Matrix4() // TODO: Improvement possible?
    },
    normalMatrix: {
      value: new Matrix3() // TODO: Improvement possible?
    }
  });

  this.matrix = new Matrix4();
  this.matrixWorld = new Matrix4();

  this.matrixAutoUpdate = SceneNode.DefaultMatrixAutoUpdate;
  this.matrixWorldNeedsUpdate = false;

  this.visible = true;

  this.renderOrder = 0; // TODO: Remove this

  // Static Nodes: fixed modelViewMatrix/normalMatrix?
  this.static = false;
}

SceneNode.DefaultUp = new Vector3(0.0, 1.0, 0.0);
SceneNode.DefaultMatrixAutoUpdate = true;

SceneNode.prototype = {

  constructor: SceneNode,

  isSceneNode: true,

  lookAt: (function () { // TODO: Do something with this
    // This routine does not support objects with rotated and/or translated parent(s)
    var m1 = new Matrix4();

    return function (vector) {
      if (this.isCamera) {
        m1.lookAt(this.position, vector, this.up);
      } else {
        m1.lookAt(vector, this.position, this.up);
      }
      this.quaternion.setFromRotationMatrix(m1);
    };
  })(),

  add: function (node) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.add(arguments[i]);
      }
      return this;
    }

    if (node === this) {
      console.error("THREE.SceneNode.add: object can't be added as a child of itself.", node);
      return this;
    }

    if (node && node.isSceneNode) {
      if (node.parent !== null) {
        node.parent.remove(node);
      }

      node.parent = this;
      // node.dispatchEvent({ type: 'added' });

      this.children.push(node);
    } else {
      console.error("THREE.SceneNode.add: object not an instance of THREE.SceneNode.", object);
    }

    return this;
  },

  remove: function (node) {
    if (arguments.length > 1) {
      for (var i = 0; i < arguments.length; i++) {
        this.remove(arguments[i]);
      }
    }

    var index = this.children.indexOf(node);
    if (index > -1) {
      node.parent = null;
      // node.dispatchEvent({ type: 'removed' });
      this.children.splice(index, 1);
    }
  },

  getWorldPosition: function (result) {
    this.updateMatrixWorld(true); // TODO: only when dirty
    return result.setFromMatrixPosition(this.matrixWorld);
  },

  getWorldQuaternion: function () {
    var position = new Vector3();
    var scale = new Vector3();

    return function (result) {
      this.updateMatrixWorld(true); // TODO: only when dirty
      this.matrixWorld.decompose(position, result, scale);
      return result;
    };
  }(),

  getWorldRotation: function () {
    var quaternion = new Quaternion();

    return function (result) {
      this.getWorldQuaternion(quaternion);
      return result.setFromQuaternion(quaternion, this.rotation.order, false);
    };
  }(),

  getWorldScale: function () {
    var position = new Vector3();
    var quaternion = new Quaternion();

    return function (result) {
      this.updateMatrixWorld(true);
      this.matrixWorld.decompose(position, quaternion, result);
      return result;
    };
  }(),

  getWorldDirection: function () {
    var quaternion = new Quaternion();

    return function (result) {
      this.getWorldQuaternion(quaternion);
      return result.set(0.0, 0.0, 1.0).applyQuaternion(quaternion);
    };
  }(),

  raycast: function () {},

  updateMatrix: function () {
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.matrixWorldNeedsUpdate = true;
  },

  updateMatrixWorld: function (force) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.matrixWorldNeedsUpdate || force) {
      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }
      this.matrixWorldNeedsUpdate = false;
      force = true;
    }

    // update children
    for (var i = 0, il = this.children.length; i < il; i++) {
      this.children[i].updateMatrixWorld(force);
    }
  },

  clone: function (recursive) {
    return new this.constructor().copy(this, recursive);
  },

  copy: function (source, recursive) {
    if (recursive === undefined) recursive = true;

    this.name = source.name;

    this.up.copy(source.up);

    this.position.copy(source.position);
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);

    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.visible = source.visible;

    if (recursive === true) {
      for (var i = 0; i < source.children.length; i++) {
        var child = source.children[i];
        this.add(child.clone());
      }
    }

    return this;
  }

};


export { SceneNode };

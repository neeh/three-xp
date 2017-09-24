import { _Math } from './Math';
import { Matrix4 } from './Matrix4';
import { Quaternion } from './Quaternion';


function Vector3(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
}

Object.assign(Vector3.prototype, {

  isVector3: true,

  set: function (x, y, z) { // USED a lot
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  },

  setScalar: function (scalar) { // UNUSED
    this.x = scalar;
    this.y = scalar;
    this.z = scalar;

    return this;
  },

  setX: function (x) { // UNUSED
    this.x = x;

    return this;
  },

  setY: function (y) { // UNUSED
    this.y = y;

    return this;
  },

  setZ: function (z) { // UNUSED
    this.z = z;

    return this;
  },

  setComponent: function (index, value) { // UNUSED
    switch (index) {
      case 0: this.x = value; break;
      case 1: this.y = value; break;
      case 2: this.z = value; break;
      default: throw new Error('index is out of range: ' + index);
    }

    return this;
  },

  getComponent: function (index) { // UNUSED
    switch (index) {
      case 0: return this.x;
      case 1: return this.y;
      case 2: return this.z;
      default: throw new Error('index is out of range: ' + index);
    }
  },

  clone: function () { // USED a lot
    return new this.constructor(this.x, this.y, this.z);
  },

  copy: function (v) { // USED a lot
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  },

  add: function (v) { // USED a lot
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  },

  addScalar: function (s) { // USED 2 times in Box3
    this.x += s;
    this.y += s;
    this.z += s;

    return this;
  },

  addVectors: function (a, b) { // USED 1 time in Box3, 1 time in Line3, 1 time in Triangle
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  },

  addScaledVector: function (v, s) { // UNUSED
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  },

  sub: function (v, w) { // USED a lot
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  },

  subScalar: function (s) { // UNUSED
    this.x -= s;
    this.y -= s;
    this.z -= s;

    return this;
  },

  subVectors: function (a, b) { // USED a lot
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  },

  multiply: function (v, w) { // UNUSED
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  },

  multiplyScalar: function (scalar) { // USED a lot
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;

    return this;
  },

  multiplyVectors: function (a, b) { // UNUSED
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;

    return this;
  },

  applyEuler: function () { // UNUSED
    var quaternion = new Quaternion();

    return function applyEuler(euler) {
      quaternion.setFromEuler(euler);
      return this.applyQuaternion(quaternion);
    };
  }(),

  applyAxisAngle: function () { // UNUSED
    var quaternion = new Quaternion();

    return function applyAxisAngle(axis, angle) {
      quaternion.setFromAxisAngle(axis, angle);
      return this.applyQuaternion(quaternion);
    };
  }(),

  applyMatrix3: function (m) { // USED 1 time in Matrix3, 1 time in Plane
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  },

  applyMatrix4: function (m) { // USED a lot
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;

    this.x = e[ 0] * x + e[ 4] * y + e[ 8] * z + e[12];
    this.y = e[ 1] * x + e[ 5] * y + e[ 9] * z + e[13];
    this.z = e[ 2] * x + e[ 6] * y + e[10] * z + e[14];
    var w =  e[ 3] * x + e[ 7] * y + e[11] * z + e[15];

    return this.divideScalar(w);
  },

  applyQuaternion: function (q) { // USED 2 times in Vector3, 1 time in SceneNode, 1 time in Camera, 1 time in AudioListener, 2 times in OrbitControls
    var x = this.x, y = this.y, z = this.z;
    var qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // calculate quat * vector
    var ix =   qw * x + qy * z - qz * y;
    var iy =   qw * y + qz * x - qx * z;
    var iz =   qw * z + qx * y - qy * x;
    var iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

    return this;
  },

  project: function () { // UNUSED
    var matrix = new Matrix4();

    return function project(camera) {
      matrix.getInverse(camera.matrixWorld);
      matrix.multiplyMatrices(camera.projectionMatrix, matrix);
      return this.applyMatrix4(matrix);
    };
  }(),

  unproject: function () { // USED 2 times in Raycaster
    var matrix = new Matrix4();

    return function unproject(camera) {
      matrix.getInverse(camera.projectionMatrix);
      matrix.multiplyMatrices(camera.matrixWorld, matrix);
      return this.applyMatrix4(matrix);
    };
  }(),

  transformDirection: function (m) { // USED 3 times in WebGLRenderer, 1 time in Raycaster
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;

    this.x = e[ 0] * x + e[ 4] * y + e[ 8] * z;
    this.y = e[ 1] * x + e[ 5] * y + e[ 9] * z;
    this.z = e[ 2] * x + e[ 6] * y + e[10] * z;

    return this.normalize();
  },

  divide: function (v) { // UNUSED
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  },

  divideScalar: function (scalar) { // USED 2 times in Vector3
    return this.multiplyScalar(1.0 / scalar);
  },

  min: function (v) { // USED 3 times in Box3
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  },

  max: function (v) { // USED 3 times in Box3
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  },

  clamp: function (min, max) { // USED 1 time in Vector3, 2 times in Box3
    // This function assumes min < max, if this assumption isn't true it will not operate correctly
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));

    return this;
  },

  clampScalar: function () { // UNUSED
    var min = new Vector3();
    var max = new Vector3();

    return function clampScalar(minVal, maxVal) {
      min.set(minVal, minVal, minVal);
      max.set(maxVal, maxVal, maxVal);

      return this.clamp(min, max);
    };
  }(),

  clampLength: function (min, max) { // UNUSED
    var length = this.length();
    return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
  },

  floor: function () { // UNUSED
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);

    return this;
  },

  ceil: function () { // UNUSED
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);

    return this;
  },

  round: function () { // UNUSED
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);

    return this;
  },

  roundToZero: function () { // UNUSED
    this.x = (this.x < 0.0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0.0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0.0) ? Math.ceil(this.z) : Math.floor(this.z);

    return this;
  },

  negate: function () { // USED 1 time in BufferGeometry, 2 times in Plane
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  },

  dot: function (v) { // USED a lot
    return this.x * v.x + this.y * v.y + this.z * v.z;
  },

  lengthSq: function () { // USED 3 times in Vector3, 2 times in Matrix4, 1 time in Ray, 1 time in Triangle
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },

  length: function () { // USED a lot
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },

  lengthManhattan: function () { // UNUSED
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  },

  normalize: function () { // USED a lot
    return this.divideScalar(this.length());
  },

  setLength: function (length) { // UNUSED
    return this.multiplyScalar(length / this.length());
  },

  lerp: function (v, alpha) { // UNUSED
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  },

  lerpVectors: function (v1, v2, alpha) { // UNUSED
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  },

  cross: function (v) { // USED 2 times in BufferGeometry, 1 time in Plane, 1 time in Ray, 1 time in Triangle
    var x = this.x, y = this.y, z = this.z;

    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;

    return this;
  },

  crossVectors: function (a, b) { // USED 1 time in Vector3, 3 times in Matrix4, 1 time in Quaternion, 2 times in Ray
    var ax = a.x, ay = a.y, az = a.z;
    var bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  },

  projectOnVector: function (vector) { // USED 1 time in Vector3
    var scalar = vector.dot(this) / vector.lengthSq();
    return this.copy(vector).multiplyScalar(scalar);
  },

  projectOnPlane: function () { // UNUSED
    var v1 = new Vector3();

    return function projectOnPlane(planeNormal) {
      v1.copy(this).projectOnVector(planeNormal);
      return this.sub(v1);
    };
  }(),

  reflect: function () { // UNUSED
    // reflect incident vector off plane orthogonal to normal
    // normal is assumed to have unit length
    var v1 = new Vector3();

    return function reflect(normal) {
      return this.sub(v1.copy(normal).multiplyScalar(2.0 * this.dot(normal)));
    };
  }(),

  angleTo: function (v) { // UNUSED
    var theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));

    // clamp, to handle numerical problems
    return Math.acos(_Math.clamp(theta, -1.0, 1.0));
  },

  distanceTo: function (v) { // USED a lot
    return Math.sqrt(this.distanceToSquared(v));
  },

  distanceToSquared: function (v) { // USED a lot
    var dx = this.x - v.x;
    var dy = this.y - v.y;
    var dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  },

  distanceToManhattan: function (v) { // UNUSED
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);
  },

  setFromSpherical: function (s) { // USED 1 time in OrbitControls
    var sinPhiRadius = Math.sin(s.phi) * s.radius;

    this.x = sinPhiRadius * Math.sin(s.theta);
    this.y = Math.cos(s.phi) * s.radius;
    this.z = sinPhiRadius * Math.cos(s.theta);

    return this;
  },

  setFromCylindrical: function (c) { // UNUSED
    this.x = c.radius * Math.sin(c.theta);
    this.y = c.y;
    this.z = c.radius * Math.cos(c.theta);

    return this;
  },

  setFromMatrixPosition: function (m) { // USED a lot
    return this.setFromMatrixColumn(m, 3);
  },

  setFromMatrixScale: function (m) { // USED 1 time in Sprite
    var sx = this.setFromMatrixColumn(m, 0).length();
    var sy = this.setFromMatrixColumn(m, 1).length();
    var sz = this.setFromMatrixColumn(m, 2).length();

    this.x = sx;
    this.y = sy;
    this.z = sz;

    return this;
  },

  setFromMatrixColumn: function (m, index) { // USED 4 times in Vector3, 6 times in Matrix4, 2 times in OrbitControls
    return this.fromArray(m.elements, index * 4);
  },

  equals: function (v) { // USED a lot
    return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));
  },

  fromArray: function (array, offset) { // USED a lot
    if (offset === undefined) offset = 0;

    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  },

  toArray: function (array, offset) { // USED 2 times in WebGLUniforms, 1 time in PropertyBinding, 1 time in AnimationUtils
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;

    array[offset    ] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;

    return array;
  },

  fromBufferAttribute: function (attribute, index, offset) { // USED 3 times in Mesh (raycast), 1 time in Box3
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);

    return this;
  }

});


export { Vector3 };

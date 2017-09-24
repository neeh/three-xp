
class CMatrix4 extends Float32Array {

  constructor() {
    super(CMatrix4.IDENT);
  }

  // TODO: TEST over set()
  elements(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
    this[ 0] = n11; this[ 4] = n12; this[ 8] = n13; this[12] = n14;
    this[ 1] = n21; this[ 5] = n22; this[ 9] = n23; this[13] = n24;
    this[ 2] = n31; this[ 6] = n32; this[10] = n33; this[14] = n34;
    this[ 3] = n41; this[ 7] = n42; this[11] = n43; this[15] = n44;

    return this;
  }

  // TODO: TEST over ident()
  identity() {
    this.element(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    );

    return this;
  }

  // TODO: TEST over identity()
  ident() {
    this.set(CMatrix4.IDENT);
    return this;
  }

  clone() {
    return new Matrix4().set(this);
  }

  // TODO: TEST over set()
  copy(m) {
    this[ 0] = m[ 0]; this[ 1] = m[ 1]; this[ 2] = m[ 2]; this[ 3] = m[ 3];
    this[ 4] = m[ 4]; this[ 5] = m[ 5]; this[ 6] = m[ 6]; this[ 7] = m[ 7];
    this[ 8] = m[ 8]; this[ 9] = m[ 9]; this[10] = m[10]; this[11] = m[11];
    this[12] = m[12]; this[13] = m[13]; this[14] = m[14]; this[15] = m[15];

    return this;
  }

  copyPosition(m) {
    this[12] = m[12];
    this[13] = m[13];
    this[14] = m[14];

    return this;
  }

  extractBasis(xAxis, yAxis, zAxis) {
    xAxis.setFromMatrixColumn(this, 0);
    yAxis.setFromMatrixColumn(this, 1);
    zAxis.setFromMatrixColumn(this, 2);

    return this;
  }

	makeBasis(xAxis, yAxis, zAxis) {
    this[ 0] = xAxis[0]; this[ 1] = yAxis[0]; this[ 2] = zAxis[0]; this[ 3] = 0.0;
    this[ 4] = xAxis[1]; this[ 5] = yAxis[1]; this[ 6] = zAxis[1]; this[ 7] = 0.0;
    this[ 8] = xAxis[2]; this[ 9] = yAxis[2]; this[10] = zAxis[2]; this[11] = 0.0;
    this[12] = 0.0;      this[13] = 0.0;      this[14] = 0.0;      this[15] = 1.0;

    return this;
  }

  multiply(m) {
    return this.multiplyMatrices(this, m);
  }

  premultiply(m) {
    return this.multiplyMatrices(m, this);
  }

  multiplyMatrices(a, b) {
    var a11 = a[ 0], a12 = a[ 4], a13 = a[ 8], a14 = a[12];
    var a21 = a[ 1], a22 = a[ 5], a23 = a[ 9], a24 = a[13];
    var a31 = a[ 2], a32 = a[ 6], a33 = a[10], a34 = a[14];
    var a41 = a[ 3], a42 = a[ 7], a43 = a[11], a44 = a[15];

    var b11 = b[ 0], b12 = b[ 4], b13 = b[ 8], b14 = b[12];
    var b21 = b[ 1], b22 = b[ 5], b23 = b[ 9], b24 = b[13];
    var b31 = b[ 2], b32 = b[ 6], b33 = b[10], b34 = b[14];
    var b41 = b[ 3], b42 = b[ 7], b43 = b[11], b44 = b[15];

    this[ 0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    this[ 4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    this[ 8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    this[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    this[ 1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    this[ 5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    this[ 9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    this[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    this[ 2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    this[ 6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    this[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    this[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    this[ 3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    this[ 7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    this[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    this[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  multiplyMatrices_(A, B) {
    var a = A[ 0], b = A[ 1], c = A[ 2], d = A[ 3];
    var e = A[ 4], f = A[ 5], g = A[ 6], h = A[ 7];
    var i = A[ 8], j = A[ 9], k = A[10], l = A[11];
    var m = A[12], n = A[13], o = A[14], p = A[15];

    var q = B[ 0], r = B[ 1], s = B[ 2], t = B[ 3];

    this[ 0] = a * q + e * r + i * s + m * t;
    this[ 1] = b * q + f * r + j * s + n * t;
    this[ 2] = c * q + g * r + k * s + o * t;
    this[ 3] = d * q + h * r + l * s + p * t;

    q = B[ 4]; r = B[ 5]; s = B[ 6]; t = B[ 7];

    this[ 4] = a * q + e * r + i * s + m * t;
    this[ 5] = b * q + f * r + j * s + n * t;
    this[ 6] = c * q + g * r + k * s + o * t;
    this[ 7] = d * q + h * r + l * s + p * t;

    q = B[ 8]; r = B[ 9]; s = B[10]; t = B[11];

    this[ 8] = a * q + e * r + i * s + m * t;
    this[ 9] = b * q + f * r + j * s + n * t;
    this[10] = c * q + g * r + k * s + o * t;
    this[11] = d * q + h * r + l * s + p * t;

    q = B[12]; r = B[13]; s = B[14]; t = B[15];

    this[12] = a * q + e * r + i * s + m * t;
    this[13] = b * q + f * r + j * s + n * t;
    this[14] = c * q + g * r + k * s + o * t;
    this[15] = d * q + h * r + l * s + p * t;
  }

  multiplyScalar(s) {
    this[ 0] *= s; this[ 4] *= s; this[ 8] *= s; this[12] *= s;
    this[ 1] *= s; this[ 5] *= s; this[ 9] *= s; this[13] *= s;
    this[ 2] *= s; this[ 6] *= s; this[10] *= s; this[14] *= s;
    this[ 3] *= s; this[ 7] *= s; this[11] *= s; this[15] *= s;

    return this;
  }

  transpose() {
    var tmp;

    tmp = this[ 1]; this[ 1] = this[ 4]; this[ 4] = tmp;
    tmp = this[ 2]; this[ 2] = this[ 8]; this[ 8] = tmp;
    tmp = this[ 6]; this[ 6] = this[ 9]; this[ 9] = tmp;

    tmp = this[ 3]; this[ 3] = this[12]; this[12] = tmp;
    tmp = this[ 7]; this[ 7] = this[13]; this[13] = tmp;
    tmp = this[11]; this[11] = this[14]; this[14] = tmp;

    return this;
  }

};
CMatrix4.prototype.isMatrix4 = true;
CMatrix4.NULL = new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
CMatrix4.IDENT = new Float32Array([1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0]);

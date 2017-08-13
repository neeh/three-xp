
'use strict';

/* Copyright (c) 2013, Nicolas Gougeon. All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

  * Redistributions of source code must retain the above copyright notice, this
    list of conditions and the following disclaimer.
  * Redistributions in binary form must reproduce the above copyright notice,
    this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */


/** @temp */
var Matrix4 = {};

/**
 * Creates a 4x4 matrix from components.
 * @param {Number} a-p The matrix components.
 * @return {Number[16]} A 4x4 matrix.
 */
function Mtx4(a, b, c, d,
              e, f, g, h,
              i, j, k, l,
              m, n, o, p) {
    var m4 = new Float32Array(16);

    m4[ 0] = a; m4[ 1] = b; m4[ 2] = c; m4[ 3] = d;
    m4[ 4] = e; m4[ 5] = f; m4[ 6] = g; m4[ 7] = h;
    m4[ 8] = i; m4[ 9] = j; m4[10] = k; m4[11] = l;
    m4[12] = m; m4[13] = n; m4[14] = o; m4[15] = p;

    return m4;
}

/**
 * Creates a null 4x4 matrix.
 * @return {Number[16]} O_4
 */
function Mtx4Null() {
    return new Float32Array(16);
}

/**
 * Creates a identity 4x4 matrix.
 * @return {Number[16]} I_4
 */
function Mtx4Ident() {
    var m4 = new Float32Array(16);

    m4[ 0] = 1.0;
    m4[ 5] = 1.0;
    m4[10] = 1.0;
    m4[15] = 1.0;

    return m4;
}

/**
 * Resets the components of a 4x4 matrix to the identity.
 * @param {Number[16]} m4 The 4x4 matrix to reset.
 */
function Mtx4Reset(m4) {
    m4[ 0] = 1.0; m4[ 1] = 0.0; m4[ 2] = 0.0; m4[ 3] = 0.0;
    m4[ 4] = 0.0; m4[ 5] = 1.0; m4[ 6] = 0.0; m4[ 7] = 0.0;
    m4[ 8] = 0.0; m4[ 9] = 0.0; m4[10] = 1.0; m4[11] = 0.0;
    m4[12] = 0.0; m4[13] = 0.0; m4[14] = 0.0; m4[15] = 1.0;
}

/**
 * Copies the components of a 4x4 matrix.
 * @param {Number[16]} dest The destination 4x4 matrix.
 * @param {Number[16]} src The source 4x4 matrix.
 */
function Mtx4Cpy(dest, src) {
    dest[ 0] = src[ 0]; dest[ 1] = src[ 1]; dest[ 2] = src[ 2]; dest[ 3] = src[ 3];
    dest[ 4] = src[ 4]; dest[ 5] = src[ 5]; dest[ 6] = src[ 6]; dest[ 7] = src[ 7];
    dest[ 8] = src[ 8]; dest[ 9] = src[ 9]; dest[10] = src[10]; dest[11] = src[11];
    dest[12] = src[12]; dest[13] = src[13]; dest[14] = src[14]; dest[15] = src[15];
}

/**
 * Sets the rotation part of a 4x4 matrix from a quaternion.
 * @param {Number[16]} m4 The 4x4 matrix to modify.
 * @param {Number[4]} q The rotation quaternion.
 */
function Mtx4FromQuat(m4, q) {
    var w = q[0];
    var x = q[1];
    var y = q[2];
    var z = q[3];

    m4[ 0] = 1 - 2 * y * y - 2 * z * z;
    m4[ 1] = 2 * x * y + 2 * w * z;
    m4[ 2] = 2 * x * z - 2 * w * y;

    m4[ 4] = 2 * x * y - 2 * w * z;
    m4[ 5] = 1 - 2 * x * x - 2 * z * z;
    m4[ 6] = 2 * y * z + 2 * w * x;

    m4[ 8] = 2 * x * z + 2 * w * y;
    m4[ 9] = 2 * y * z - 2 * w * x;
    m4[10] = 1 - 2 * x * x - 2 * y * y;
}

/**
 * Sets the components of a 4x4 matrix from a 3x3 matrix.
 * @param {Number[16]} m4 The destination 4x4 matrix.
 * @param {Number[9]} m3 The source 3x3 matrix.
 */
function Mtx4FromMtx3(m4, m3) {
    m4[ 0] = m3[0]; m4[ 1] = m3[1]; m4[ 2] = m3[2]; m4[ 3] = 0.0;
    m4[ 4] = m3[3]; m4[ 5] = m3[4]; m4[ 6] = m3[5]; m4[ 7] = 0.0;
    m4[ 8] = m3[6]; m4[ 9] = m3[7]; m4[10] = m3[8]; m4[11] = 0.0;
    m4[12] = 0.0;   m4[13] = 0.0;   m4[14] = 0.0;   m4[15] = 1.0;
}

/**
 * Compares two matrices.
 * @param {Number[16]} A The first 4x4 matrix operand.
 * @param {Number[16]} B The second 4x4 matrix operand.
 * @return {Boolean} true if A = B.
 */
function Mtx4Cmp(A, B) {
    return A[ 0] === B[ 0] && A[ 1] === B[ 1] && A[ 2] === B[ 2] && A[ 3] === B[ 3] &&
           A[ 4] === B[ 4] && A[ 5] === B[ 5] && A[ 6] === B[ 6] && A[ 7] === B[ 7] &&
           A[ 8] === B[ 8] && A[ 9] === B[ 9] && A[10] === B[10] && A[11] === B[11] &&
           A[12] === B[12] && A[13] === B[13] && A[14] === B[14] && A[15] === B[15];
}

/**
 * Transposes a 4x4 matrix.
 * @param {Number[16]} m4 The 4x4 matrix to transpose.
 */
function Mtx4Transp(m4) {
    var
    $ = m4[ 1]; m4[ 1] = m4[ 4]; m4[ 4] = $;
    $ = m4[ 6]; m4[ 6] = m4[ 9]; m4[ 9] = $;
    $ = m4[11]; m4[11] = m4[14]; m4[14] = $;
    $ = m4[ 2]; m4[ 2] = m4[ 8]; m4[ 8] = $;
    $ = m4[ 7]; m4[ 7] = m4[13]; m4[13] = $;
    $ = m4[ 3]; m4[ 3] = m4[12]; m4[12] = $;
}

/**
 * Returns the trace of a 4x4 matrix.
 * @param {Number[16]} m4 The input 4x4 matrix.
 * @return {Number} The trace of the input matrix.
 */
function Mtx4Trace(m4) {
    return m4[ 0] + m4[ 5] + m4[10] + m4[15];
}

/**
 * Returns the determinant of a 4x4 matrix.
 * @param {Number[16]} m4 The input 4x4 matrix.
 * @return {Number} The determinant of the input matrix.
 */
function Mtx4Det(m4) {
    var a = m4[ 0], b = m4[ 1], c = m4[ 2], d = m4[ 3];
    var e = m4[ 4], f = m4[ 5], g = m4[ 6], h = m4[ 7];
    var i = m4[ 8], j = m4[ 9], k = m4[10], l = m4[11];
    var m = m4[12], n = m4[13], o = m4[14], p = m4[15];

    return (a * f - b * e) * (k * p - l * o)
         - (a * g - c * e) * (j * p - l * n)
         + (a * h - d * e) * (j * o - k * n)
         + (b * g - c * f) * (i * p - l * m)
         - (b * h - d * f) * (i * o - k * m)
         + (c * h - d * g) * (i * n - j * m);
}

/**
 * @todo
 */
function Mtx4Invert(m4) {
    ;
}

/**
 * Inverts a matrix.
 * @param {Number[16]} m4 The in-out matrix.
 */
Matrix4.invert = function ( m4 )
{
    var a = m4[ 0], b = m4[ 1], c = m4[ 2], d = m4[ 3],
        e = m4[ 4], f = m4[ 5], g = m4[ 6], h = m4[ 7],
        i = m4[ 8], j = m4[ 9], k = m4[10], l = m4[11],
        m = m4[12], n = m4[13], o = m4[14], p = m4[15],

        A = a * f - e * b,
        B = a * j - i * b,
        C = a * n - m * b,
        D = e * j - i * f,
        E = e * n - m * f,
        F = i * n - m * j,
        G = c * h - g * d,
        H = c * l - k * d,
        I = c * p - o * d,
        J = g * l - k * h,
        K = g * p - o * h,
        L = k * p - o * l,

        det = A * L - B * K + C * J + D * I - E * H + F * G;

        if ( Abs( det ) < EPSILON ) return;

        det = 1 / det;

    m4[ 0] = det * ( f * L - j * K + n * J );
    m4[ 1] = det * ( j * I - b * L - n * H );
    m4[ 2] = det * ( b * K - f * I + n * G );
    m4[ 3] = det * ( f * H - b * J - j * G );
    m4[ 4] = det * ( i * K - e * L - m * J );
    m4[ 5] = det * ( a * L - i * I + m * H );
    m4[ 6] = det * ( e * I - a * K - m * G );
    m4[ 7] = det * ( a * J - e * H + i * G );
    m4[ 8] = det * ( h * F - l * E + p * D );
    m4[ 9] = det * ( l * C - d * F - p * B );
    m4[10] = det * ( d * E - h * C + p * A );
    m4[11] = det * ( h * B - d * D - l * A );
    m4[12] = det * ( k * E - g * F - o * D );
    m4[13] = det * ( c * F - k * C + o * B );
    m4[14] = det * ( g * C - c * E - o * A );
    m4[15] = det * ( c * D - g * B + k * A );
};

/**
 * Concatenates two 4x4 matrices.
 * @param {Number[16]} out The output 4x4 matrix.
 * @param {Number[16]} A The LHS 4x4 matrix operand.
 * @param {Number[16]} B The RHS 4x4 matrix operand.
 *
 * Better performance for A, B = js arrays and out = Float32Array
 * memory friendly
 * dont use that for A, B = Float32Array, out = Float32Array
 */
function Mtx4Cat(out, A, B) {
    out[ 0] = A[ 0] * B[ 0] + A[ 4] * B[ 1] + A[ 8] * B[ 2] + A[12] * B[ 3];
    out[ 1] = A[ 1] * B[ 0] + A[ 5] * B[ 1] + A[ 9] * B[ 2] + A[13] * B[ 3];
    out[ 2] = A[ 2] * B[ 0] + A[ 6] * B[ 1] + A[10] * B[ 2] + A[14] * B[ 3];
    out[ 3] = A[ 3] * B[ 0] + A[ 7] * B[ 1] + A[11] * B[ 2] + A[15] * B[ 3];

    out[ 4] = A[ 0] * B[ 4] + A[ 4] * B[ 5] + A[ 8] * B[ 6] + A[12] * B[ 7];
    out[ 5] = A[ 1] * B[ 4] + A[ 5] * B[ 5] + A[ 9] * B[ 6] + A[13] * B[ 7];
    out[ 6] = A[ 2] * B[ 4] + A[ 6] * B[ 5] + A[10] * B[ 6] + A[14] * B[ 7];
    out[ 7] = A[ 3] * B[ 4] + A[ 7] * B[ 5] + A[11] * B[ 6] + A[15] * B[ 7];

    out[ 8] = A[ 0] * B[ 8] + A[ 4] * B[ 9] + A[ 8] * B[10] + A[12] * B[11];
    out[ 9] = A[ 1] * B[ 8] + A[ 5] * B[ 9] + A[ 9] * B[10] + A[13] * B[11];
    out[10] = A[ 2] * B[ 8] + A[ 6] * B[ 9] + A[10] * B[10] + A[14] * B[11];
    out[11] = A[ 3] * B[ 8] + A[ 7] * B[ 9] + A[11] * B[10] + A[15] * B[11];

    out[12] = A[ 0] * B[12] + A[ 4] * B[13] + A[ 8] * B[14] + A[12] * B[15];
    out[13] = A[ 1] * B[12] + A[ 5] * B[13] + A[ 9] * B[14] + A[13] * B[15];
    out[14] = A[ 2] * B[12] + A[ 6] * B[13] + A[10] * B[14] + A[14] * B[15];
    out[15] = A[ 3] * B[12] + A[ 7] * B[13] + A[11] * B[14] + A[15] * B[15];
}

/**
 * Concatenates two 4x4 matrices.
 * (caches intermediate results)
 * @param {Number[16]} out The output 4x4 matrix.
 * @param {Number[16]} A The LHS 4x4 matrix operand.
 * @param {Number[16]} B The RHS 4x4 matrix operand.
 */
function Mtx4Cat_(out, A, B) {
    var a = A[ 0], b = A[ 1], c = A[ 2], d = A[ 3];
    var e = A[ 4], f = A[ 5], g = A[ 6], h = A[ 7];
    var i = A[ 8], j = A[ 9], k = A[10], l = A[11];
    var m = A[12], n = A[13], o = A[14], p = A[15];

    var q = B[ 0], r = B[ 1], s = B[ 2], t = B[ 3];

    out[ 0] = a * q + e * r + i * s + m * t;
    out[ 1] = b * q + f * r + j * s + n * t;
    out[ 2] = c * q + g * r + k * s + o * t;
    out[ 3] = d * q + h * r + l * s + p * t;

    q = B[ 4]; r = B[ 5]; s = B[ 6]; t = B[ 7];

    out[ 4] = a * q + e * r + i * s + m * t;
    out[ 5] = b * q + f * r + j * s + n * t;
    out[ 6] = c * q + g * r + k * s + o * t;
    out[ 7] = d * q + h * r + l * s + p * t;

    q = B[ 8]; r = B[ 9]; s = B[10]; t = B[11];

    out[ 8] = a * q + e * r + i * s + m * t;
    out[ 9] = b * q + f * r + j * s + n * t;
    out[10] = c * q + g * r + k * s + o * t;
    out[11] = d * q + h * r + l * s + p * t;

    q = B[12]; r = B[13]; s = B[14]; t = B[15];

    out[12] = a * q + e * r + i * s + m * t;
    out[13] = b * q + f * r + j * s + n * t;
    out[14] = c * q + g * r + k * s + o * t;
    out[15] = d * q + h * r + l * s + p * t;
}

/**
 * Concatenates two affine 4x4 matrices.
 * @param {Number[16]} out The output affine 4x4 matrix.
 * @param {Number[16]} A The LHS affine 4x4 matrix operand.
 * @param {Number[16]} B The RHS affine 4x4 matrix operand.
 */
function Mtx4AffineCat(out, A, B) {
    var a = A[ 0], b = A[ 1], c = A[ 2];
    var e = A[ 4], f = A[ 5], g = A[ 6];
    var i = A[ 8], j = A[ 9], k = A[10];
    var m = A[12], n = A[13], o = A[14];

    var q = B[ 0], r = B[ 1], s = B[ 2];

    out[ 0] = a * q + e * r + i * s;
    out[ 1] = b * q + f * r + j * s;
    out[ 2] = c * q + g * r + k * s;
    out[ 3] = 0.0;

    q = B[ 4]; r = B[ 5]; s = B[ 6];

    out[ 4] = a * q + e * r + i * s;
    out[ 5] = b * q + f * r + j * s;
    out[ 6] = c * q + g * r + k * s;
    out[ 7] = 0.0;

    q = B[ 8]; r = B[ 9]; s = B[10];

    out[ 8] = a * q + e * r + i * s;
    out[ 9] = b * q + f * r + j * s;
    out[10] = c * q + g * r + k * s;
    out[11] = 0.0;

    q = B[12]; r = B[13]; s = B[14];

    out[12] = a * q + e * r + i * s + m;
    out[13] = b * q + f * r + j * s + n;
    out[14] = c * q + g * r + k * s + o;
    out[15] = 1.0;
}

/**
 * @test
 */
function Mtx4AffineCatUncached(out, A, B) {
    out[ 0] = A[ 0] * B[ 0] + A[ 4] * B[ 1] + A[ 8] * B[ 2];
    out[ 1] = A[ 1] * B[ 0] + A[ 5] * B[ 1] + A[ 9] * B[ 2];
    out[ 2] = A[ 2] * B[ 0] + A[ 6] * B[ 1] + A[10] * B[ 2];
    out[ 3] = 0.0;

    out[ 4] = A[ 0] * B[ 4] + A[ 4] * B[ 5] + A[ 8] * B[ 6];
    out[ 5] = A[ 1] * B[ 4] + A[ 5] * B[ 5] + A[ 9] * B[ 6];
    out[ 6] = A[ 2] * B[ 4] + A[ 6] * B[ 5] + A[10] * B[ 6];
    out[ 7] = 0.0;

    out[ 8] = A[ 0] * B[ 8] + A[ 4] * B[ 9] + A[ 8] * B[10];
    out[ 9] = A[ 1] * B[ 8] + A[ 5] * B[ 9] + A[ 9] * B[10];
    out[10] = A[ 2] * B[ 8] + A[ 6] * B[ 9] + A[10] * B[10];
    out[11] = 0.0;

    out[12] = A[ 0] * B[12] + A[ 4] * B[13] + A[ 8] * B[14] + A[12];
    out[13] = A[ 1] * B[12] + A[ 5] * B[13] + A[ 9] * B[14] + A[13];
    out[14] = A[ 2] * B[12] + A[ 6] * B[13] + A[10] * B[14] + A[14];
    out[15] = 1.0;
}

/**
 * Returns the translation part of a 4x4 matrix.
 * @param {Number[16]} m4 The input 4x4 matrix.
 * @return {Number[3]} A reference to the subarray of the translation part of the input matrix.
 */
function Mtx4GetTranslation(m4) {
    return m4.subarray(12, 15);
}

/**
 * Translates a 4x4 matrix by a 3-component vector.
 * @param {Number[16]} m4 The 4x4 matrix to translate.
 * @param {Number[3]} v3 The translation 3-component vector.
 */
function Mtx4Translate(m4, v3) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    m4[12] += x * m4[ 0] + y * m4[ 4] + z * m4[ 8];
    m4[13] += x * m4[ 1] + y * m4[ 5] + z * m4[ 9];
    m4[14] += x * m4[ 2] + y * m4[ 6] + z * m4[10];
    m4[15] += x * m4[ 3] + y * m4[ 7] + z * m4[11];
}

/**
 * Scales a 4x4 matrix by a 3-component vector.
 * @param {Number[16]} m4 The 4x4 matrix to scale.
 * @param {Number[3]} v3 The scaling 3-component vector.
 */
function Mtx4Scale(m4, v3) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    m4[ 0] *= x; m4[ 1] *= x; m4[ 2] *= x; m4[ 3] *= x;
    m4[ 4] *= y; m4[ 5] *= y; m4[ 6] *= y; m4[ 7] *= y;
    m4[ 8] *= z; m4[ 9] *= z; m4[10] *= z; m4[11] *= z;
}

/**
 * Rotates a matrix by a given angle along a given axis.
 * @param {Number[16]} m4 The input matrix.
 * @param {Number[3]} axis The rotation axis.
 * @param {Number} angle The amount (in rad) to rotate by.
 */
function Mtx4Rotate(m4, axis, angle) {
    var x = axis[0], y = axis[1], z = axis[2];

    var L = Sqrt(x * x + y * y + z * z);
    if (L < EPSILON) return;
    L = 1.0 / L;

    x *= L;
    y *= L;
    z *= L;

    var cosA = Cos(angle), sinA = Sin(angle), tanA = 1.0 - cosA;

    var a = m4[ 0], b = m4[ 1], c = m4[ 2], d = m4[ 3];
    var e = m4[ 4], f = m4[ 5], g = m4[ 6], h = m4[ 7];
    var i = m4[ 8], j = m4[ 9], k = m4[10], l = m4[11];

    var A = x * x * tanA + cosA,     B = y * x * tanA + z * sinA, C = z * x * tanA - y * sinA;
    var D = x * y * tanA - z * sinA, E = y * y * tanA + cosA,     F = z * y * tanA + x * sinA;
    var G = x * z * tanA + y * sinA, H = y * z * tanA - x * sinA, I = z * z * tanA + cosA;

    m4[ 0] = a * A + e * B + i * C;
    m4[ 1] = b * A + f * B + j * C;
    m4[ 2] = c * A + g * B + k * C;
    m4[ 3] = d * A + h * B + l * C;

    m4[ 4] = a * D + e * E + i * F;
    m4[ 5] = b * D + f * E + j * F;
    m4[ 6] = c * D + g * E + k * F;
    m4[ 7] = d * D + h * E + l * F;

    m4[ 8] = a * G + e * H + i * I;
    m4[ 9] = b * G + f * H + j * I;
    m4[10] = c * G + g * H + k * I;
    m4[11] = d * G + h * H + l * I;
}

/**
 * Sets the components of a 4x4 matrix from a SQT pose.
 * @param {Number[16]} out The output affine 4x4 matrix.
 * @param {Number[3]} s The scaling 3-component vector.
 * @param {Number[4]} q The rotation quaternion.
 * @param {Number[3]} t The translation 3-component vector.
 * @param {Number[3]} p The joint position.
 */
function Mtx4FromSQT(out, s, q, t, p) {
    var px = p[0], py = p[1], pz = p[2];
    var sx = s[0], sy = s[1], sz = s[2];

    var w = q[0], x = q[1], y = q[2], z = q[3];

    out[ 0] = sx * (1.0 - 2.0 * y * y - 2.0 * z * z);
    out[ 1] = sy * (2.0 * x * y + 2.0 * w * z);
    out[ 2] = sz * (2.0 * x * z - 2.0 * w * y);

    out[ 4] = sx * (2.0 * x * y - 2.0 * w * z);
    out[ 5] = sy * (1.0 - 2.0 * x * x - 2.0 * z * z);
    out[ 6] = sz * (2.0 * y * z + 2.0 * w * x);

    out[ 8] = sx * (2.0 * x * z + 2.0 * w * y);
    out[ 9] = sy * (2.0 * y * z - 2.0 * w * x);
    out[10] = sz * (1.0 - 2.0 * x * x - 2.0 * y * y);

    out[12] = px + sx * t[0] - px * out[ 0] - py * out[ 4] - pz * out[ 8];
    out[13] = py + sy * t[1] - px * out[ 1] - py * out[ 5] - pz * out[ 9];
    out[14] = pz + sz * t[2] - px * out[ 2] - py * out[ 6] - pz * out[10];
}

/**
 * Rotates an affine 4x4 matrix by a quaternion.
 * @param {Number[16]} m4 The 4x4 matrix to rotate.
 * @param {Number[4]} q The rotation quaternion.
 */
function Mtx4RotateQuats(m4, q) {
    var a = m4[ 0], b = m4[ 1], c = m4[ 2];
    var e = m4[ 4], f = m4[ 5], g = m4[ 6];
    var i = m4[ 8], j = m4[ 9], k = m4[10];

    var w = q[0], x = q[1], y = q[2], z = q[3];

    var A = 1.0 - 2.0 * y * y - 2.0 * z * z;
    var B = 2.0 * x * y + 2.0 * w * z;
    var C = 2.0 * x * z - 2.0 * w * y;

    m4[ 0] = a * A + e * B + i * C;
    m4[ 1] = b * A + f * B + j * C;
    m4[ 2] = c * A + g * B + k * C;

    A = 2.0 * x * y - 2.0 * w * z;
    B = 1.0 - 2.0 * x * x - 2.0 * z * z;
    C = 2.0 * y * z + 2.0 * w * x;

    m4[ 4] = a * A + e * B + i * C;
    m4[ 5] = b * A + f * B + j * C;
    m4[ 6] = c * A + g * B + k * C;

    A = 2.0 * x * z + 2.0 * w * y;
    B = 2.0 * y * z - 2.0 * w * x;
    C = 1.0 - 2.0 * x * x - 2.0 * y * y;

    m4[ 8] = a * A + e * B + i * C;
    m4[ 9] = b * A + f * B + j * C;
    m4[10] = c * A + g * B + k * C;
}

/**
 * Rotates an affine 4x4 matrix by a quaternion from a position.
 * @param {Number[16]} m4 The 4x4 matrix to rotate.
 * @param {Number[4]} q The rotation quaternion.
 * @param {Number[3]} p The rotation position.
 */
function Mtx4RotateQuatFromPosition(m4, q, p) {
    var X = p[0], Y = p[1], Z = p[2];

    var a = m4[ 0], b = m4[ 1], c = m4[ 2];
    var e = m4[ 4], f = m4[ 5], g = m4[ 6];
    var i = m4[ 8], j = m4[ 9], k = m4[10];

    var w = q[0], x = q[1], y = q[2], z = q[3];

    var A = 1.0 - 2.0 * y * y - 2.0 * z * z;
    var B = 2.0 * x * y + 2.0 * w * z;
    var C = 2.0 * x * z - 2.0 * w * y;

    m4[ 0] = a * A + e * B + i * C;
    m4[ 1] = b * A + f * B + j * C;
    m4[ 2] = c * A + g * B + k * C;

    A = 2.0 * x * y - 2.0 * w * z;
    B = 1.0 - 2.0 * x * x - 2.0 * z * z;
    C = 2.0 * y * z + 2.0 * w * x;

    m4[ 4] = a * A + e * B + i * C;
    m4[ 5] = b * A + f * B + j * C;
    m4[ 6] = c * A + g * B + k * C;

    A = 2.0 * x * z + 2.0 * w * y;
    B = 2.0 * y * z - 2.0 * w * x;
    C = 1.0 - 2.0 * x * x - 2.0 * y * y;

    m4[ 8] = a * A + e * B + i * C;
    m4[ 9] = b * A + f * B + j * C;
    m4[10] = c * A + g * B + k * C;

    m4[12] = - m4[ 0] * X - m4[ 4] * Y - m4[ 8] * Z + a * X + e * Y + i * Z + m4[12];
    m4[13] = - m4[ 1] * X - m4[ 5] * Y - m4[ 9] * Z + b * X + f * Y + j * Z + m4[13];
    m4[14] = - m4[ 2] * X - m4[ 6] * Y - m4[10] * Z + c * X + g * Y + k * Z + m4[14];
}

/**
 * Rotates a 4x4 matrix on the YZ plan.
 * @param {Number[16]} m4 The 4x4 matrix to rotate.
 * @param {Number} angle The amount of CCW angle displacement (rad).
 */
function Mtx4RotateYZ(m4, angle) {
    var m = Cos(angle);
    var n = Sin(angle);

    var e = m4[ 4], f = m4[ 5], g = m4[ 6], h = m4[ 7];
    var i = m4[ 8], j = m4[ 9], k = m4[10], l = m4[11];

    m4[ 4] = m * e + n * i;
    m4[ 5] = m * f + n * j;
    m4[ 6] = m * g + n * k;
    m4[ 7] = m * h + n * l;

    m4[ 8] = m * i - n * e;
    m4[ 9] = m * j - n * f;
    m4[10] = m * k - n * g;
    m4[11] = m * l - n * h;
}

/**
 * Rotates a 4x4 matrix on the ZX plan.
 * @param {Number[16]} m4 The 4x4 matrix to rotate.
 * @param {Number} angle The amount of CCW angle displacement (rad).
 */
function Mtx4RotateZX(m4, angle) {
    var m = Cos(angle);
    var n = Sin(angle);

    var a = m4[ 0], b = m4[ 1], c = m4[ 2], d = m4[ 3];
    var i = m4[ 8], j = m4[ 9], k = m4[10], l = m4[11];

    m4[ 0] = m * a - n * i;
    m4[ 1] = m * b - n * j;
    m4[ 2] = m * c - n * k;
    m4[ 3] = m * d - n * l;

    m4[ 8] = m * i + n * a;
    m4[ 9] = m * j + n * b;
    m4[10] = m * k + n * c;
    m4[11] = m * l + n * d;
}

/**
 * Rotates a 4x4 matrix on the XY plan.
 * @param {Number[16]} m4 The 4x4 matrix to rotate.
 * @param {Number} angle The amount of CCW angle displacement (rad).
 */
function Mtx4RotateXY(m4, angle) {
    var m = Cos(angle);
    var n = Sin(angle);

    var a = m4[ 0], b = m4[ 1], c = m4[ 2], d = m4[ 3];
    var e = m4[ 4], f = m4[ 5], g = m4[ 6], h = m4[ 7];

    m4[ 0] = m * a + n * e;
    m4[ 1] = m * b + n * f;
    m4[ 2] = m * c + n * g;
    m4[ 3] = m * d + n * h;

    m4[ 4] = m * e - n * a;
    m4[ 5] = m * f - n * b;
    m4[ 6] = m * g - n * c;
    m4[ 7] = m * h - n * d;
}

/**
 * Setups a look-at 4x4 matrix.
 * @param {Number[16]} m4 The 4x4 matrix to modify.
 * @param {Number[3]} eye The position of the viewer.
 * @param {Number[3]} target The position of the focal point.
 * @param {Number[3]} up The direction of the up vector.
 */
function Mtx4MakeLookAt(m4, eye, target, up) {
    var ex = eye[0],    ey = eye[1],    ez = eye[2];
    var tx = target[0], ty = target[1], tz = target[2];
    var ux = up[0],     uy = up[1],     uz = up[2];

    var zx = ex - tx;
    var zy = ey - ty;
    var zz = ez - tz;

    var l = Sqrt(zx * zx + zy * zy + zz * zz);
    if (l < EPSILON) return;
    l = 1.0 / l;

    zx *= l;
    zy *= l;
    zz *= l;

    var xx = uy * zz - uz * zy;
    var xy = uz * zx - ux * zz;
    var xz = ux * zy - uy * zx;

    l = Sqrt(xx * xx + xy * xy + xz * xz);
    if (l > 0.0) { // if (l > EPSILON) ?
        l = 1.0 / l;

        xx *= l;
        xy *= l;
        xz *= l;
    } else {
        xx = 0.0;
        xy = 0.0;
        xz = 0.0;
    }

    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;

    l = Sqrt(yx * yx + yy * yy + yz * yz);
    if (l > 0.0) { // if (l > EPSILON) ?
        l = 1.0 / l;

        yx *= l;
        yy *= l;
        yz *= l;
    } else {
        yx = 0.0;
        yy = 0.0;
        yz = 0.0;
    }

    m4[ 0] = xx;
    m4[ 1] = yx;
    m4[ 2] = zx;
    m4[ 3] = 0.0;

    m4[ 4] = xy;
    m4[ 5] = yy;
    m4[ 6] = zy;
    m4[ 7] = 0.0;

    m4[ 8] = xz;
    m4[ 9] = yz;
    m4[10] = zz;
    m4[11] = 0.0;

    m4[12] = - xx * ex - xy * ey - xz * ez;
    m4[13] = - yx * ex - yy * ey - yz * ez;
    m4[14] = - zx * ex - zy * ey - zz * ez;
    m4[15] = 1.0;
}

/**
 * Sets a look-at matrix with the give eye position, focal point, and up axis.
 * @param {Number[16]} m4 The input matrix.
 * @param {Number[3]} eye Position of the viewer.
 * @param {Number[3]} target Position of the target.
 * @param {Number[3]} up Direction of the up vector.
 */
Matrix4.lookAt = function ( m4, eye, target, up )
{
    var ex = eye[0], tx = target[0], ux = up[0],
        ey = eye[1], ty = target[1], uy = up[1],
        ez = eye[2], tz = target[2], uz = up[2],

    c = ex - tx,
    f = ey - ty,
    i = ez - tz,

    l = Sqrt( c * c + f * f + i * i );

    if ( l < EPSILON ) return;

    l = 1 / l;

    c *= l;
    f *= l;
    i *= l;

    var a = uy * i - uz * f,
        d = uz * c - ux * i,
        g = ux * f - uy * c;

    l = Sqrt( a * a + d * d + g * g );

    if ( l > 0 )
    {
        l = 1 / l;

        a *= l;
        d *= l;
        g *= l;
    }
    else
    {
        a = 0;
        d = 0;
        g = 0;
    }

    var b = f * g - i * d,
        e = i * a - c * g,
        h = c * d - f * a;

    l = Sqrt( b * b + e * e + h * h );

    if ( l > 0 )
    {
        l = 1 / l;

        b *= l;
        e *= l;
        h *= l;
    }
    else
    {
        b = 0;
        e = 0;
        h = 0;
    }

    m4[ 0] = a;   m4[ 4] = d;   m4[ 8] = g;   m4[12] = - a * ex - d * ey - g * ez;
    m4[ 1] = b;   m4[ 5] = e;   m4[ 9] = h;   m4[13] = - b * ex - e * ey - h * ez;
    m4[ 2] = c;   m4[ 6] = f;   m4[10] = i;   m4[14] = - c * ex - f * ey - i * ez;
    m4[ 3] = 0.;  m4[ 7] = 0.;  m4[11] = 0.;  m4[15] = 1.;
};

/**
 * Setups a view frustum clip 4x4 matrix.
 * @param {Number[16]} m4 The 4x4 matrix to modify.
 * @param {Number} left The left clip plane distance.
 * @param {Number} right The right clip plane distance.
 * @param {Number} bottom The bottom clip plane distance.
 * @param {Number} top The top clip plane distance.
 * @param {Number} near The near clip plane distance.
 * @param {Number} far The far clip plane distance.
 */
function Mtx4MakeFrustum(m4, left, right, bottom, top, near, far) {
    var w = 1.0 / (right - left);
    var h = 1.0 / (top - bottom);
    var d = 1.0 / (near - far);

    m4[ 0] = 2.0 * near * w;     m4[ 1] = 0.0;                m4[ 2] = 0.0;                  m4[ 3] = 0.0;
    m4[ 4] = 0.0;                m4[ 5] = 2.0 * near * h;     m4[ 6] = 0.0;                  m4[ 7] = 0.0;
    m4[ 8] = (right + left) * w; m4[ 9] = (top + bottom) * h; m4[10] = (far + near) * d;     m4[11] = -1.0;
    m4[12] = 0.0;                m4[13] = 0.0;                m4[14] = 2.0 * far * near * d; m4[15] = 0.0;
}

/**
 * Setups a perspective clip 4x4 matrix.
 * @param {Number[16]} m4 The 4x4 matrix to modify.
 * @param {Number} fov The vertical field of view of the view frustum (deg.)
 * @param {Number} aspect The aspect ratio of the view frustum.
 * @param {Number} near The near clip plane distance.
 * @param {Number} far The far clip plane distance.
 */
function Mtx4MakePerspective(m4, fov, aspect, near, far) {
    if (fov >= 180.0 || fov < 0.0) return;

    var cot = 1.0 / Tan(fov * 0.5 * DEG_TO_RAD);
    var dz = 1.0 / (far - near);

    m4[ 0] = cot / aspect; m4[ 1] = 0.0; m4[ 2] = 0.0;                    m4[ 3] = 0.0;
    m4[ 4] = 0.0;          m4[ 5] = cot; m4[ 6] = 0.0;                    m4[ 7] = 0.0;
    m4[ 8] = 0.0;          m4[ 9] = 0.0; m4[10] = -(far + near) * dz;     m4[11] = -1.0;
    m4[12] = 0.0;          m4[13] = 0.0; m4[14] = -2.0 * far * near * dz; m4[15] = 0.0;
}

/**
 * Setups an orthographic clip 4x4 matrix.
 * @param {Number[16]} m4 The 4x4 matrix to modify.
 * @param {Number} left The left clip plane distance.
 * @param {Number} right The right clip plane distance.
 * @param {Number} bottom The bottom clip plane distance.
 * @param {Number} top The top clip plane distance.
 * @param {Number} near The near clip plane distance.
 * @param {Number} far The far clip plane distance.
 */
function Mtx4MakeOrthographic(m4, left, right, bottom, top, near, far) {
    var w = 1.0 / (left - right);
    var h = 1.0 / (bottom - top);
    var d = 1.0 / (near - far);

    m4[ 0] = -2.0 * w;           m4[ 1] = 0.0;                m4[ 2] = 0.0;              m4[ 3] = 0.0;
    m4[ 4] = 0.0;                m4[ 5] = -2.0 * h;           m4[ 6] = 0.0;              m4[ 7] = 0.0;
    m4[ 8] = 0.0;                m4[ 9] = 0.0;                m4[10] = 2.0 * d;          m4[11] = 0.0;
    m4[12] = (right + left) * w; m4[13] = (top + bottom) * h; m4[14] = (far + near) * d; m4[15] = 1.0;
}

/**
 * Extracts the frustum planes of a 4x4 matrix.
 * @param {Number[4][6]} out The output frustum array.
 * @param {Number[16]} m4 The input 4x4 matrix.
 * @see Fast Extraction of Viewing Frustum Planes from the World-View-Projection Matrix,
 *      Gil Gribb, Klaus Hartmann.
 */
function Mtx4GetFrustum(out, m4) {
    var eq;
    var A = m4[ 3], B = m4[ 7], C = m4[11], D = m4[15];
    var a = m4[ 0], b = m4[ 4], c = m4[ 8], d = m4[12];

    eq = out[0]; eq[0] = A + a; eq[1] = B + b; eq[2] = C + c; eq[3] = D + d;
    eq = out[1]; eq[0] = A - a; eq[1] = B - b; eq[2] = C - c; eq[3] = D - d;

    a = m4[ 1]; b = m4[ 5]; c = m4[ 9]; d = m4[13];

    eq = out[2]; eq[0] = A + a; eq[1] = B + b; eq[2] = C + c; eq[3] = D + d;
    eq = out[3]; eq[0] = A - a; eq[1] = B - b; eq[2] = C - c; eq[3] = D - d;

    a = m4[ 2]; b = m4[ 6]; c = m4[10]; d = m4[14];

    eq = out[4]; eq[0] = A + a; eq[1] = B + b; eq[2] = C + c; eq[3] = D + d;
    eq = out[5]; eq[0] = A - a; eq[1] = B - b; eq[2] = C - c; eq[3] = D - d;
}

/**
 * Prints a 4x4 matrix on the console.
 * @param {Number[16]} m4 The 4x4 matrix to print.
 * @param {Number} [a=2] The float accuracy.
 */
function Mtx4Print(m4, a) {
    if (a === undefined) a = 2;

    console.log('mtx4(' +
        m4[ 0].toFixed(a) + ', ' +
        m4[ 1].toFixed(a) + ', ' +
        m4[ 2].toFixed(a) + ', ' +
        m4[ 3].toFixed(a) + ','
    );
    console.log('     ' +
        m4[ 4].toFixed(a) + ', ' +
        m4[ 5].toFixed(a) + ', ' +
        m4[ 6].toFixed(a) + ', ' +
        m4[ 7].toFixed(a) + ','
    );
    console.log('     ' +
        m4[ 8].toFixed(a) + ', ' +
        m4[ 9].toFixed(a) + ', ' +
        m4[10].toFixed(a) + ', ' +
        m4[11].toFixed(a) + ','
    );
    console.log('     ' +
        m4[12].toFixed(a) + ', ' +
        m4[13].toFixed(a) + ', ' +
        m4[14].toFixed(a) + ', ' +
        m4[15].toFixed(a) + ')'
    );
}


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


/**
 * Creates a 3x3 matrix from components.
 * @param {Number} a-i The matrix components.
 * @return {Number[9]} A 3x3 matrix.
 */
function Mtx3(a, b, c,
    d, e, f,
    g, h, i) {
        var m3 = new Float32Array(9);

        m3[0] = a; m3[1] = b; m3[2] = c;
        m3[3] = d; m3[4] = e; m3[5] = f;
        m3[6] = g; m3[7] = h; m3[8] = i;

        return m3;
}

/**
 * Creates a null 3x3 matrix.
 * @return {Number[9]} O_3
 */
function Mtx3Null() {
    return new Float32Array(9);
}

/**
 * Creates an identity 3x3 matrix.
 * @return {Number[9]} I_3
 */
function Mtx3Ident() {
    var m3 = new Float32Array(9);

    m3[0] = 1.0;
    m3[4] = 1.0;
    m3[8] = 1.0;

    return m3;
}

/**
 * Resets a 3x3 matrix to the identity.
 * @param {Number[9]} m3 The 3x3 matrix to reset.
 */
function Mtx3Reset(m3) {
    m3[0] = 1.0; m3[1] = 0.0; m3[2] = 0.0;
    m3[3] = 0.0; m3[4] = 1.0; m3[5] = 0.0;
    m3[6] = 0.0; m3[7] = 0.0; m3[8] = 1.0;
}

/**
 * Copies the components of a 3x3 matrix.
 * @param {Number[9]} dest The destination 3x3 matrix.
 * @param {Number[9]} src The source 3x3 matrix.
 */
function Mtx3Cpy(dest, src) {
    dest[0] = src[0]; dest[1] = src[1]; dest[2] = src[2];
    dest[3] = src[3]; dest[4] = src[4]; dest[5] = src[5];
    dest[6] = src[6]; dest[7] = src[7]; dest[8] = src[8];
}

/**
 * Sets the rotation part of a 3x3 matrix from a quaternion.
 * @param {Number[9]} m3 The 3x3 matrix to modify.
 * @param {Number[4]} q The rotation quaternion.
 */
function Mtx3FromQuat(m3, q) {
    var	w = q[0];
    var x = q[1];
    var y = q[2];
    var z = q[3];

    // Note: caching intermediate computations will result in a loss of performance.
    m3[0] = 1 - 2 * y * y - 2 * z * z;
    m3[1] = 2 * x * y + 2 * w * z;
    m3[2] = 2 * x * z - 2 * w * y;

    m3[3] = 2 * x * y - 2 * w * z;
    m3[4] = 1 - 2 * x * x - 2 * z * z;
    m3[5] = 2 * y * z + 2 * w * x;

    m3[6] = 2 * x * z + 2 * w * y;
    m3[7] = 2 * y * z - 2 * w * x;
    m3[8] = 1 - 2 * x * x - 2 * y * y;
}

/**
 * Sets the components of a 3x3 matrix from a 4x4 matrix.
 * @param {Number[9]} m3 The destination 3x3 matrix.
 * @param {Number[16]} m4 The source 4x4 matrix.
 */
function Mtx3FromMtx4(m3, m4) {
    m3[0] = m4[ 0]; m3[1] = m4[ 1]; m3[2] = m4[ 2];
    m3[3] = m4[ 4]; m3[4] = m4[ 5]; m3[5] = m4[ 6];
    m3[6] = m4[ 8]; m3[7] = m4[ 9]; m3[8] = m4[10];
}

/**
 * Transposes a 3x3 matrix.
 * @param {Number[9]} m3 The 3x3 matrix to transpose.
 */
function Mtx3Transp(m3) {
    var
    $ = m3[ 1]; m3[ 1] = m3[ 3]; m3[ 3] = $;
    $ = m3[ 2]; m3[ 2] = m3[ 6]; m3[ 6] = $;
    $ = m3[ 5]; m3[ 5] = m3[ 7]; m3[ 7] = $;
}

/**
 * Returns the trace of a 3x3 matrix.
 * @param {Number[9]} m3 The input 3x3 matrix.
 * @return {Number} The trace of the input matrix.
 */
function Mtx3Trace(m3) {
    return m3[0] + m3[4] + m3[8];
}

/**
 * Returns the determinant of a 3x3 matrix.
 * @param {Number[9]} m3 The input 3x3 matrix.
 * @return {Number} The determinant of the input matrix.
 */
function Mtx3Det(m3) {
    var a = m3[ 0], b = m3[ 1], c = m3[ 2];
    var d = m3[ 3], e = m3[ 4], f = m3[ 5];

    return m3[ 6] * (b * f - c * e)
         + m3[ 7] * (c * d - a * f)
         + m3[ 8] * (a * e - b * d);
}

/**
 * Inverts a 3x3 matrix.
 * @param {Number[9]} m3 The 3x3 matrix to invert.
 */
function Mtx3Invert(m3) {
    var a = m3[0], b = m3[1], c = m3[2];
    var d = m3[3], e = m3[4], f = m3[5];
    var g = m3[6], h = m3[7], i = m3[8];

    var A = e * i - f * h;
    var B = f * g - d * i;
    var C = d * h - e * g;

    var det = a * A + b * B + c * C;
    if (Abs(det) < EPSILON) return;
    det = 1.0 / det;

    m3[0] = det * A; m3[1] = det * (c * h - b * i); m3[2] = det * (b * f - c * e);
    m3[3] = det * B; m3[4] = det * (a * i - c * g); m3[5] = det * (c * d - a * f);
    m3[6] = det * C; m3[7] = det * (b * g - a * h); m3[8] = det * (a * e - b * d);
}

/**
 * Concatenates two 3x3 matrices.
 * @param {Number[9]} out The output 3x3 matrix.
 * @param {Number[9]} A The LHS 3x3 matrix operand.
 * @param {Number[9]} B The RHS 3x3 matrix operand.
 */
function Mtx3Cat(out, A, B) {
    var a = A[0], b = A[1], c = A[2];
    var d = A[3], e = A[4], f = A[5];
    var g = A[6], h = A[7], i = A[8];

    var j = B[0], k = B[1], l = B[2];

    out[0] = a * j + d * k + g * l;
    out[1] = b * j + e * k + h * l;
    out[2] = c * j + f * k + i * l;

    j = B[3]; k = B[4]; l = B[5];

    out[3] = a * j + d * k + g * l;
    out[4] = b * j + e * k + h * l;
    out[5] = c * j + f * k + i * l;

    j = B[6]; k = B[7]; l = B[8];

    out[6] = a * j + d * k + g * l;
    out[7] = b * j + e * k + h * l;
    out[8] = c * j + f * k + i * l;
}

/**
 * Prints a 3x3 matrix on the console.
 * @param {Number[9]} m3 The 3x3 matrix to print.
 * @param {Number} [a=2] The float accuracy.
 */
function Mtx3Print(m3, a) {
    if (a === undefined) a = 2;

    console.log( 'MTX3(' +
        m3[0].toFixed(a) + ', ' +
        m3[1].toFixed(a) + ', ' +
        m3[2].toFixed(a) + ','
    );
    console.log( '     ' +
        m3[3].toFixed(a) + ', ' +
        m3[4].toFixed(a) + ', ' +
        m3[5].toFixed(a) + ','
    );
    console.log( '     ' +
        m3[6].toFixed(a) + ', ' +
        m3[7].toFixed(a) + ', ' +
        m3[8].toFixed(a) + ')'
    );
}

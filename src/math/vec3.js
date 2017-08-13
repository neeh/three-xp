
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
 * Creates a 3-component vector from components.
 * @param {Number} x The first vector component.
 * @param {Number} y The second vector component.
 * @param {Number} z The third vector component.
 * @return {Number[3]} A 3-component vector (x, y, z).
 */
function Vec3(x, y, z) {
    var v3 = new Float32Array(3);

    v3[0] = x;
    v3[1] = y;
    v3[2] = z;

    return v3;
}

/**
 * Creates a null 3-component vector.
 * @return {Number[3]} A null 3-component vector (0, 0, 0).
 */
function Vec3Null() {
    return new Float32Array(3);
}

/**
 * Resets the components of a 3-component vector to the null vector.
 * @param {Number[3]} v3 The 3-component vector to reset.
 */
function Vec3Reset(v3) {
    v3[0] = 0.0;
    v3[1] = 0.0;
    v3[2] = 0.0;
}

/**
 * Copies the components of a 3-component vector.
 * @param {Number[3]} dest The destination 3-component vector.
 * @param {Number[3]} src The source 3-component vector.
 */
function Vec3Cpy(dest, src) {
    dest[0] = src[0];
    dest[1] = src[1];
    dest[2] = src[2];
}

/**
 * Negates a 3-component vector.
 * @param {Number[3]} v3 The 3-component vector to negate.
 */
function Vec3Neg(v3) {
    v3[0] = -v3[0];
    v3[1] = -v3[1];
    v3[2] = -v3[2];
}

/**
 * Adds two 3-component vectors.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} u The first 3-component vector operand.
 * @param {Number[3]} v The second 3-component vector operand.
 */
function Vec3Add(out, u, v) {
    out[0] = u[0] + v[0];
    out[1] = u[1] + v[1];
    out[2] = u[2] + v[2];
}

/**
 * Subtracts two 3-component vectors.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} u The first 3-component vector operand.
 * @param {Number[3]} v The second 3-component vector operand.
 */
function Vec3Sub(out, u, v) {
    out[0] = u[0] - v[0];
    out[1] = u[1] - v[1];
    out[2] = u[2] - v[2];
}

/**
 * Multiplies two 3-component vectors.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} u The first 3-component vector operand.
 * @param {Number[3]} v The second 3-component vector operand.
 */
function Vec3Mul(out, u, v) {
    out[0] = u[0] * v[0];
    out[1] = u[1] * v[1];
    out[2] = u[2] * v[2];
}

/**
 * Scales a 3-component vector.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} u The input 3-component vector.
 * @param {Number} k The scaling factor.
 */
function Vec3Scale(out, u, k) {
    out[0] = k * u[0];
    out[1] = k * u[1];
    out[2] = k * u[2];
}

/**
 * Returns the dot product of two 3-component vectors.
 * @param {Number[3]} u The first 3-component vector operand.
 * @param {Number[3]} v The second 3-component vector operand.
 * @return {Number} The dot product u.v.
 */
function Vec3Dot(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}

/**
 * Performs the cross product of two 3-component vectors.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} u The first 3-component vector operand.
 * @param {Number[3]} v The second 3-component vector operand.
 */
function Vec3Cross(out, u, v) {
    var ux = u[0], uy = u[1], uz = u[2];
    var vx = v[0], vy = v[1], vz = v[2];

    out[0] = uy * vz - uz * vy;
    out[1] = vx * uz - vz * ux;
    out[2] = ux * vy - uy * vx;
}

/**
 * Returns the length of a 3-component vector.
 * @param {Number[3]} v3 The input 3-component vector.
 * @return {Number} The length of the input vector.
 */
function Vec3Len(v3) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    return Sqrt(x * x + y * y + z * z);
}

/**
 * Returns the squared length of a 3-component vector.
 * @param {Number[3]} v3 The input 3-component vector.
 * @return {Number} The squared length of the input vector.
 */
function Vec3SqLen(v3) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    return x * x + y * y + z * z;
}

/**
 * Returns the manhattan length of a 3-component vector.
 * @param {Number[3]} v3 The input 3-component vector.
 * @return {Number} The manhattan length of the input vector.
 */
function Vec3Manhattan(v3) {
    return Abs(v3[0]) + Abs(v3[1]) + Abs(v3[2]);
}

/**
 * Returns the p-length of a 3-component vector.
 * @param {Number[3]} v3 The input 3-component vector.
 * @param {Number} p The degree of the p-length.
 * @return {Number} The p-length of the input vector.
 */
function Vec3PLen(v3, p) {
    return Pow(Pow(Abs(v3[0]), p) + Pow(Abs(v3[1]), p) + Pow(Abs(v3[2]), p), 1.0 / p);
}

/**
 * Normalizes a 3-component vector.
 * @param {Number[3]} v3 The 3-component vector to normalize.
 */
function Vec3Normalize(v3) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    var l = Sqrt(x * x + y * y + z * z);
    if (l < EPSILON) return;
    l = 1.0 / l;

    v3[0] *= l;
    v3[1] *= l;
    v3[2] *= l;
}

/**
 * Applies a 4x4 matrix to a 3-component vector.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} v3 The input 3-component vector.
 * @param {Number[16]} m4 The input 4x4 matrix.
 */
function Vec3ApplyMtx4(out, v3, m4) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    var w = m4[ 3] * x + m4[ 7] * y + m4[11] * z + m4[15];
    if (Abs(w) < EPSILON) return;
    w = 1.0 / w;

    out[0] = (m4[ 0] * x + m4[ 4] * y + m4[ 8] * z) * w;
    out[1] = (m4[ 1] * x + m4[ 5] * y + m4[ 9] * z) * w;
    out[2] = (m4[ 2] * x + m4[ 6] * y + m4[10] * z) * w;
}

/**
 * Applies an affine 4x4 matrix to a 3-component vector.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} v3 The input 3-component vector.
 * @param {Number[16]} m4 The input affine 4x4 matrix.
 */
function Vec3ApplyAffineMtx4(out, v3, m4) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    out[0] = m4[ 0] * x + m4[ 4] * y + m4[ 8] * z;
    out[1] = m4[ 1] * x + m4[ 5] * y + m4[ 9] * z;
    out[2] = m4[ 2] * x + m4[ 6] * y + m4[10] * z;
}

/**
 * Applies a 4x4 matrix to a 3D point.
 * @param {Number[3]} out The output 3D point.
 * @param {Number[3]} v3 The input 3D point.
 * @param {Number[16]} m4 The input 4x4 matrix.
 */
function PointApplyMtx4(out, v3, m4) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    var w = m4[ 3] * x + m4[ 7] * y + m4[11] * z + m4[15];
    if (Abs(w) < EPSILON) return;
    w = 1.0 / w;

    out[0] = (m4[ 0] * x + m4[ 4] * y + m4[ 8] * z + m4[12]) * w;
    out[1] = (m4[ 1] * x + m4[ 5] * y + m4[ 9] * z + m4[13]) * w;
    out[2] = (m4[ 2] * x + m4[ 6] * y + m4[10] * z + m4[14]) * w;
}

/**
 * Applies an affine 4x4 matrix to a 3D point.
 * @param {Number[3]} out The output 3D point.
 * @param {Number[3]} v3 The input 3D point.
 * @param {Number[16]} m4 The input affine 4x4 matrix.
 */
function PointApplyMtx4(out, v3, m4) {
    var x = v3[0];
    var y = v3[1];
    var z = v3[2];

    out[0] = m4[ 0] * x + m4[ 4] * y + m4[ 8] * z + m4[12];
    out[1] = m4[ 1] * x + m4[ 5] * y + m4[ 9] * z + m4[13];
    out[2] = m4[ 2] * x + m4[ 6] * y + m4[10] * z + m4[14];
}

/**
 * Performs a linear interpolation between two 3-component vectors.
 * @param {Number[3]} out The output 3-component vector.
 * @param {Number[3]} u The first 3-component vector.
 * @param {Number[3]} v The second 3-component vector.
 * @param {Number} s The interpolation factor.
 */
function Vec3Lerp(out, u, v, s) {
    var x = u[0];
    var y = u[1];
    var z = u[2];

    out[0] = x + s * ( v[0] - x );
    out[1] = y + s * ( v[1] - y );
    out[2] = z + s * ( v[2] - z );
}

/**
 * Performs a Piecewise Cubic Hermite Interpolation Polynomial on a 3-component vector.
 * @param {Number[3]} out The ouput 3-component vector.
 * @param {Number[3]} u The first position.
 * @param {Number[3]} o The out tangent of u.
 * @param {Number[3]} i The in tangent of v.
 * @param {Number[3]} v The second position.
 * @param {Number} s The interpolation factor.
 */
function Vec3Pchip(out, u, o, i, v, s) {
    var s2 = s * s;

    var f1 = s2 * (s + s - 3) + 1;
    var f2 = s2 * (s - 2) + s;
    var f3 = s2 * (s - 1);
    var f4 = s2 * (3 - s - s);

    out[0] = f1 * u[0] + f2 * o[0] + f3 * i[0] + f4 * v[0];
    out[1] = f1 * u[1] + f2 * o[1] + f3 * i[1] + f4 * v[1];
    out[2] = f1 * u[2] + f2 * o[2] + f3 * i[2] + f4 * v[2];
}

/**
 * Performs a Piecewise Bezier Curve Interpolation on a 3-component vector.
 * @param {Number[3]} out The ouput 3-component vector.
 * @param {Number[3]} u The first position.
 * @param {Number[3]} o The out tangent of u.
 * @param {Number[3]} i The in tangent of v.
 * @param {Number[3]} v The second position.
 * @param {Number} s The interpolation factor.
 */
function Vec3Bezier(out, u, o, i, v, s) {
    var s2 = s * s;
    var is = 1 - s;
    var is2 = is * is;

    var f1 = is2 * is;
    var f2 = 3 * s * is2;
    var f3 = 3 * s2 * is;
    var f4 = s2 * s;

    out[0] = f1 * u[0] + f2 * o[0] + f3 * i[0] + f4 * v[0];
    out[1] = f1 * u[1] + f2 * o[1] + f3 * i[1] + f4 * v[1];
    out[2] = f1 * u[2] + f2 * o[2] + f3 * i[2] + f4 * v[2];
}

/**
 * Prints a 3-component vector on the console.
 * @param {Number[3]} v3 The 3-component vector to print.
 * @param {Number} [a=2] The float accuracy.
 */
function Vec3Print(v3, a) {
    if (a === undefined) a = 2;

    console.log('vec3(' +
        v3[0].toFixed(a) + ', ' +
        v3[1].toFixed(a) + ', ' +
        v3[2].toFixed(a) + ')'
    );
}

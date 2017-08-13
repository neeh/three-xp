
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
 * Creates a 2-component vector from components.
 * @param {Number} x The first vector component.
 * @param {Number} y The second vector component.
 * @return {Number[2]} A 2-component vector (x, y).
 */
function Vec2(x, y) {
    var v2 = new Float32Array(2);

    v2[0] = x;
    v2[1] = y;

    return v2;
}

/**
 * Creates a null 2-component vector.
 * @return {Number[2]} A null 2-component vector (0, 0).
 */
function Vec2Null() {
    return new Float32Array(2);
}

/**
 * Resets the components of a 2-component vector to the null vector.
 * @param {Number[2]} v2 The 2-component vector to reset.
 */
function Vec2Reset(v2) {
    v2[0] = 0.0;
    v2[1] = 0.0;
}

/**
 * Copies the components of a 2-component vector.
 * @param {Number[2]} dest The destination 2-component vector.
 * @param {Number[2]} src The source 2-component vector.
 */
function Vec2Cpy(dest, src) {
    dest[0] = src[0];
    dest[1] = src[1];
}

/**
 * Negates a 2-component vector.
 * @param {Number[2]} v2 The 2-component vector to negate.
 */
function Vec2Neg(v2) {
    v2[0] = -v2[0];
    v2[1] = -v2[1];
}

/**
 * Adds two 2-component vectors.
 * @param {Number[2]} out The output 2-component vector.
 * @param {Number[2]} u The first 2-component vector operand.
 * @param {Number[2]} v The second 2-component vector operand.
 */
function Vec2Add(out, u, v) {
    out[0] = u[0] + v[0];
    out[1] = u[1] + v[1];
}

/**
 * Subtracts two 2-component vectors.
 * @param {Number[2]} out The output 2-component vector.
 * @param {Number[2]} u The first 2-component vector operand.
 * @param {Number[2]} v The second 2-component vector operand.
 */
function Vec2Sub(out, u, v) {
    out[0] = u[0] - v[0];
    out[1] = u[1] - v[1];
}

/**
 * Multiplies two 2-component vectors.
 * @param {Number[2]} out The output 2-component vector.
 * @param {Number[2]} u The first 2-component vector operand.
 * @param {Number[2]} v The second 2-component vector operand.
 */
function Vec2Mul(out, u, v) {
    out[0] = u[0] * v[0];
    out[1] = u[1] * v[1];
}

/**
 * Scales a 2-component vector.
 * @param {Number[2]} out The output 2-component vector.
 * @param {Number[2]} u The input 2-component vector.
 * @param {Number} s The scaling factor.
 */
function Vec2Scale(out, u, s) {
    out[0] = s * u[0];
    out[1] = s * u[1];
}

/**
 * Returns the dot product of two 2-component vectors.
 * @param {Number[2]} u The first 2-component vector operand.
 * @param {Number[2]} v The second 2-component vector operand.
 * @return {Number} The dot product u.v.
 */
function Vec2Dot(u, v) {
    return u[0] * v[0] + u[1] * v[1];
}

/**
 * Returns the length of a 2-component vector.
 * @param {Number[2]} v2 The input 2-component vector.
 * @return {Number} The length of the input vector.
 */
function Vec2Len(v2) {
    var x = v2[0];
    var y = v2[1];

    return Sqrt(x * x + y * y);
}

/**
 * Returns the squared length of a 2-component vector.
 * @param {Number[2]} v2 The input 2-component vector.
 * @return {Number} The squared length of the input vector.
 */
function Vec2SqLen(v2) {
    var x = v2[0];
    var y = v2[1];

    return x * x + y * y;
}

/**
 * Normalizes a 2-component vector.
 * @param {Number[2]} v2 The 2-component vector to normalize.
 */
function Vec2Normalize(v2) {
    var x = v2[0];
    var y = v2[1];

    var l = Sqrt(x * x + y * y);
    if (l < EPSILON) return;
    l = 1.0 / l;

    v2[0] *= l;
    v2[1] *= l;
}

/**
 * Performs a linear interpolation between two 2-component vectors.
 * @param {Number[2]} out The output 2-component vector.
 * @param {Number[2]} u The first 2-component vector.
 * @param {Number[2]} v The second 2-component vector.
 * @param {Number} s The interpolation factor.
 */
function Vec2Lerp(out, u, v, s) {
    var x = u[0];
    var y = u[1];

    out[0] = x + s * (v[0] - x);
    out[1] = y + s * (v[1] - y);
}

/**
 * Prints a 2-component vector on the console.
 * @param {Number[2]} v2 The 2-component vector to print.
 * @param {Number} [a=2] The float accuracy.
 */
function Vec2Print(v2, a) {
    if (a === undefined) a = 2;

    console.log('vec2(' +
        v2[0].toFixed(a) + ', ' +
        v2[1].toFixed(a) + ')'
    );
}

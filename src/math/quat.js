
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
 * Creates a quaternion from components.
 * @param {Number} w The first quaternion component.
 * @param {Number} x The second quaternion component.
 * @param {Number} y The third quaternion component.
 * @param {Number} z The fourth quaternion component.
 * @return {Number[4]} A quaternion (w, (x, y, z)).
 */
function Quat(w, x, y, z) {
    var q = new Float32Array(4);

    q[0] = w;
    q[1] = x;
    q[2] = y;
    q[3] = z;

    return q;
}

/**
 * Creates a null quaternion.
 * @return {Number[4]} A null quaternion (0, (0, 0, 0)).
 */
function QuatNull() {
    return new Float32Array(4);
}

/**
 * Creates an identity quaternion.
 * @return {Number[4]} An identity quaternion (1, (0, 0, 0)).
 */
function QuatIdent() {
    var q = new Float32Array(4);
    q[0] = 1.0;
    return q;
}

/**
 * Resets the components of a quaternion to the identity.
 * @param {Number[4]} q The quaternion to reset.
 */
function QuatReset(q) {
    q[0] = 1.0;
    q[1] = 0.0;
    q[2] = 0.0;
    q[3] = 0.0;
}

/**
 * Sets the components of a quaternion from an axis-angle representation.
 * @param {Number[4]} q The quaternion to modify.
 * @param {Number[3]} axis The axis of rotation.
 * @param {Number} angle The angle of rotation.
 */
function QuatFromAxisAngle(q, axis, angle) {
    angle *= 0.5;
    var s = Sin(angle);

    q[0] = Cos(angle);
    q[1] = s * axis[0];
    q[2] = s * axis[1];
    q[3] = s * axis[2];
}

/**
 * Copies the components of a quaternion.
 * @param {Number[4]} dest The destination quaternion.
 * @param {Number[4]} src The source quaternion.
 */
function QuatCpy(dest, src) {
    dest[0] = src[0];
    dest[1] = src[1];
    dest[2] = src[2];
    dest[3] = src[3];
}

/**
 * Negates a quaternion.
 * @param {Number[4]} q The quaternion to negate.
 */
function QuatNeg(q) {
    q[0] = -q[0];
    q[1] = -q[1];
    q[2] = -q[2];
    q[3] = -q[3];
}

/**
 * Conjugates a quaternion.
 * @param {Number[4]} q The quaternion to conjugate.
 */
function QuatConj(q) {
    q[1] = -q[1];
    q[2] = -q[2];
    q[3] = -q[3];
}

/**
 * Scales a quaternion.
 * @param {Number[4]} out The output quaternion.
 * @param {Number[4]} q The input quaternion.
 * @param {Number} s The scaling factor.
 */
function QuatScale(out, q, s) {
    out[0] = s * q[0];
    out[1] = s * q[1];
    out[2] = s * q[2];
    out[3] = s * q[3];
}

/**
 * Returns the dot product of two quaternions.
 * @param {Number[4]} p The first quaternion operand.
 * @param {Number[4]} p The second quaternion operand.
 * @return {Number} The dot product p.q
 */
function QuatDot(p, q) {
    return p[0] * q[0] + p[1] * q[1] + p[2] * q[2] + p[3] * q[3];
}

/**
 * Returns the length of a quaternion.
 * @param {Numer[4]} q The input quaternion.
 * @return {Number} The length of the input quaternion.
 */
function QuatLen(q) {
    var w = q[0];
    var x = q[1];
    var y = q[2];
    var z = q[3];

    return Sqrt(w * w + x * x + y * y + z * z);
}

/**
 * Returns the squared length of a quaternion.
 * @param {Number[4]} q The input quaternion.
 * @return {Number} The squared length of the input quaternion.
 */
function QuatSqLen(q) {
    var w = q[0];
    var x = q[1];
    var y = q[2];
    var z = q[3];

    return w * w + x * x + y * y + z * z;
}

/**
 * Normalizes a quaternion.
 * @param {Number[4]} q The quaternion to normalize.
 */
function QuatNormalize(q) {
    var w = q[0];
    var x = q[1];
    var y = q[2];
    var z = q[3];

    var l = Sqrt(w * w + x * x + y * y + z * z);
    if (l < EPSILON) return;
    l = 1.0 / l;

    q[0] *= l;
    q[1] *= l;
    q[2] *= l;
    q[3] *= l;
}

/**
 * Inverts a quaternion.
 * @param {Number[4]} q The quaternion to invert.
 */
function QuatInvert(q) {
    var	w = q[0];
    var x = q[1];
    var y = q[2];
    var z = q[3];

    var l = Sqrt(w * w + x * x + y * y + z * z);
    if (l < EPSILON) return;
    l = 1.0 / l;

    q[0] *= l;
    q[1] *= -l;
    q[2] *= -l;
    q[3] *= -l;
}

/**
 * Concatenates two quaternions.
 * @param {Numer[4]} out The ouput quaternion.
 * @param {Number[4]} p The LHS quaternion operand.
 * @param {Number[4]} q The RHS quaternion operand.
 */
function QuatCat(out, p, q) {
    var pw = p[0], px = p[1], py = p[2], pz = p[3];
    var qw = q[0], qx = q[1], qy = q[2], qz = q[3];

    out[0] = pw * qw - px * qx - py * qy - pz * qz;
    out[1] = pw * qx + px * qw + py * qz - pz * qy;
    out[2] = pw * qy + py * qw + pz * qx - px * qz;
    out[3] = pw * qz + pz * qw + px * qy - py * qx;
}

/**
 * Performs a linear interpolation between two quaternions.
 * @param {Number[4]} out The output quaternion.
 * @param {Number[4]} p The first quaternion operand.
 * @param {Number[4]} q The second quaternion operand.
 * @param {Number} s The interpolation factor.
 */
function QuatLerp(out, p, q, s) {
    /*
    var w = p[0];
    var x = p[1];
    var y = p[2];
    var z = p[3];
    */

    out[0] = p[0] + s * (q[0] - p[0]);
    out[1] = p[1] + s * (q[1] - p[1]);
    out[2] = p[2] + s * (q[2] - p[2]);
    out[3] = p[3] + s * (q[3] - p[3]);
}

/**
 * Performs a spherical linear interpolation between two quaternions.
 * @param {Number[4]} out The output quaternion.
 * @param {Number[4]} p The first quaternion operand.
 * @param {Number[4]} q The second quaternion operand.
 * @param {Number} s The interpolation factor.
 */
function QuatSlerp(out, p, q, s) {
    var pw = p[0], px = p[1], py = p[2], pz = p[3];
    var qw = q[0], qx = q[1], qy = q[2], qz = q[3];
    var cos = pw * qw + px * qx + py * qy + pz * qz;
    var sin;
    var k0;
    var k1;

    if (cos < EPSILON) {
        qw = -qw;
        qx = -qx;
        qy = -qy;
        qz = -qz;
        cos = -cos;
    }

    if (1 - cos > EPSILON) {
        var o = Acos(cos);

        sin = 1.0 / Sin(o);

        k0 = Sin((1 - s) * o) * sin;
        k1 = Sin(s * o) * sin;
    } else {
        k0 = 1 - s;
        k1 = s;
    }

    out[0] = k0 * pw + k1 * qw;
    out[1] = k0 * px + k1 * qx;
    out[2] = k0 * py + k1 * qy;
    out[3] = k0 * pz + k1 * qz;
}

/**
 * @todo
 */
var QuatSqLerp = (function () {
    var p = QuatNull();
    var q = QuatNull();

    return function (out, a, b, c, d, s) {
        QuatSlerp(p, a, d, s);
        QuatSlerp(q, b, c, s);

        QuatSlerp(out, p, q, 2 * s * (1 - s));
    };
})();

/**
 * Prints a quaternion on the console.
 * @param {Number[4]} q The quaternion to print.
 * @param {Number} [a=2] The float accuracy.
 */
function QuatPrint(q, a) {
    if (a === undefined) a = 2;

    console.log('quat(' +
        q[0].toFixed(a) + ', (' +
        q[1].toFixed(a) + ', ' +
        q[2].toFixed(a) + ', ' +
        q[3].toFixed(a) + '))'
    );
}

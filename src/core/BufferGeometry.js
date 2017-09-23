import { Vector3 } from '../math/Vector3';
import { Box3 } from '../math/Box3';
import { EventDispatcher } from './EventDispatcher';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute';
import { Sphere } from '../math/Sphere';
import { SceneNode } from './SceneNode';
import { Matrix4 } from '../math/Matrix4';
import { Matrix3 } from '../math/Matrix3';
import { _Math } from '../math/Math';
import { arrayMax } from '../utils';

var geometryId = 0;

// WARNING: Attributes can be shared among geometries.
// however, when a geometry is disposed, all its attributes
// get released by the Renderer
// we may need a 'persist' boolean in the BufferAttribute to counter this.

function BufferGeometry() {
    this.id = geometryId++;

    this.uuid = _Math.generateUUID();

    this.index = null;
    this.wireframeIndex = null;
    this.attributes = {};

    this.morphAttributes = {};

    this.groups = [];

    // We should keep these for raycasting
    this.boundingBox = null;
    this.boundingSphere = null;

    this.drawRange = {
        start: 0,
        count: Infinity
    };
}

BufferGeometry.MaxIndex = 65535;

Object.assign(BufferGeometry.prototype, EventDispatcher.prototype, {

    constructor: BufferGeometry,

    isBufferGeometry: true,

    addGroup: function (start, count, materialIndex) {
        this.groups.push({
            start: start,
            count: count,
            materialIndex: materialIndex !== undefined ? materialIndex : 0
        });
    },

    // UNUSED
    clearGroups: function () {
        this.groups = [];
    },

    // UNUSED
    setDrawRange: function (start, count) {
        this.drawRange.start = start;
        this.drawRange.count = count;
    },

    applyMatrix: function () {
        var normalMatrix = new Matrix3();

        return function (matrix) {
            var position = this.attributes.position;
            if (position !== undefined) {
                matrix.applyToBufferAttribute(position);
                position.needsUpdate = true;
            }

            var normal = this.attributes.normal;
            if (normal !== undefined) {
                normalMatrix.getNormalMatrix(matrix);
                normalMatrix.applyToBufferAttribute(normal);
                normal.needsUpdate = true;
            }

            if (this.boundingBox !== null) {
                this.computeBoundingBox();
            }

            if (this.boundingSphere !== null) {
                this.computeBoundingSphere();
            }

            return this;
        };
    }(),

    rotateX: function () {
        // rotate geometry around world x-axis
        var m1 = new Matrix4();

        return function (angle) {
            m1.makeRotationX(angle);
            this.applyMatrix(m1);

            return this;
        };
    }(),

    rotateY: function () {
        // rotate geometry around world y-axis
        var m1 = new Matrix4();

        return function (angle) {
            m1.makeRotationY(angle);
            this.applyMatrix(m1);

            return this;
        };
    }(),

    rotateZ: function () {
        // rotate geometry around world z-axis
        var m1 = new Matrix4();

        return function (angle) {
            m1.makeRotationZ(angle);
            this.applyMatrix(m1);

            return this;
        };
    }(),

    translate: function () {
        // translate geometry
        var m1 = new Matrix4();

        return function translate(x, y, z) {
            m1.makeTranslation(x, y, z);
            this.applyMatrix(m1);

            return this;
        };
    }(),

    scale: function () {
        // scale geometry
        var m1 = new Matrix4();

        return function scale(x, y, z) {
            m1.makeScale(x, y, z);
            this.applyMatrix(m1);

            return this;
        };
    }(),

    lookAt: function () {
        var obj = new SceneNode();

        return function lookAt(vector) {
            obj.lookAt(vector);
            obj.updateMatrix();
            this.applyMatrix(obj.matrix);
        };
    }(),

    center: function () {
        this.computeBoundingBox();
        var offset = this.boundingBox.getCenter().negate();

        this.translate(offset.x, offset.y, offset.z);

        return offset;
    },

    computeBoundingBox: function () {
        if (this.boundingBox === null) {
            this.boundingBox = new Box3();
        }

        var position = this.attributes.position;
        if (position !== undefined) {
            this.boundingBox.setFromBufferAttribute(position);
        } else {
            this.boundingBox.makeEmpty();
        }

        if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
            console.error('THREE.BufferGeometry.computeBoundingBox: Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
        }
    },

    computeBoundingSphere: function () {
        var box = new Box3();
        var vector = new Vector3();

        return function computeBoundingSphere() {
            if (this.boundingSphere === null) {
                this.boundingSphere = new Sphere();
            }

            var position = this.attributes.position;
            if (position) {
                var center = this.boundingSphere.center;

                box.setFromBufferAttribute(position);
                box.getCenter(center);

                // hoping to find a boundingSphere with a radius smaller than the
                // boundingSphere of the boundingBox: sqrt(3) smaller in the best case

                var maxRadiusSq = 0;

                for (var i = 0, il = position.count; i < il; i++) {
                    vector.x = position.getX(i);
                    vector.y = position.getY(i);
                    vector.z = position.getZ(i);
                    maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(vector));
                }

                this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

                if (isNaN(this.boundingSphere.radius)) {
                    console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
                }
            }
        };
    }(),

    computeVertexNormals: function () {
        var index = this.index;
        var attributes = this.attributes;
        var groups = this.groups;

        if (attributes.position) {
            var positions = attributes.position.array;

            if (attributes.normal === undefined) {
                this.attributes.normal = new BufferAttribute(new Float32Array(positions.length), 3);
            } else {
                // reset existing normals to zero
                var array = attributes.normal.array;

                for (var i = 0, il = array.length; i < il; i++) {
                    array[i] = 0.0;
                }
            }

            var normals = attributes.normal.array;

            var vA, vB, vC;
            var pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
            var cb = new Vector3(), ab = new Vector3();

            // indexed elements
            if (index) {
                var indices = index.array;

                if (groups.length === 0) {
                    this.addGroup(0, indices.length);
                }

                for (var j = 0, jl = groups.length; j < jl; j++) {
                    var group = groups[j];

                    var start = group.start;
                    var count = group.count;

                    for (var i = start, il = start + count; i < il; i += 3) {
                        vA = indices[i + 0] * 3;
                        vB = indices[i + 1] * 3;
                        vC = indices[i + 2] * 3;

                        pA.fromArray(positions, vA);
                        pB.fromArray(positions, vB);
                        pC.fromArray(positions, vC);

                        cb.subVectors(pC, pB);
                        ab.subVectors(pA, pB);
                        cb.cross(ab);

                        normals[  vA  ] += cb.x;
                        normals[vA + 1] += cb.y;
                        normals[vA + 2] += cb.z;

                        normals[  vB  ] += cb.x;
                        normals[vB + 1] += cb.y;
                        normals[vB + 2] += cb.z;

                        normals[  vC  ] += cb.x;
                        normals[vC + 1] += cb.y;
                        normals[vC + 2] += cb.z;
                    }
                }
            } else {
                // non-indexed elements (unconnected triangle soup)
                for (var i = 0, il = positions.length; i < il; i += 9) {
                    pA.fromArray(positions, i);
                    pB.fromArray(positions, i + 3);
                    pC.fromArray(positions, i + 6);

                    cb.subVectors(pC, pB);
                    ab.subVectors(pA, pB);
                    cb.cross(ab);

                    normals[  i  ] = cb.x;
                    normals[i + 1] = cb.y;
                    normals[i + 2] = cb.z;

                    normals[i + 3] = cb.x;
                    normals[i + 4] = cb.y;
                    normals[i + 5] = cb.z;

                    normals[i + 6] = cb.x;
                    normals[i + 7] = cb.y;
                    normals[i + 8] = cb.z;
                }
            }

            this.normalizeNormals();

            attributes.normal.needsUpdate = true;
        }
    },

    normalizeNormals: function () {
        var normals = this.attributes.normal;

        for (var i = 0, il = normals.count; i < il; i++) {
            var x = normals.getX(i);
            var y = normals.getY(i);
            var z = normals.getZ(i);

            var n = 1.0 / Math.sqrt(x * x + y * y + z * z);

            normals.setXYZ(i, x * n, y * n, z * n);
        }

        // normals.needsUpdate = true; // Not sure why it's not here
    },

    merge: function (geometry, offset) {
        if (offset === undefined) offset = 0;

        for (var key in this.attributes) {
            if (geometry.attributes[key] === undefined) continue;

            var attribute1 = this.attributes[key];
            var attributeArray1 = attribute1.array;

            var attribute2 = geometry.attributes[key];
            var attributeArray2 = attribute2.array;

            var attributeSize = attribute2.itemSize;

            for (var i = 0, j = attributeSize * offset, il = attributeArray2.length; i < il; i++, j++) {
                attributeArray1[j] = attributeArray2[i];
            }
        }

        return this;
    },

    toNonIndexed: function () {
        if (this.index === null) {
            console.warn('THREE.BufferGeometry.toNonIndexed(): Geometry is already non-indexed.');
            return this;
        }

        var geometry2 = new BufferGeometry();

        var indices = this.index.array;
        var attributes = this.attributes;

        for (var name in attributes) {
            var attribute = attributes[name];

            var array = attribute.array;
            var itemSize = attribute.itemSize;

            var array2 = new array.constructor(indices.length * itemSize);

            var index = 0;
            var index2 = 0;

            for (var i = 0, il = indices.length; i < il; i++) {
                index = indices[i] * itemSize;

                for (var j = 0; j < itemSize; j++) {
                    array2[index2++] = array[index++];
                }
            }

            geometry2.addAttribute(name, new BufferAttribute(array2, itemSize));
        }

        return geometry2;
    },

    clone: function () {
        return new BufferGeometry().copy( this );
    },

	copy: function (source) {
        // reset
        this.index = null;
        this.attributes = {};
        this.morphAttributes = {};
        this.groups = [];
        this.boundingBox = null;
        this.boundingSphere = null;

        // index
        if (source.index !== null) {
            this.index = source.index.clone();
        }

        // attributes
        var attributes = source.attributes;
        for (var name in attributes) {
            var attribute = attributes[name];
            this.addAttribute(name, attribute.clone());
        }

        // morph attributes
        var morphAttributes = source.morphAttributes;
        for (var name in morphAttributes) {
            var array = [];
            var morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

            for (var i = 0, il = morphAttribute.length; i < il; i++) {
                array.push(morphAttribute[i].clone());
            }

            this.morphAttributes[name] = array;
        }

        // groups
        var groups = source.groups;
        for (var i = 0, il = groups.length; i < il; i++) {
            var group = groups[i];
            this.addGroup(group.start, group.count, group.materialIndex);
        }

        // bounding box
        var boundingBox = source.boundingBox;
        if (boundingBox !== null) {
            this.boundingBox = boundingBox.clone();
        }

        // bounding sphere
        var boundingSphere = source.boundingSphere;
        if (boundingSphere !== null) {
            this.boundingSphere = boundingSphere.clone();
        }

        // draw range
        this.drawRange.start = source.drawRange.start;
        this.drawRange.count = source.drawRange.count;

        return this;
    },

    // TODO: Remove this?
    dispose: function () {
        this.dispatchEvent({ type: 'dispose' });
    }

});


export { BufferGeometry };

/**
 * Uniforms of a program.
 * Those form a tree structure with a special top-level container for the root,
 * which you get by calling 'new WebGLUniforms( gl, program, renderer )'.
 *
 *
 * Properties of inner nodes including the top-level container:
 * .seq - array of nested uniforms
 * .map - nested uniforms by name
 *
 *
 * Methods of all nodes except the top-level container:
 *
 * .setValue( gl, value, [renderer] )
 *     uploads a uniform value(s)
 *     the 'renderer' parameter is needed for sampler uniforms
 *
 *
 * Static methods of the top-level container (renderer factorizations):
 *
 * .upload( gl, seq, values, renderer )
 *     sets uniforms in 'seq' to 'values[id].value'
 *
 * .seqWithValue( seq, values ) : filteredSeq
 *     filters 'seq' entries with corresponding entry in values
 *
 *
 * Methods of the top-level container (renderer factorizations):
 *
 * .setValue( gl, name, value )
 *     sets uniform with  name 'name' to 'value'
 *
 * .set( gl, obj, prop )
 *     sets uniform from object and property with same name than uniform
 *
 * .setOptional( gl, obj, prop )
 *     like .set for an optional property of the object
 */

// things to change:
// - try to cache uniform values and only update when necessary
// - use only Float32Array for colors, matrices and vectors
// - get rid of the needsUpdate parameter per uniform
// - do we really need to wrap WebGL calls inside functions?

// questions:
// If I do gl.uniform1f('u', 1.0), and then gl.useProgram(), do I need to do gl.uniform1f('u', 1.0) again?
// If afterwards I gl.useProgram() the first program but I changed the uniform in the second one, do I need to call gl.uniform1f again
// can I send a JS array to matrix4 uniform? Is it fast?
// Is it faster to computer with Float32Array or JS array?

// TODO:
// study the parsing of the uniforms

import { CubeTexture } from '../../textures/CubeTexture';
import { Texture } from '../../textures/Texture';

var emptyTexture = new Texture();
var emptyCubeTexture = new CubeTexture();

// --- Base for inner nodes (including the root) ---
function UniformContainer() {
    this.seq = [];
    this.map = {};
}

// --- Utilities ---

// Array Caches (provide typed arrays for temporary by size)
var arrayCacheF32 = [];
var arrayCacheI32 = [];

// Float32Array caches used for uploading Matrix uniforms
var mat4array = new Float32Array(16);
var mat3array = new Float32Array(9);

// Flattening for arrays of vectors and matrices
function flatten(array, nBlocks, blockSize) {
    var firstElem = array[0];

    if (firstElem <= 0 || firstElem > 0) return array;
    // unoptimized: ! isNaN( firstElem )
    // see http://jacksondunstan.com/articles/983

    var n = nBlocks * blockSize;
    var r = arrayCacheF32[n];

    if (r === undefined) {
        r = new Float32Array(n);
        arrayCacheF32[n] = r;
    }

    if (nBlocks !== 0) {
        firstElem.toArray(r, 0);

        for (var i = 1, offset = 0; i !== nBlocks; ++i) {
            offset += blockSize;
            array[i].toArray(r, offset);
        }
    }

    return r;
}

// Texture unit allocation
function allocTexUnits(renderer, n) {
    var r = arrayCacheI32[n];

    if (r === undefined) {
        r = new Int32Array(n);
        arrayCacheI32[n] = r;
    }

    for (var i = 0; i !== n; ++i) {
        r[i] = renderer.allocTextureUnit();
    }

    return r;
}

// --- Setters ---

// Note: Defining these methods externally, because they come in a bunch
// and this way their names minify.

// Single scalar
function setValue1f(gl, v) { gl.uniform1f(this.addr, v); }
function setValue1i(gl, v) { gl.uniform1i(this.addr, v); }

// Single float vector (from flat array or THREE.VectorN)
function setValue2fv(gl, v) {
    if (v.x === undefined) gl.uniform2fv(this.addr, v);
    else gl.uniform2f(this.addr, v.x, v.y);
}

function setValue3fv(gl, v) {
    if (v.x !== undefined) {
        gl.uniform3f(this.addr, v.x, v.y, v.z);
    } else if (v.r !== undefined) {
        gl.uniform3f(this.addr, v.r, v.g, v.b);
    } else {
        gl.uniform3fv(this.addr, v);
    }
}

function setValue4fv(gl, v) {
    if (v.x === undefined) gl.uniform4fv(this.addr, v);
    else gl.uniform4f(this.addr, v.x, v.y, v.z, v.w);
}

// Single matrix (from flat array or MatrixN)
function setValue2fm(gl, v) {
    gl.uniformMatrix2fv(this.addr, false, v.elements || v);
}

function setValue3fm(gl, v) {
    if (v.elements === undefined) {
        gl.uniformMatrix3fv(this.addr, false, v);
    } else {
        mat3array.set(v.elements); // Why?
        gl.uniformMatrix3fv(this.addr, false, mat3array);
    }
}

function Mtx4Cpy(dest, src) {
    dest[ 0] = src[ 0]; dest[ 1] = src[ 1]; dest[ 2] = src[ 2]; dest[ 3] = src[ 3];
    dest[ 4] = src[ 4]; dest[ 5] = src[ 5]; dest[ 6] = src[ 6]; dest[ 7] = src[ 7];
    dest[ 8] = src[ 8]; dest[ 9] = src[ 9]; dest[10] = src[10]; dest[11] = src[11];
    dest[12] = src[12]; dest[13] = src[13]; dest[14] = src[14]; dest[15] = src[15];
}

function setValue4fm(gl, v) {
    if (v.elements === undefined) {
        gl.uniformMatrix4fv(this.addr, false, v);
    } else {
        Mtx4Cpy(mat4array, v.elements);
        // mat4array.set(v.elements); // Why?
        gl.uniformMatrix4fv(this.addr, false, mat4array);
    }
}

// Single texture (2D / Cube)
function setValueT1(gl, v, renderer) {
    var unit = renderer.allocTextureUnit();
    gl.uniform1i(this.addr, unit);
    renderer.setTexture(v || emptyTexture, unit);
}

// Integer / Boolean vectors or arrays thereof (always flat arrays)
function setValue2iv(gl, v) { gl.uniform2iv(this.addr, v); }
function setValue3iv(gl, v) { gl.uniform3iv(this.addr, v); }
function setValue4iv(gl, v) { gl.uniform4iv(this.addr, v); }

// Helper to pick the right setter for the singular case
function getSingularSetter(type) {
    switch (type) {
        case 0x1406: return setValue1f; // FLOAT
        case 0x8b50: return setValue2fv; // _VEC2
        case 0x8b51: return setValue3fv; // _VEC3
        case 0x8b52: return setValue4fv; // _VEC4

        case 0x8b5a: return setValue2fm; // _MAT2
        case 0x8b5b: return setValue3fm; // _MAT3
        case 0x8b5c: return setValue4fm; // _MAT4

        case 0x8b5e: return setValueT1; // SAMPLER_2D

        case 0x1404: case 0x8b56: return setValue1i; // INT, BOOL
        case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
        case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
        case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
    }
}

// Array of scalars
function setValue1fv(gl, v) { gl.uniform1fv(this.addr, v); }
function setValue1iv(gl, v) { gl.uniform1iv(this.addr, v); }

// Array of vectors (flat or from THREE classes)
function setValueV2a(gl, v) {
    gl.uniform2fv(this.addr, flatten(v, this.size, 2));
}

function setValueV3a(gl, v) {
    gl.uniform3fv(this.addr, flatten(v, this.size, 3));
}

function setValueV4a(gl, v) {
    gl.uniform4fv(this.addr, flatten(v, this.size, 4));
}

// Array of matrices (flat or from THREE clases)
function setValueM2a(gl, v) {
    gl.uniformMatrix2fv(this.addr, false, flatten(v, this.size, 4));
}

function setValueM3a(gl, v) {
    gl.uniformMatrix3fv(this.addr, false, flatten(v, this.size, 9));
}

function setValueM4a(gl, v) {
    gl.uniformMatrix4fv(this.addr, false, flatten(v, this.size, 16));
}

// Array of textures (2D / Cube)
function setValueT1a(gl, v, renderer) {
    var n = v.length;
    var units = allocTexUnits(renderer, n);

    gl.uniform1iv(this.addr, units);

    for (var i = 0; i < n; i++) {
        renderer.setTexture(v[i] || emptyTexture, units[i]);
    }
}

// function setValueT1a(gl, v) {
//     for (var i = 0, il = v.length; i < il; i++) {
//         if (v[i] !== t1a[i]) {
//             gl.uniform1iv(this.addr, v);
//             for (; i < il; i++) {
//                 t1a[i] = v[i];
//             }
//             return;
//         }
//     }
// }
//
// NOTE: The initial active texture slot is 0
// see https://www.khronos.org/webgl/wiki/Reference:activeTexture
// function setValueTexs(gl, textures, renderer) {
//     for (var i = 0, il = textures.length; i < il; i++) {
//         var texture = textures[i];
//         if (texture.properties.slot !== null) {
//             _slots[i] = texture.__infos.slot;
//         } else {
//             texture.properties.slot = currentTextureSlot;
//             currentSlots[i].properties.slot = null;
//             currentSlots[i] = texture;
//
//             _slots[i] = currentTextureSlot;
//             renderer.setTexture(texture, currentTextureSlot);
//
//             currentTextureSlot++;
//             if (currentTextureSlot > maxTextures) {
//                 currentTextureSlot = 0;
//             }
//         }
//     }
//     setValueT1a(this.addr, _slots);
// }

// Helper to pick the right setter for a pure (bottom-level) array
function getPureArraySetter(type) {
    switch (type) {
        case 0x1406: return setValue1fv; // FLOAT
        case 0x8b50: return setValueV2a; // _VEC2
        case 0x8b51: return setValueV3a; // _VEC3
        case 0x8b52: return setValueV4a; // _VEC4

        case 0x8b5a: return setValueM2a; // _MAT2
        case 0x8b5b: return setValueM3a; // _MAT3
        case 0x8b5c: return setValueM4a; // _MAT4

        case 0x8b5e: return setValueT1a; // SAMPLER_2D

        case 0x1404: case 0x8b56: return setValue1iv; // INT, BOOL
        case 0x8b53: case 0x8b57: return setValue2iv; // _VEC2
        case 0x8b54: case 0x8b58: return setValue3iv; // _VEC3
        case 0x8b55: case 0x8b59: return setValue4iv; // _VEC4
    }
}

// --- Uniform Classes ---

function SingleUniform(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;
    this.setValue = getSingularSetter(activeInfo.type);
    // this.cachedValue
    // Not sure the value should be cached here...
    // this.path = activeInfo.name; // DEBUG
}

function PureArrayUniform(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;
    this.size = activeInfo.size;
    this.setValue = getPureArraySetter(activeInfo.type);
    // this.cachedValue
    // Not sure the value should be cached here...
    // this.path = activeInfo.name; // DEBUG
}

function StructuredUniform(id) {
    this.id = id;
    UniformContainer.call(this); // mix-in
}

StructuredUniform.prototype.setValue = function (gl, value) {
    // Note: Don't need an extra 'renderer' parameter, since samplers
    // are not allowed in structured uniforms.
    for (var i = 0, il = this.seq.length; i < il; i++) {
        var u = this.seq[i];
        u.setValue(gl, value[u.id]);
    }
};

// --- Top-level ---

// Parser - builds up the property tree from the path strings
var RePathPart = /([\w\d_]+)(\])?(\[|\.)?/g;

// extracts
// 	- the identifier (member name or array index)
//  - followed by an optional right bracket (found when array index)
//  - followed by an optional left bracket or dot (type of subscript)
//
// Note: These portions can be read in a non-overlapping fashion and
// allow straightforward parsing of the hierarchy that WebGL encodes
// in the uniform names.

function addUniform(container, uniformObject) {
    container.seq.push(uniformObject);
    container.map[uniformObject.id] = uniformObject;
}

function parseUniform(activeInfo, addr, container) {
    var path = activeInfo.name;
    var pathLength = path.length;

    // reset RegExp object, because of the early exit of a previous run
    RePathPart.lastIndex = 0;

    for (;;) {
        var match = RePathPart.exec(path);
        var matchEnd = RePathPart.lastIndex;

        var id = match[1];
        var idIsIndex = match[2] === ']';
        var subscript = match[3];

        if (idIsIndex) id = id | 0; // convert to integer

        if (subscript === undefined || subscript === '[' && matchEnd + 2 === pathLength) {
            // bare name or "pure" bottom-level array "[0]" suffix
            addUniform(container, subscript === undefined ? new SingleUniform(id, activeInfo, addr) : new PureArrayUniform(id, activeInfo, addr));
            break;
        } else {
            // step into inner node / create it in case it doesn't exist
            var map = container.map;
            var next = map[id];

            if (next === undefined) {
                next = new StructuredUniform(id);
                addUniform(container, next);
            }

            container = next;
        }
    }
}

// Root Container

function WebGLUniforms(gl, program, renderer) {
    UniformContainer.call(this);

    this.renderer = renderer;

    var n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (var i = 0; i < n; i++) {
        var info = gl.getActiveUniform(program, i);
        var path = info.name;
        var addr = gl.getUniformLocation(program, path);

        parseUniform(info, addr, this);
    }
}

WebGLUniforms.prototype.setValue = function (gl, name, value) {
    var u = this.map[name];
    if (u !== undefined) u.setValue(gl, value, this.renderer);
};

WebGLUniforms.prototype.setOptional = function (gl, object, name) {
    var v = object[name];
    if (v !== undefined) this.setValue(gl, name, v);
};


// Static interface
WebGLUniforms.upload = function (gl, seq, values, renderer) {
    for (var i = 0, il = seq.length; i < il; i++) {
        var u = seq[i];
        var v = values[u.id];

        if (v.needsUpdate !== false) {
            // note: always updating when .needsUpdate is undefined
            u.setValue(gl, v.value, renderer);
        }
    }
};

WebGLUniforms.seqWithValue = function (seq, values) {
    var r = [];

    for (var i = 0, il = seq.length; i < il; i++) {
        var u = seq[i];
        if (u.id in values) r.push(u);
    }

    return r;
};

export { WebGLUniforms };

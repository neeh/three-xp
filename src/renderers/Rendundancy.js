var _enabledVertexAttribute = new Int8Array(0, 0, 0, 0, 0, 0, 0, 0);
var _vertexAttribPointers = new Int32Array(-1, -1, -1, -1, -1, -1, -1, -1);
var _arrayBufferBinding = null;
var _elementBufferBinding = null;


// When the program ends, we have to reset all caches (because location may have changed)
// ou alors le state recoit directement le layout du program:
// {'position': 0, 'uv': 1}
// du coup il sait si ça a changé... ça a l'air pas mal

function vertexAttribPointer(buffer, attrib) {
    var loc = attrib.location;
    if (_vertexAttribPointers[loc] !== buffer.id) {
        bindBuffer(buffer);
        gl.vertexAttribPointer(loc, ...);
        _vertexAttribPointers[loc] = buffer.id;
    }
}

function intlVertexAttribPointer() {
    if ()
}

function clearVertexAttribPointers() {
    _vertexAttribPointers[0] = -1;
    _vertexAttribPointers[1] = -1;
    _vertexAttribPointers[2] = -1;
    _vertexAttribPointers[3] = -1;
    _vertexAttribPointers[4] = -1;
    _vertexAttribPointers[5] = -1;
    _vertexAttribPointers[6] = -1;
    _vertexAttribPointers[7] = -1;
}


function bindBuffer(buffer) {
    if (_arrayBufferBinding !== buffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        _arrayBufferBinding = buffer;
    }
}

function bindElementBuffer(buffer) {
    if (_elementBufferBinding !== buffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        _elementBufferBinding = buffer;
    }
}

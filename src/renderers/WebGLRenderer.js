import { REVISION, MaxEquation, MinEquation, RGB_ETC1_Format, RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format, RGBA_S3TC_DXT5_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT1_Format, RGB_S3TC_DXT1_Format, SrcAlphaSaturateFactor, OneMinusDstColorFactor, DstColorFactor, OneMinusDstAlphaFactor, DstAlphaFactor, OneMinusSrcAlphaFactor, SrcAlphaFactor, OneMinusSrcColorFactor, SrcColorFactor, OneFactor, ZeroFactor, ReverseSubtractEquation, SubtractEquation, AddEquation, DepthFormat, DepthStencilFormat, LuminanceAlphaFormat, LuminanceFormat, RGBAFormat, RGBFormat, AlphaFormat, HalfFloatType, FloatType, UnsignedIntType, IntType, UnsignedShortType, ShortType, ByteType, UnsignedInt248Type, UnsignedShort565Type, UnsignedShort5551Type, UnsignedShort4444Type, UnsignedByteType, LinearMipMapLinearFilter, LinearMipMapNearestFilter, LinearFilter, NearestMipMapLinearFilter, NearestMipMapNearestFilter, NearestFilter, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping, FrontFaceDirectionCW, NoBlending, BackSide, TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode, NoColors, FlatShading, LinearToneMapping } from '../constants';
import { _Math } from '../math/Math';
import { Matrix4 } from '../math/Matrix4';
import { DataTexture } from '../textures/DataTexture';
import { WebGLUniforms } from './webgl/WebGLUniforms';
// import { Mesh } from '../objects/Mesh';
// import { PerspectiveCamera } from '../cameras/PerspectiveCamera';
// import { OrthographicCamera } from '../cameras/OrthographicCamera';
import { WebGLAttributes } from './webgl/WebGLAttributes';
import { WebGLRenderLists } from './webgl/WebGLRenderLists';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer';
import { WebGLGeometries } from './webgl/WebGLGeometries';
import { WebGLObjects } from './webgl/WebGLObjects';
import { WebGLPrograms } from './webgl/WebGLPrograms';
import { WebGLTextures } from './webgl/WebGLTextures';
import { WebGLProperties } from './webgl/WebGLProperties';
import { WebGLState } from './webgl/WebGLState';
import { WebGLCapabilities } from './webgl/WebGLCapabilities';
import { BufferGeometry } from '../core/BufferGeometry';
import { WebGLExtensions } from './webgl/WebGLExtensions';
import { Vector3 } from '../math/Vector3';
import { Frustum } from '../math/Frustum';
import { Vector4 } from '../math/Vector4';
import { Color } from '../math/Color';


function WebGLRenderer(parameters) {
  parameters = parameters || {};

  var _canvas = parameters.canvas !== undefined ? parameters.canvas : document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  var _context = parameters.context !== undefined ? parameters.context : null;

  var _alpha = parameters.alpha !== undefined ? parameters.alpha : false;
  var _depth = parameters.depth !== undefined ? parameters.depth : true;
  var _stencil = parameters.stencil !== undefined ? parameters.stencil : true;
  var _antialias = parameters.antialias !== undefined ? parameters.antialias : false;
  var _premultipliedAlpha = parameters.premultipliedAlpha !== undefined ? parameters.premultipliedAlpha : true;
  var _preserveDrawingBuffer = parameters.preserveDrawingBuffer !== undefined ? parameters.preserveDrawingBuffer : false;

  // This counter is incremented every time the WebGL context is lost
  // WebGL object should be synchronized with the counter
  var _glVersion = 1;

  // var lights = [];

  var currentRenderList = null;

  var morphInfluences = new Float32Array(8);

  // public properties
  this.domElement = _canvas;
  this.context = null;

  // clearing
  this.autoClear = true;
  this.autoClearColor = true;
  this.autoClearDepth = true;
  this.autoClearStencil = true;

  // scene graph
  this.sortObjects = true;

  // gamma correction
  this.gammaFactor = 2.0; // for backwards compatibility
  // this.gammaInput = false;
  // this.gammaOutput = false;

  // physical lights
  // this.physicallyCorrectLights = false;

  // tone mapping
  // this.toneMapping = LinearToneMapping;
  // this.toneMappingExposure = 1.0;
  // this.toneMappingWhitePoint = 1.0;

  // morphs
  this.maxMorphTargets = 8;
  this.maxMorphNormals = 4;

  // internal properties
  var _this = this;

  // internal state cache

  var _currentProgram = null;
  var _currentRenderTarget = null;
  var _currentFramebuffer = null;
  var _currentMaterialId = -1;
  var _currentGeometryProgram = '';
  var _currentCamera = null;

  var _currentScissor = new Vector4();
  var _currentScissorTest = null;

  var _currentViewport = new Vector4();

  //

  var _usedTextureUnits = 0;

  //

  var _clearColor = new Color(0x000000);
  var _clearAlpha = 0;

  var _width = _canvas.width;
  var _height = _canvas.height;

  var _pixelRatio = 1;

  var _scissor = new Vector4(0, 0, _width, _height);
  var _scissorTest = false;

  var _viewport = new Vector4(0, 0, _width, _height);

  // frustum

  var _frustum = new Frustum();

  // camera matrices cache

  var _projScreenMatrix = new Matrix4();

  var _vector3 = new Vector3();
  var _matrix4 = new Matrix4();
  var _matrix42 = new Matrix4();

  // // light arrays cache
  // var _lights = {
  //   hash: '',
  //
  //   ambient:                 [0, 0, 0],
  //   directional:             [],
  //   directionalShadowMap:    [],
  //   directionalShadowMatrix: [],
  //   spot:                    [],
  //   spotShadowMap:           [],
  //   spotShadowMatrix:        [],
  //   rectArea:                [],
  //   point:                   [],
  //   pointShadowMap:          [],
  //   pointShadowMatrix:       [],
  //   hemi:                    [],
  //
  //   shadows:                 []
  // };

  // info
  var _infoMemory = {
    geometries: 0,
    textures:   0
  };
  var _infoRender = {
    frame:    0,
    calls:    0,
    vertices: 0,
    faces:    0,
    points:   0
  };
  this.info = {
    render:   _infoRender,
    memory:   _infoMemory,
    programs: null
  };

  // initialize
  var _gl;
  try {
    var contextAttributes = {
      alpha:                 _alpha,
      depth:                 _depth,
      stencil:               _stencil,
      antialias:             _antialias,
      premultipliedAlpha:    _premultipliedAlpha,
      preserveDrawingBuffer: _preserveDrawingBuffer
    };

    _gl = _context || _canvas.getContext('webgl', contextAttributes) || _canvas.getContext('experimental-webgl', contextAttributes);
    if (_gl === null) {
      if (_canvas.getContext('webgl') !== null) {
        throw 'Error creating WebGL context with your selected attributes.';
      } else {
        throw 'Error creating WebGL context.';
      }
    }

    // Some experimental-webgl implementations do not have getShaderPrecisionFormat
    if (_gl.getShaderPrecisionFormat === undefined) {
      _gl.getShaderPrecisionFormat = function () {
        return {
          'rangeMin':  1,
          'rangeMax':  1,
          'precision': 1
        };
      };
    }

    _canvas.addEventListener('webglcontextlost', onContextLost, false);
  } catch (error) {
    console.error('THREE.WebGLRenderer: ' + error);
  }

  var extensions = new WebGLExtensions(_gl);
  extensions.get('WEBGL_depth_texture');
  extensions.get('OES_texture_float');
  extensions.get('OES_texture_float_linear');
  extensions.get('OES_texture_half_float');
  extensions.get('OES_texture_half_float_linear');
  extensions.get('OES_standard_derivatives');
  extensions.get('ANGLE_instanced_arrays');

  if (extensions.get('OES_element_index_uint')) {
    BufferGeometry.MaxIndex = 4294967296;
  }

  var capabilities = new WebGLCapabilities(_gl, extensions, parameters);

  var state = new WebGLState(_gl, extensions, paramThreeToGL);

  var properties = new WebGLProperties();
  var textures = new WebGLTextures(_gl, extensions, state, properties, capabilities, paramThreeToGL, _infoMemory);
  var attributes = new WebGLAttributes(_gl);
  var geometries = new WebGLGeometries(_gl, attributes, _infoMemory);
  var objects = new WebGLObjects(_gl, geometries, _infoRender);
  var programCache = new WebGLPrograms(this, capabilities);
  // var lightCache = new WebGLLights();
  var renderLists = new WebGLRenderLists();

  this.info.programs = programCache.programs;

  var bufferRenderer = new WebGLBufferRenderer(_gl, extensions, _infoRender);
  var indexedBufferRenderer = new WebGLIndexedBufferRenderer(_gl, extensions, _infoRender);

  //

  // Not used anymore?
  // var backgroundPlaneCamera, backgroundPlaneMesh;
  // var backgroundBoxCamera, backgroundBoxMesh;

  //

  function getTargetPixelRatio() {
    return _currentRenderTarget === null ? _pixelRatio : 1;
  }

  function setDefaultGLState() {
    state.init();

    state.scissor(_currentScissor.copy(_scissor).multiplyScalar(_pixelRatio));
    state.viewport(_currentViewport.copy(_viewport).multiplyScalar(_pixelRatio));

    state.buffers.color.setClear(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha, _premultipliedAlpha);
  }

  function resetGLState() {
    _currentProgram = null;
    _currentCamera = null;

    _currentGeometryProgram = '';
    _currentMaterialId = - 1;

    state.reset();
  }

  setDefaultGLState();

  this.context = _gl;
  this.capabilities = capabilities;
  this.extensions = extensions;
  this.properties = properties;
  this.state = state;

  // API

  this.getContext = function () {
    return _gl;
  };

  this.getContextAttributes = function () {
    return _gl.getContextAttributes();
  };

  this.forceContextLoss = function () {
    var extension = extensions.get('WEBGL_lose_context');
    if (extension) extension.loseContext();
  };

  this.getMaxAnisotropy = function () {
    return capabilities.getMaxAnisotropy();
  };

  this.getPrecision = function () {
    return capabilities.precision;
  };

  this.getPixelRatio = function () {
    return _pixelRatio;
  };

  this.setPixelRatio = function (value) {
    if (value === undefined) return;
    _pixelRatio = value;
    this.setSize(_viewport.z, _viewport.w, false);
  };

  this.getSize = function () {
    return {
      width: _width,
      height: _height
    };
  };

  this.setSize = function (width, height, updateStyle) {
    _width = width;
    _height = height;

    _canvas.width = width * _pixelRatio;
    _canvas.height = height * _pixelRatio;

    if (updateStyle !== false) {
      _canvas.style.width = width + 'px';
      _canvas.style.height = height + 'px';
    }

    this.setViewport(0, 0, width, height);
  };

  this.setViewport = function (x, y, width, height) {
    state.viewport(_viewport.set(x, y, width, height));
  };

  this.setScissor = function (x, y, width, height) {
    state.scissor(_scissor.set(x, y, width, height));
  };

  this.setScissorTest = function (boolean) {
    state.setScissorTest(_scissorTest = boolean);
  };

  // Clearing

  this.getClearColor = function () {
    return _clearColor;
  };

  this.setClearColor = function (color, alpha) {
    _clearColor.set(color);
    _clearAlpha = alpha !== undefined ? alpha : 1;
    state.buffers.color.setClear(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha, _premultipliedAlpha);
  };

  this.getClearAlpha = function () {
    return _clearAlpha;
  };

  this.setClearAlpha = function (alpha) {
    _clearAlpha = alpha;
    state.buffers.color.setClear(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha, _premultipliedAlpha);
  };

  this.clear = function (color, depth, stencil) {
    var bits = 0;

    if (color === undefined || color) bits |= _gl.COLOR_BUFFER_BIT;
    if (depth === undefined || depth) bits |= _gl.DEPTH_BUFFER_BIT;
    if (stencil === undefined || stencil) bits |= _gl.STENCIL_BUFFER_BIT;

    _gl.clear(bits);
  };

  this.clearColor = function () {
    this.clear(true, false, false);
  };

  this.clearDepth = function () {
    this.clear(false, true, false);
  };

  this.clearStencil = function () {
    this.clear(false, false, true);
  };

  this.clearTarget = function (renderTarget, color, depth, stencil) {
    this.setRenderTarget(renderTarget);
    this.clear(color, depth, stencil);
  };

  // Reset

  this.resetGLState = resetGLState;

  this.dispose = function () {
    _canvas.removeEventListener('webglcontextlost', onContextLost, false);
    renderLists.dispose();
  };

  // Events
  this.onContextLost = onContextLost; // TEMP
  function onContextLost(event) {
    event.preventDefault();

    resetGLState();
    setDefaultGLState();

    properties.clear(); // TEMP
    objects.clear(); // TEMP

    _glVersion++;
  }

  function onMaterialDispose(event) {
    var material = event.target;

    material.removeEventListener('dispose', onMaterialDispose);
    deallocateMaterial(material);
  }

  // Buffer deallocation
  function deallocateMaterial(material) {
    releaseMaterialProgramReference(material);
    properties.remove(material);
  }

  function releaseMaterialProgramReference(material) {
    var programInfo = material.properties.program;
    material.program = undefined;

    if (programInfo !== undefined) {
      programCache.releaseProgram(programInfo);
    }
  }

  // handler to sort morphTargetInfluences
  function absNumericalSort(a, b) {
    return Math.abs(b[0]) - Math.abs(a[0]);
  }

  // Buffer rendering
  this.renderBufferDirect = function (camera, geometry, material, object, group) {
    state.setMaterial(material);

    // TODO: WIP
    // var materialState = material.state;
    // if (materialState.hash !== _currentStateHash) {
    //   state.setState(materialState);
    //   _currentStateHash = materialState.hash;
    // }

    var program = setProgram(camera, material, object);
    var geometryProgram = geometry.id + '_' + program.id + '_' + (material.wireframe === true);

    var updateBuffers = false;

    if (geometryProgram !== _currentGeometryProgram) {
      _currentGeometryProgram = geometryProgram;
      updateBuffers = true;
    }

    // morph targets

    // var morphTargetInfluences = object.morphTargetInfluences;
    // if (morphTargetInfluences !== undefined) {
    //   // TODO Remove allocations
    //   var activeInfluences = [];
    //
    //   for (var i = 0, l = morphTargetInfluences.length; i < l; i++) {
    //     var influence = morphTargetInfluences[i];
    //     activeInfluences.push([influence, i]);
    //   }
    //
    //   activeInfluences.sort(absNumericalSort);
    //
    //   if (activeInfluences.length > 8) {
    //     activeInfluences.length = 8;
    //   }
    //
    //   var morphAttributes = geometry.morphAttributes;
    //
    //   for (var i = 0, l = activeInfluences.length; i < l; i++) {
    //     var influence = activeInfluences[i];
    //     var morphInfluences[i] = influence[0];
    //
    //     if (influence[0] !== 0) {
    //       var index = influence[1];
    //       if (material.morphTargets === true && morphAttributes.position) geometry.attributes['morphTarget' + i] = morphAttributes.position[index];
    //       if (material.morphNormals === true && morphAttributes.normal) geometry.attributes['morphNormal' + i] = morphAttributes.normal[index];
    //     } else {
    //       if (material.morphTargets === true) delete geometry.attributes['morphTarget' + i];
    //       if (material.morphNormals === true) delete geometry.attributes['morphNormal' + i];
    //     }
    //   }
    //
    //   for (var i = activeInfluences.length, il = morphInfluences.length; i < il; i++) {
    //     morphInfluences[i] = 0.0;
    //   }
    //
    //   program.getUniforms().setValue(_gl, 'morphTargetInfluences', morphInfluences);
    //
    //   updateBuffers = true;
    // }

    //

    var index = geometry.index;
    var position = geometry.attributes.position;
    var rangeFactor = 1;

    if (material.wireframe === true) {
      index = geometries.getWireframeAttribute(geometry);
      rangeFactor = 2;
    }

    var renderer = bufferRenderer;

    if (index !== null) {
      renderer = indexedBufferRenderer;
      renderer.setIndex(index);
    }

    if (updateBuffers) {
      setupVertexAttributes(program, geometry);
      if (index !== null) {
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer);
      }
    }

    //

    var dataCount = 0;

    if (index !== null) {
      dataCount = index.count;
    } else if (position !== undefined) {
      dataCount = position.count;
    }

    var rangeStart = geometry.drawRange.start * rangeFactor;
    var rangeCount = geometry.drawRange.count * rangeFactor;

    var groupStart = group !== null ? group.start * rangeFactor : 0;
    var groupCount = group !== null ? group.count * rangeFactor : Infinity;

    var drawStart = Math.max(rangeStart, groupStart);
    var drawEnd = Math.min(dataCount, rangeStart + rangeCount, groupStart + groupCount) - 1;

    var drawCount = Math.max(0, drawEnd - drawStart + 1);

    if (drawCount === 0) return;

    //

    if (object.isMesh) {
      if (material.wireframe === true) {
        state.setLineWidth(material.wireframeLinewidth * getTargetPixelRatio());
        renderer.setMode(_gl.LINES);
      } else {
        switch (object.drawMode) {
          case TrianglesDrawMode:     renderer.setMode(_gl.TRIANGLES);      break;
          case TriangleStripDrawMode: renderer.setMode(_gl.TRIANGLE_STRIP); break;
          case TriangleFanDrawMode:   renderer.setMode(_gl.TRIANGLE_FAN);   break;
        }
      }

    } else if (object.isLine) {
      var lineWidth = material.linewidth;
      if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material

      state.setLineWidth(lineWidth * getTargetPixelRatio());
      if (object.isLineSegments) {
        renderer.setMode(_gl.LINES);
      } else if (object.isLineLoop) {
        renderer.setMode(_gl.LINE_LOOP);
      } else {
        renderer.setMode(_gl.LINE_STRIP);
      }

    } else if (object.isPoints) {
      renderer.setMode(_gl.POINTS);
    }

    if (geometry && geometry.isInstancedBufferGeometry) {
      if (geometry.maxInstancedCount > 0) {
        renderer.renderInstances(geometry, drawStart, drawCount);
      }
    } else {
      renderer.render(drawStart, drawCount);
    }
  };

  function setupVertexAttributes(program, geometry, startIndex) {
    if (geometry && geometry.isInstancedBufferGeometry) {
      if (extensions.get('ANGLE_instanced_arrays') === null) {
        console.error('THREE.WebGLRenderer.setupVertexAttributes: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
        return;
      }
    }

    if (startIndex === undefined) startIndex = 0;

    state.initAttributes();

    var geometryAttributes = geometry.attributes;
    var programAttributes = program.getAttributes();

    for (var name in programAttributes) {
      var programAttribute = programAttributes[ name ];
      if (programAttribute >= 0) {
        var geometryAttribute = geometryAttributes[name];
        if (geometryAttribute !== undefined) {
          var normalized = geometryAttribute.normalized;
          var size = geometryAttribute.itemSize;

          var attributeProperties = attributes.get(geometryAttribute);

          var buffer = attributeProperties.buffer;
          var type = attributeProperties.type;
          var bytesPerElement = attributeProperties.bytesPerElement;

          if (geometryAttribute.isInterleavedBufferAttribute) {
            var data = geometryAttribute.data;
            var stride = data.stride;
            var offset = geometryAttribute.offset;

            if (data && data.isInstancedInterleavedBuffer) {
              state.enableAttributeAndDivisor(programAttribute, data.meshPerAttribute);
              if (geometry.maxInstancedCount === undefined) {
                geometry.maxInstancedCount = data.meshPerAttribute * data.count;
              }
            } else {
              state.enableAttribute(programAttribute);
            }

            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
            _gl.vertexAttribPointer(programAttribute, size, type, normalized, stride * bytesPerElement, (startIndex * stride + offset) * bytesPerElement);
          } else {
            if (geometryAttribute.isInstancedBufferAttribute) {
              state.enableAttributeAndDivisor(programAttribute, geometryAttribute.meshPerAttribute);
              if (geometry.maxInstancedCount === undefined) {
                geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;
              }
            } else {
              state.enableAttribute(programAttribute);
            }

            _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
            _gl.vertexAttribPointer(programAttribute, size, type, normalized, 0, startIndex * size * bytesPerElement);
          }
        } else {
          console.log('THREE.WebGLRenderer: No attribute defined for "' + name + '"', geometryAttribute);
        }
      }
    }
    state.disableUnusedAttributes();
  }

  // Compile
  this.compile = function (scene, camera) {
    var i, il = scene.children.length;

    // lights = [];
    // for (i = 0; i < il; i++) {
    //   if (scene.children[i].isLight) {
    //     lights.push(scene.children[i]);
    //   }
    // }
    // setupLights(lights, camera);

    for (i = 0; i < il; i++) {
      var node = scene.children[i];
      if (node.material) {
        if (Array.isArray(node.material)) {
          for (var j = 0, jl = node.material.length; j < jl; j++) {
            initMaterial(node.material[i]);
          }
        } else {
          initMaterial(node.material);
        }
      }
    }
  };

  // Rendering
  this.render = function (scene, camera, renderTarget, forceClear) {
    // reset caching for this frame
    _currentGeometryProgram = '';
    _currentMaterialId = -1;
    _currentCamera = null;

    // update scene graph
    // scene.updateMatrixWorld();

    // update camera matrices and frustum

    // camera.onBeforeRender(_this);

    if (camera.parent === null) camera.updateMatrixWorld();

    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromMatrix(_projScreenMatrix);

    // lights.length = 0;

    currentRenderList = renderLists.get(scene, camera);
    currentRenderList.init();

    projectObject(scene, camera, _this.sortObjects);

    currentRenderList.finish();

    if (_this.sortObjects === true) {
      currentRenderList.sort();
    }

    // setupShadows(lights);

    // shadowMap.render(scene, camera);

    // setupLights(lights, camera);

    _infoRender.frame ++;
    _infoRender.calls = 0;
    _infoRender.vertices = 0;
    _infoRender.faces = 0;
    _infoRender.points = 0;

    if (renderTarget === undefined) {
      renderTarget = null;
    }

    this.setRenderTarget(renderTarget);

    state.buffers.color.setClear(_clearColor.r, _clearColor.g, _clearColor.b, _clearAlpha, _premultipliedAlpha);

    if (this.autoClear || forceClear) {
      this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
    }

    var opaqueObjects = currentRenderList.opaque;
    var transparentObjects = currentRenderList.transparent;

    // opaque pass (front-to-back order)
    if (opaqueObjects.length) renderObjects(opaqueObjects, camera);

    // transparent pass (back-to-front order)
    if (transparentObjects.length) renderObjects(transparentObjects, camera);

    // Generate mipmap if we're using any kind of mipmap filtering
    if (renderTarget) {
      textures.updateRenderTargetMipmap(renderTarget);
    }

    // Ensure depth buffer writing is enabled so it can be cleared on next render
    state.buffers.depth.setTest(true);
    state.buffers.depth.setMask(true);
    state.buffers.color.setMask(true);

    // if (camera.isArrayCamera && camera.enabled) {
    //   _this.setScissorTest(false);
    // }
    //
    // camera.onAfterRender(_this);
    //
    // _gl.finish();
    // TODO: ^ Why is _gl.finish() commented out?
  };

  function projectObject(object, camera, sortObjects) {
    if (!object.visible) return;

    // var visible = object.layers.test(camera.layers);
    // if (visible) {
    //   if (object.isLight) {
    //     lights.push(object);
    //
    //   } else if (object.isSprite) {
    //     sprites.push(object);
    //
    //   } else if (object.isLensFlare) {
    //     lensFlares.push(object);
    //
    //   } else if (object.isImmediateRenderObject) {
    //     if (sortObjects) {
    //       _vector3.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
    //     }
    //     currentRenderList.push(object, null, object.material, _vector3.z, null);
    //
    //   } else if (object.isMesh || object.isLine || object.isPoints) {

    if (object.isMesh) {
      if (object.isSkinnedMesh) {
        object.skeleton.update();
      }

      if (sortObjects) {
        _vector3.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
      }

      var geometry = objects.update(object);
      var material = object.material;

      if (Array.isArray(material)) {
        var groups = geometry.groups;
        for (var i = 0, il = groups.length; i < il; i++) {
          var group = groups[i];
          var groupMaterial = material[group.materialIndex];
          if (groupMaterial /*&& groupMaterial.visible*/) {
            currentRenderList.push(object, geometry, groupMaterial, _vector3.z, group);
          }
        }
      } else /*if (material.visible)*/ {
        currentRenderList.push(object, geometry, material, _vector3.z, null);
      }
    }

    //   }
    // }

    var children = object.children;
    for (var i = 0, il = children.length; i < il; i++) {
      projectObject(children[i], camera, sortObjects);
    }
  }

  function renderObjects(renderList, camera) {
    for (var i = 0, il = renderList.length; i < il; i++) {
      var renderItem = renderList[i];

      var object = renderItem.object;
      var geometry = renderItem.geometry;
      var material = renderItem.material;
      var group = renderItem.group;

      // object.onBeforeRender(_this, camera, geometry, material, group);

      // if (camera.isArrayCamera && camera.enabled) {
      //   var cameras = camera.cameras;
      //
      //   for (var j = 0, jl = cameras.length; j < jl; j++) {
      //     var camera2 = cameras[j];
      //     var bounds = camera2.bounds;
      //
      //     _this.setViewport(
      //       bounds.x * _width * _pixelRatio, bounds.y * _height * _pixelRatio,
      //       bounds.z * _width * _pixelRatio, bounds.w * _height * _pixelRatio
      //     );
      //     _this.setScissor(
      //       bounds.x * _width * _pixelRatio, bounds.y * _height * _pixelRatio,
      //       bounds.z * _width * _pixelRatio, bounds.w * _height * _pixelRatio
      //     );
      //     _this.setScissorTest(true);
      //
      //     renderObject(object, camera2, geometry, material, group);
      //   }
      // } else {
      renderObject(object, camera, geometry, material, group);
      // }

      // object.onAfterRender(_this, camera, geometry, material, group);
    }
  }

  function renderObject(object, camera, geometry, material, group) {
    object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
    object.normalMatrix.getNormalMatrix(object.modelViewMatrix); // TODO: Only if needed...

    _this.renderBufferDirect(camera, geometry, material, object, group);
  }

  function initMaterial(material) {
    var materialProperties = material.properties;

    var code = programCache.getProgramCode(material);

    var program = materialProperties.program;
    var programChange = false;

    if (materialProperties.glVersion !== _glVersion) {
      // new material or post WebGL crash
      material.addEventListener('dispose', onMaterialDispose); // TODO: Remove this
      materialProperties.glVersion = _glVersion;
      programChange = true;

    } else if (program.code !== code) {
      // changed glsl or parameters
      releaseMaterialProgramReference(material);
      programChange = true;
    }

    if (programChange) {
      materialProperties.__webglShader = {
        uniforms:       material.uniforms,
        vertexShader:   material.vertexShader,
        fragmentShader: material.fragmentShader
      };

      material.__webglShader = materialProperties.__webglShader;

      program = programCache.acquireProgram(material, code);

      materialProperties.program = program;
      material.program = program;
    }

    var programAttributes = program.getAttributes();

    // if (material.morphTargets) {
    //   material.numSupportedMorphTargets = 0;
    //   for (var i = 0; i < _this.maxMorphTargets; i++) {
    //     if (programAttributes['morphTarget' + i] >= 0) {
    //       material.numSupportedMorphTargets++;
    //     }
    //   }
    // }
    //
    // if (material.morphNormals) {
    //   material.numSupportedMorphNormals = 0;
    //   for (var i = 0; i < _this.maxMorphNormals; i++) {
    //     if (programAttributes['morphNormal' + i] >= 0) {
    //       material.numSupportedMorphNormals ++;
    //     }
    //   }
    // }

    var uniforms = materialProperties.__webglShader.uniforms;

    // // store the light setup it was created for
    // materialProperties.lightsHash = _lights.hash;
    //
    // if (material.lights) {
    //   // wire up the material to this renderer's lighting state
    //   uniforms.ambientLightColor.value = _lights.ambient;
    //   uniforms.directionalLights.value = _lights.directional;
    //   uniforms.spotLights.value = _lights.spot;
    //   uniforms.rectAreaLights.value = _lights.rectArea;
    //   uniforms.pointLights.value = _lights.point;
    //   uniforms.hemisphereLights.value = _lights.hemi;
    //
    //   uniforms.directionalShadowMap.value = _lights.directionalShadowMap;
    //   uniforms.directionalShadowMatrix.value = _lights.directionalShadowMatrix;
    //   uniforms.spotShadowMap.value = _lights.spotShadowMap;
    //   uniforms.spotShadowMatrix.value = _lights.spotShadowMatrix;
    //   uniforms.pointShadowMap.value = _lights.pointShadowMap;
    //   uniforms.pointShadowMatrix.value = _lights.pointShadowMatrix;
    //   // TODO (abelnation): add area lights shadow info to uniforms
    // }

    var progUniforms = materialProperties.program.getUniforms();
    var uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);

    materialProperties.uniformsList = uniformsList;
  }

  // TODO: WORK IN PROGRESS

  var _lastShader = null;
  var _lastState = null;
  var _lastUniforms = {};

  function setMaterial(material, camera, object) {
    _usedTextureUnits = 0;

    var shader = material.shader;
    if (material.shader !== _lastShader) {
      setShader(material.shader);
    }

    if (material.state !== _lastState) {
      setState();
    }

    var program = material.program;

  }

  function setShader(shader) {
    if (shader.glVersion !== _glVersion) {
      initShader(shader);
    }

    var program = shader.program;
    if (program.id !== _currentProgram) {
      _gl.useProgram(program.program);
      _currentProgram = program.id;
    }
  }

  function setState(force) {
    if (force) {

    } else {

    }
  }

  //

  function setProgram(camera, material, object) {
    _usedTextureUnits = 0;

    var materialProperties = material.properties;

    if (material.needsUpdate === false) {
      if (materialProperties.glVersion !== _glVersion) {
        material.needsUpdate = true;
      } /*else if (material.lights && materialProperties.lightsHash !== _lights.hash) {
        material.needsUpdate = true;
      }*/
    }

    if (material.needsUpdate) {
      initMaterial(material);
      material.needsUpdate = false;
    }

    var refreshProgram = false;
    var refreshMaterial = false;
    // var refreshLights = false;

    var program = materialProperties.program;
    var p_uniforms = program.getUniforms();
    var m_uniforms = materialProperties.__webglShader.uniforms;

    if (program.id !== _currentProgram) {
      _gl.useProgram(program.program);
      _currentProgram = program.id;

      refreshProgram = true;
      refreshMaterial = true;
      // refreshLights = true;
    }

    if (material.id !== _currentMaterialId) {
      _currentMaterialId = material.id;
      refreshMaterial = true;
    }

    if (refreshProgram || camera !== _currentCamera) {
      p_uniforms.setValue(_gl, 'projectionMatrix', camera.projectionMatrix);

      // if (capabilities.logarithmicDepthBuffer) {
      //   p_uniforms.setValue(_gl, 'logDepthBufFC', 2.0 / (Math.log(camera.far + 1.0) / Math.LN2));
      // }

      if (camera !== _currentCamera) {
        _currentCamera = camera;

        // lighting uniforms depend on the camera so enforce an update
        // now, in case this material supports lights - or later, when
        // the next material that does gets activated:

        refreshMaterial = true; // set to true on material change
        // refreshLights = true; // remains set until update done
      }

      var uCamPos = p_uniforms.map.cameraPosition;
      if (uCamPos !== undefined) {
        uCamPos.setValue(_gl, _vector3.setFromMatrixPosition(camera.matrixWorld));
      }

      p_uniforms.setValue(_gl, 'viewMatrix', camera.matrixWorldInverse);

      // p_uniforms.setValue(_gl, 'toneMappingExposure', _this.toneMappingExposure);
      // p_uniforms.setValue(_gl, 'toneMappingWhitePoint', _this.toneMappingWhitePoint);
    }

    // skinning uniforms must be set even if material didn't change
    // auto-setting of texture unit for bone texture must go before other textures
    // not sure why, but otherwise weird things happen
    if (material.skinning) {
      p_uniforms.setOptional(_gl, object, 'bindMatrix');
      p_uniforms.setOptional(_gl, object, 'bindMatrixInverse');

      var skeleton = object.skeleton;
      if (skeleton) {
        var bones = skeleton.bones;

        if (capabilities.floatVertexTextures) {
          if (skeleton.boneTexture === undefined) {
            // layout (1 matrix = 4 pixels)
            //      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
            //  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
            //       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
            //       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
            //       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)

            var size = Math.sqrt(bones.length * 4); // 4 pixels needed for 1 matrix
            size = _Math.nextPowerOfTwo(Math.ceil(size));
            size = Math.max(size, 4);

            var boneMatrices = new Float32Array(size * size * 4); // 4 floats per RGBA pixel
            boneMatrices.set(skeleton.boneMatrices); // copy current values

            var boneTexture = new DataTexture(boneMatrices, size, size, RGBAFormat, FloatType);

            skeleton.boneMatrices = boneMatrices;
            skeleton.boneTexture = boneTexture;
            skeleton.boneTextureSize = size;
          }

          p_uniforms.setValue(_gl, 'boneTexture', skeleton.boneTexture);
          p_uniforms.setValue(_gl, 'boneTextureSize', skeleton.boneTextureSize);
        } else {
          p_uniforms.setOptional(_gl, skeleton, 'boneMatrices');
        }
      }
    }

    if (refreshMaterial) {
      WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, _this);
    }

    // common matrices
    p_uniforms.setValue(_gl, 'modelViewMatrix', object.modelViewMatrix);
    p_uniforms.setValue(_gl, 'normalMatrix', object.normalMatrix);
    p_uniforms.setValue(_gl, 'modelMatrix', object.matrixWorld);

    return program;
  }

  // Lighting

  // function setupShadows(lights) {
  //   var lightShadowsLength = 0;
  //
  //   for (var i = 0, il = lights.length; i < il; i++) {
  //     var light = lights[i];
  //
  //     if (light.castShadow) {
  //       _lights.shadows[lightShadowsLength] = light;
  //       lightShadowsLength++;
  //     }
  //   }
  //
  //   _lights.shadows.length = lightShadowsLength;
  // }
  //
  // function setupLights(lights, camera) {
  //   var l, ll, light, shadow;
  //   var r = 0, g = 0, b = 0;
  //   var color;
  //   var intensity;
  //   var distance;
  //   var shadowMap;
  //
  //   var viewMatrix = camera.matrixWorldInverse;
  //
  //   var directionalLength = 0;
  //   var pointLength = 0;
  //   var spotLength = 0;
  //   var rectAreaLength = 0;
  //   var hemiLength = 0;
  //
  //   for (l = 0, ll = lights.length; l < ll; l++) {
  //     light = lights[l];
  //
  //     color = light.color;
  //     intensity = light.intensity;
  //     distance = light.distance;
  //
  //     shadowMap = (light.shadow && light.shadow.map) ? light.shadow.map.texture : null;
  //
  //     if (light.isAmbientLight) {
  //       r += color.r * intensity;
  //       g += color.g * intensity;
  //       b += color.b * intensity;
  //
  //     } else if (light.isDirectionalLight) {
  //       var uniforms = lightCache.get(light);
  //
  //       uniforms.color.copy(light.color).multiplyScalar(light.intensity);
  //       uniforms.direction.setFromMatrixPosition(light.matrixWorld);
  //       _vector3.setFromMatrixPosition(light.target.matrixWorld);
  //       uniforms.direction.sub(_vector3);
  //       uniforms.direction.transformDirection(viewMatrix);
  //
  //       uniforms.shadow = light.castShadow;
  //
  //       if (light.castShadow) {
  //         shadow = light.shadow;
  //
  //         uniforms.shadowBias = shadow.bias;
  //         uniforms.shadowRadius = shadow.radius;
  //         uniforms.shadowMapSize = shadow.mapSize;
  //       }
  //
  //       _lights.directionalShadowMap[directionalLength] = shadowMap;
  //       _lights.directionalShadowMatrix[directionalLength] = light.shadow.matrix;
  //       _lights.directional[directionalLength] = uniforms;
  //
  //       directionalLength++;
  //
  //     } else if (light.isSpotLight) {
  //       var uniforms = lightCache.get(light);
  //
  //       uniforms.position.setFromMatrixPosition(light.matrixWorld);
  //       uniforms.position.applyMatrix4(viewMatrix);
  //
  //       uniforms.color.copy(color).multiplyScalar(intensity);
  //       uniforms.distance = distance;
  //
  //       uniforms.direction.setFromMatrixPosition(light.matrixWorld);
  //       _vector3.setFromMatrixPosition(light.target.matrixWorld);
  //       uniforms.direction.sub(_vector3);
  //       uniforms.direction.transformDirection(viewMatrix);
  //
  //       uniforms.coneCos = Math.cos(light.angle);
  //       uniforms.penumbraCos = Math.cos(light.angle * (1.0 - light.penumbra));
  //       uniforms.decay = (light.distance === 0.0) ? 0.0 : light.decay;
  //
  //       uniforms.shadow = light.castShadow;
  //
  //       if (light.castShadow) {
  //         shadow = light.shadow;
  //
  //         uniforms.shadowBias = shadow.bias;
  //         uniforms.shadowRadius = shadow.radius;
  //         uniforms.shadowMapSize = shadow.mapSize;
  //       }
  //
  //       _lights.spotShadowMap[spotLength] = shadowMap;
  //       _lights.spotShadowMatrix[spotLength] = light.shadow.matrix;
  //       _lights.spot[spotLength] = uniforms;
  //
  //       spotLength++;
  //
  //     } else if (light.isRectAreaLight) {
  //       var uniforms = lightCache.get(light);
  //
  //       // (a) intensity controls irradiance of entire light
  //       uniforms.color.copy(color).multiplyScalar(intensity / (light.width * light.height));
  //
  //       // (b) intensity controls the radiance per light area
  //       // uniforms.color.copy(color).multiplyScalar(intensity);
  //
  //       uniforms.position.setFromMatrixPosition(light.matrixWorld);
  //       uniforms.position.applyMatrix4(viewMatrix);
  //
  //       // extract local rotation of light to derive width/height half vectors
  //       _matrix42.identity();
  //       _matrix4.copy(light.matrixWorld);
  //       _matrix4.premultiply(viewMatrix);
  //       _matrix42.extractRotation(_matrix4);
  //
  //       uniforms.halfWidth.set(light.width * 0.5, 0.0, 0.0);
  //       uniforms.halfHeight.set(0.0, light.height * 0.5, 0.0);
  //
  //       uniforms.halfWidth.applyMatrix4(_matrix42);
  //       uniforms.halfHeight.applyMatrix4(_matrix42);
  //
  //       // TODO (abelnation): RectAreaLight distance?
  //       // uniforms.distance = distance;
  //
  //       _lights.rectArea[rectAreaLength] = uniforms;
  //
  //       rectAreaLength++;
  //
  //     } else if (light.isPointLight) {
  //       var uniforms = lightCache.get(light);
  //
  //       uniforms.position.setFromMatrixPosition(light.matrixWorld);
  //       uniforms.position.applyMatrix4(viewMatrix);
  //
  //       uniforms.color.copy(light.color).multiplyScalar(light.intensity);
  //       uniforms.distance = light.distance;
  //       uniforms.decay = (light.distance === 0.0) ? 0.0 : light.decay;
  //
  //       uniforms.shadow = light.castShadow;
  //
  //       if (light.castShadow) {
  //         shadow = light.shadow;
  //
  //         uniforms.shadowBias = shadow.bias;
  //         uniforms.shadowRadius = shadow.radius;
  //         uniforms.shadowMapSize = shadow.mapSize;
  //       }
  //
  //       _lights.pointShadowMap[pointLength] = shadowMap;
  //       _lights.pointShadowMatrix[pointLength] = light.shadow.matrix;
  //       _lights.point[pointLength] = uniforms;
  //
  //       pointLength ++;
  //
  //     } else if (light.isHemisphereLight) {
  //       var uniforms = lightCache.get(light);
  //
  //       uniforms.direction.setFromMatrixPosition(light.matrixWorld);
  //       uniforms.direction.transformDirection(viewMatrix);
  //       uniforms.direction.normalize();
  //
  //       uniforms.skyColor.copy(light.color).multiplyScalar(intensity);
  //       uniforms.groundColor.copy(light.groundColor).multiplyScalar(intensity);
  //
  //       _lights.hemi[hemiLength] = uniforms;
  //
  //       hemiLength++;
  //     }
  //   }
  //
  //   _lights.ambient[0] = r;
  //   _lights.ambient[1] = g;
  //   _lights.ambient[2] = b;
  //
  //   _lights.directional.length = directionalLength;
  //   _lights.spot.length = spotLength;
  //   _lights.rectArea.length = rectAreaLength;
  //   _lights.point.length = pointLength;
  //   _lights.hemi.length = hemiLength;
  //
  //   // TODO (sam-g-steel) why aren't we using join
  //   _lights.hash = directionalLength + ',' + pointLength + ',' + spotLength + ',' + rectAreaLength + ',' + hemiLength + ',' + _lights.shadows.length;
  // }

  // GL state setting
  this.setFaceCulling = function (cullFace, frontFaceDirection) {
    state.setCullFace(cullFace);
    state.setFlipSided(frontFaceDirection === FrontFaceDirectionCW);
  };

  // Textures
  function allocTextureUnit() {
    var textureUnit = _usedTextureUnits;

    if (textureUnit >= capabilities.maxTextures) {
      console.warn('WebGLRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + capabilities.maxTextures);
    }

    _usedTextureUnits += 1;

    return textureUnit;
  }

  this.allocTextureUnit = allocTextureUnit;

  this.setTexture = function (texture, slot) {
    textures.setTexture2D(texture, slot);
  };

  this.getRenderTarget = function () {
    return _currentRenderTarget;
  };

  this.setRenderTarget = function (renderTarget) {
    _currentRenderTarget = renderTarget;
    if (renderTarget && properties.get(renderTarget).__webglFramebuffer === undefined) {
      textures.setupRenderTarget(renderTarget);
    }

    var framebuffer;

    if (renderTarget) {
      var renderTargetProperties = properties.get(renderTarget);
      framebuffer = renderTargetProperties.__webglFramebuffer;

      _currentScissor.copy(renderTarget.scissor);
      _currentScissorTest = renderTarget.scissorTest;

      _currentViewport.copy(renderTarget.viewport);
    } else {
      framebuffer = null;

      _currentScissor.copy(_scissor).multiplyScalar(_pixelRatio);
      _currentScissorTest = _scissorTest;

      _currentViewport.copy(_viewport).multiplyScalar(_pixelRatio);
    }

    if (_currentFramebuffer !== framebuffer) {
      _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
      _currentFramebuffer = framebuffer;
    }

    state.scissor(_currentScissor);
    state.setScissorTest(_currentScissorTest);

    state.viewport(_currentViewport);
  };

  this.readRenderTargetPixels = function (renderTarget, x, y, width, height, buffer) {
    var framebuffer = properties.get(renderTarget).__webglFramebuffer;
    if (framebuffer) {
      var restore = false; // whether to restore the current frame buffer after function completes
      if (framebuffer !== _currentFramebuffer) {
        _gl.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
        restore = true;
      }

      try {
        var texture = renderTarget.texture;
        var textureFormat = texture.format;
        var textureType = texture.type;

        if (textureFormat !== RGBAFormat && paramThreeToGL(textureFormat) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {
          console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.');
          return;
        }

        if (textureType !== UnsignedByteType && paramThreeToGL(textureType) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_TYPE) && // IE11, Edge and Chrome Mac < 52 (#9513)
            !(textureType === FloatType && (extensions.get('OES_texture_float') || extensions.get('WEBGL_color_buffer_float'))) && // Chrome Mac >= 52 and Firefox
            !(textureType === HalfFloatType && extensions.get('EXT_color_buffer_half_float'))) {
          console.error('THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.');
          return;
        }

        if (_gl.checkFramebufferStatus(_gl.FRAMEBUFFER) === _gl.FRAMEBUFFER_COMPLETE) {
          // the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)

          if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {
            _gl.readPixels(x, y, width, height, paramThreeToGL(textureFormat), paramThreeToGL(textureType), buffer);
          }
        } else {
          console.error('THREE.WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.');
        }
      } finally {
        if (restore) {
          _gl.bindFramebuffer(_gl.FRAMEBUFFER, _currentFramebuffer);
        }
      }
    }
  };

  // Map three.js constants to WebGL constants
  function paramThreeToGL(p) {
    var extension;

    if (p === RepeatWrapping) return _gl.REPEAT;
    if (p === ClampToEdgeWrapping) return _gl.CLAMP_TO_EDGE;
    if (p === MirroredRepeatWrapping) return _gl.MIRRORED_REPEAT;

    if (p === NearestFilter) return _gl.NEAREST;
    if (p === NearestMipMapNearestFilter) return _gl.NEAREST_MIPMAP_NEAREST;
    if (p === NearestMipMapLinearFilter) return _gl.NEAREST_MIPMAP_LINEAR;

    if (p === LinearFilter) return _gl.LINEAR;
    if (p === LinearMipMapNearestFilter) return _gl.LINEAR_MIPMAP_NEAREST;
    if (p === LinearMipMapLinearFilter) return _gl.LINEAR_MIPMAP_LINEAR;

    if (p === UnsignedByteType) return _gl.UNSIGNED_BYTE;
    if (p === UnsignedShort4444Type) return _gl.UNSIGNED_SHORT_4_4_4_4;
    if (p === UnsignedShort5551Type) return _gl.UNSIGNED_SHORT_5_5_5_1;
    if (p === UnsignedShort565Type) return _gl.UNSIGNED_SHORT_5_6_5;

    if (p === ByteType) return _gl.BYTE;
    if (p === ShortType) return _gl.SHORT;
    if (p === UnsignedShortType) return _gl.UNSIGNED_SHORT;
    if (p === IntType) return _gl.INT;
    if (p === UnsignedIntType) return _gl.UNSIGNED_INT;
    if (p === FloatType) return _gl.FLOAT;

    if (p === HalfFloatType) {
      extension = extensions.get('OES_texture_half_float');
      if (extension !== null) return extension.HALF_FLOAT_OES;
    }

    if (p === AlphaFormat) return _gl.ALPHA;
    if (p === RGBFormat) return _gl.RGB;
    if (p === RGBAFormat) return _gl.RGBA;
    if (p === LuminanceFormat) return _gl.LUMINANCE;
    if (p === LuminanceAlphaFormat) return _gl.LUMINANCE_ALPHA;
    if (p === DepthFormat) return _gl.DEPTH_COMPONENT;
    if (p === DepthStencilFormat) return _gl.DEPTH_STENCIL;

    if (p === AddEquation) return _gl.FUNC_ADD;
    if (p === SubtractEquation) return _gl.FUNC_SUBTRACT;
    if (p === ReverseSubtractEquation) return _gl.FUNC_REVERSE_SUBTRACT;

    if (p === ZeroFactor) return _gl.ZERO;
    if (p === OneFactor) return _gl.ONE;
    if (p === SrcColorFactor) return _gl.SRC_COLOR;
    if (p === OneMinusSrcColorFactor) return _gl.ONE_MINUS_SRC_COLOR;
    if (p === SrcAlphaFactor) return _gl.SRC_ALPHA;
    if (p === OneMinusSrcAlphaFactor) return _gl.ONE_MINUS_SRC_ALPHA;
    if (p === DstAlphaFactor) return _gl.DST_ALPHA;
    if (p === OneMinusDstAlphaFactor) return _gl.ONE_MINUS_DST_ALPHA;

    if (p === DstColorFactor) return _gl.DST_COLOR;
    if (p === OneMinusDstColorFactor) return _gl.ONE_MINUS_DST_COLOR;
    if (p === SrcAlphaSaturateFactor) return _gl.SRC_ALPHA_SATURATE;

    if (p === RGB_S3TC_DXT1_Format || p === RGBA_S3TC_DXT1_Format ||
        p === RGBA_S3TC_DXT3_Format || p === RGBA_S3TC_DXT5_Format) {
      extension = extensions.get('WEBGL_compressed_texture_s3tc');
      if (extension !== null) {
        if (p === RGB_S3TC_DXT1_Format) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (p === RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (p === RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (p === RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      }
    }

    if (p === RGB_PVRTC_4BPPV1_Format || p === RGB_PVRTC_2BPPV1_Format ||
        p === RGBA_PVRTC_4BPPV1_Format || p === RGBA_PVRTC_2BPPV1_Format) {
      extension = extensions.get('WEBGL_compressed_texture_pvrtc');
      if (extension !== null) {
        if (p === RGB_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (p === RGB_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (p === RGBA_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (p === RGBA_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      }
    }

    if (p === RGB_ETC1_Format) {
      extension = extensions.get('WEBGL_compressed_texture_etc1');
      if (extension !== null) return extension.COMPRESSED_RGB_ETC1_WEBGL;
    }

    if (p === MinEquation || p === MaxEquation) {
      extension = extensions.get('EXT_blend_minmax');
      if (extension !== null) {
        if (p === MinEquation) return extension.MIN_EXT;
        if (p === MaxEquation) return extension.MAX_EXT;
      }
    }

    if (p === UnsignedInt248Type) {
      extension = extensions.get('WEBGL_depth_texture');
      if (extension !== null) return extension.UNSIGNED_INT_24_8_WEBGL;
    }

    return 0;
  }
}


export { WebGLRenderer };

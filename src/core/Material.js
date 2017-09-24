import { EventDispatcher } from '../core/EventDispatcher';
import { NoColors, FrontSide, SmoothShading, NormalBlending, LessEqualDepth, AddEquation, OneMinusSrcAlphaFactor, SrcAlphaFactor } from '../constants';
import { _Math } from '../math/Math';


var materialId = 0;

function Material(parameters) {
  this.id = ++materialId;

  this.properties = {
    program:       null,
    __webglShader: null,
    uniformsList:  null,
    glVersion:     0
  };

  this.blending = NormalBlending;
  this.side = FrontSide;

  this.transparent = false;

  this.blendSrc = SrcAlphaFactor;
  this.blendDst = OneMinusSrcAlphaFactor;
  this.blendEquation = AddEquation;
  this.blendSrcAlpha = null;
  this.blendDstAlpha = null;
  this.blendEquationAlpha = null;

  this.depthFunc = LessEqualDepth;
  this.depthTest = true;
  this.depthWrite = true;

  this.colorWrite = true;

  this.polygonOffset = false;
  this.polygonOffsetFactor = 0;
  this.polygonOffsetUnits = 0;

  this.premultipliedAlpha = false;

  // Shader parameters
  this.defines = {};
  this.uniforms = {};

  this.vertexShader = 'attribute vec3 position;\nattribute vec2 uv;\n\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nvarying vec2 vUv;\n\nvoid main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\tvUv = uv;\n}';
  this.fragmentShader = 'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';
  // this.fragmentShader = 'precision mediump float;\n\nuniform sampler2D map;\n\nvarying vec2 vUv;\n\nvoid main() {\n\tgl_FragColor = texture2D(map, vUv);\n}';

  this.linewidth = 1;

  // TODO: remove wireframe rendering?
  this.wireframe = false;
  this.wireframeLinewidth = 1;

  this.skinning = false; // set to use skinning attribute streams
  this.morphTargets = false; // set to use morph targets
  this.morphNormals = false; // set to use morph normals

  this.extensions = {
    derivatives:      false, // set to use derivatives
    fragDepth:        false, // set to use fragment depth values
    drawBuffers:      false, // set to use draw buffers
    shaderTextureLOD: false  // set to use shader texture LOD
  };

  if (parameters !== undefined) {
    this.setValues(parameters);
  }

  this.needsUpdate = true;
}

Object.assign(Material.prototype, EventDispatcher.prototype, {

  constructor: Material,

  isMaterial: true,

  setValues: function (values) {
    for (var key in values) {
      var newValue = values[key];
      if (newValue === undefined) {
        console.warn('THREE.Material: "' + key + '" parameter is undefined.');
        continue;
      }

      var currentValue = this[key];
      if (currentValue === undefined) {
        console.warn('THREE.' + this.constructor.name + ': "' + key + '" is not a property of this material.');
        continue;
      }

      if (currentValue && currentValue.isColor) {
        currentValue.set(newValue);
      } else if ((currentValue && currentValue.isVector3) && (newValue && newValue.isVector3)) {
        currentValue.copy(newValue);
      } else {
        this[key] = newValue;
      }
    }
  },

  clone: function () {
    return new this.constructor().copy(this);
  },

  copy: function ( source ) {
    this.name = source.name;

    this.blending = source.blending;
    this.side = source.side;

    this.transparent = source.transparent;

    this.blendSrc = source.blendSrc;
    this.blendDst = source.blendDst;
    this.blendEquation = source.blendEquation;
    this.blendSrcAlpha = source.blendSrcAlpha;
    this.blendDstAlpha = source.blendDstAlpha;
    this.blendEquationAlpha = source.blendEquationAlpha;

    this.depthFunc = source.depthFunc;
    this.depthTest = source.depthTest;
    this.depthWrite = source.depthWrite;

    this.colorWrite = source.colorWrite;

    this.polygonOffset = source.polygonOffset;
    this.polygonOffsetFactor = source.polygonOffsetFactor;
    this.polygonOffsetUnits = source.polygonOffsetUnits;

    this.premultipliedAlpha = source.premultipliedAlpha;

    this.defines = source.defines;
    this.uniforms = UniformsUtils.clone(source.uniforms);

    this.vertexShader = source.vertexShader;
    this.fragmentShader = source.fragmentShader;

    this.linewidth = source.linewidth;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.skinning = source.skinning;
    this.morphTargets = source.morphTargets;
    this.morphNormals = source.morphNormals;

    this.extensions = source.extensions; // TODO: Deep copy?

    return this;
  },

  dispose: function () {
    this.dispatchEvent({ type: 'dispose' });
  }

});


export { Material };

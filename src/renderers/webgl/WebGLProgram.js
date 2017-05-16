/**
 * @author mrdoob / http://mrdoob.com/
 */

import { WebGLUniforms } from './WebGLUniforms';
import { WebGLShader } from './WebGLShader';
import { ShaderChunk } from '../shaders/ShaderChunk';
import { NoToneMapping, AddOperation, MixOperation, MultiplyOperation, EquirectangularRefractionMapping, CubeRefractionMapping, SphericalReflectionMapping, EquirectangularReflectionMapping, CubeUVRefractionMapping, CubeUVReflectionMapping, CubeReflectionMapping, PCFSoftShadowMap, PCFShadowMap, CineonToneMapping, Uncharted2ToneMapping, ReinhardToneMapping, LinearToneMapping, GammaEncoding, RGBDEncoding, RGBM16Encoding, RGBM7Encoding, RGBEEncoding, sRGBEncoding, LinearEncoding } from '../../constants';

var programIdCount = 0;

function getEncodingComponents( encoding ) {

	switch ( encoding ) {

		case LinearEncoding:
			return [ 'Linear','( value )' ];
		case sRGBEncoding:
			return [ 'sRGB','( value )' ];
		case RGBEEncoding:
			return [ 'RGBE','( value )' ];
		case RGBM7Encoding:
			return [ 'RGBM','( value, 7.0 )' ];
		case RGBM16Encoding:
			return [ 'RGBM','( value, 16.0 )' ];
		case RGBDEncoding:
			return [ 'RGBD','( value, 256.0 )' ];
		case GammaEncoding:
			return [ 'Gamma','( value, float( GAMMA_FACTOR ) )' ];
		default:
			throw new Error( 'unsupported encoding: ' + encoding );

	}

}

function getTexelDecodingFunction( functionName, encoding ) {

	var components = getEncodingComponents( encoding );
	return "vec4 " + functionName + "( vec4 value ) { return " + components[ 0 ] + "ToLinear" + components[ 1 ] + "; }";

}

function getTexelEncodingFunction( functionName, encoding ) {

	var components = getEncodingComponents( encoding );
	return "vec4 " + functionName + "( vec4 value ) { return LinearTo" + components[ 0 ] + components[ 1 ] + "; }";

}

function getToneMappingFunction( functionName, toneMapping ) {

	var toneMappingName;

	switch ( toneMapping ) {

		case LinearToneMapping:
			toneMappingName = "Linear";
			break;

		case ReinhardToneMapping:
			toneMappingName = "Reinhard";
			break;

		case Uncharted2ToneMapping:
			toneMappingName = "Uncharted2";
			break;

		case CineonToneMapping:
			toneMappingName = "OptimizedCineon";
			break;

		default:
			throw new Error( 'unsupported toneMapping: ' + toneMapping );

	}

	return "vec3 " + functionName + "( vec3 color ) { return " + toneMappingName + "ToneMapping( color ); }";

}

function generateExtensions( extensions, parameters, rendererExtensions ) {

	extensions = extensions || {};

	var chunks = [
		( extensions.derivatives || parameters.envMapCubeUV || parameters.bumpMap || parameters.normalMap || parameters.flatShading ) ? '#extension GL_OES_standard_derivatives : enable' : '',
		( extensions.fragDepth || parameters.logarithmicDepthBuffer ) && rendererExtensions.get( 'EXT_frag_depth' ) ? '#extension GL_EXT_frag_depth : enable' : '',
		( extensions.drawBuffers ) && rendererExtensions.get( 'WEBGL_draw_buffers' ) ? '#extension GL_EXT_draw_buffers : require' : '',
		( extensions.shaderTextureLOD || parameters.envMap ) && rendererExtensions.get( 'EXT_shader_texture_lod' ) ? '#extension GL_EXT_shader_texture_lod : enable' : ''
	];

	return chunks.filter( filterEmptyLine ).join( '\n' );

}

function generateDefines( defines ) {

	var chunks = [];

	for ( var name in defines ) {

		var value = defines[ name ];

		if ( value === false ) continue;

		chunks.push( '#define ' + name + ' ' + value );

	}

	return chunks.join( '\n' );

}

function fetchAttributeLocations( gl, program, identifiers ) {

	var attributes = {};

	var n = gl.getProgramParameter( program, gl.ACTIVE_ATTRIBUTES );

	for ( var i = 0; i < n; i ++ ) {

		var info = gl.getActiveAttrib( program, i );
		var name = info.name;

		// console.log("THREE.WebGLProgram: ACTIVE VERTEX ATTRIBUTE:", name, i );

		attributes[ name ] = gl.getAttribLocation( program, name );

	}

	return attributes;

}

function filterEmptyLine( string ) {

	return string !== '';

}

function replaceLightNums( string, parameters ) {

	return string
		.replace( /NUM_DIR_LIGHTS/g, parameters.numDirLights )
		.replace( /NUM_SPOT_LIGHTS/g, parameters.numSpotLights )
		.replace( /NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights )
		.replace( /NUM_POINT_LIGHTS/g, parameters.numPointLights )
		.replace( /NUM_HEMI_LIGHTS/g, parameters.numHemiLights );

}

function parseIncludes( string ) {

	var pattern = /^[ \t]*#include +<([\w\d.]+)>/gm;

	function replace( match, include ) {

		var replace = ShaderChunk[ include ];

		if ( replace === undefined ) {

			throw new Error( 'Can not resolve #include <' + include + '>' );

		}

		return parseIncludes( replace );

	}

	return string.replace( pattern, replace );

}

function unrollLoops( string ) {

	var pattern = /for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g;

	function replace( match, start, end, snippet ) {

		var unroll = '';

		for ( var i = parseInt( start ); i < parseInt( end ); i ++ ) {

			unroll += snippet.replace( /\[ i \]/g, '[ ' + i + ' ]' );

		}

		return unroll;

	}

	return string.replace( pattern, replace );

}

function WebGLProgram( renderer, code, material /* parameters */ ) {

	var gl = renderer.context;

	var extensions = material.extensions;
	var defines = material.defines;

	var vertexShader = material.__webglShader.vertexShader;
	var fragmentShader = material.__webglShader.fragmentShader;

	var gammaFactorDefine = ( renderer.gammaFactor > 0 ) ? renderer.gammaFactor : 1.0;

	// var customExtensions = generateExtensions( extensions, parameters, renderer.extensions );

	var customDefines = generateDefines( defines );

	var program = gl.createProgram();

	var prefixVertex = [customDefines, '\n'].filter(filterEmptyLine).join('\n');
	var prefixFragment = [/*customExtensions, */customDefines, '\n'].filter(filterEmptyLine).join('\n');

	// vertexShader = parseIncludes( vertexShader, parameters );
	// vertexShader = replaceLightNums( vertexShader, parameters );
    //
	// fragmentShader = parseIncludes( fragmentShader, parameters );
	// fragmentShader = replaceLightNums( fragmentShader, parameters );

    // TODO: keep this?
	// vertexShader = unrollLoops( vertexShader );
	// fragmentShader = unrollLoops( fragmentShader );

	var vertexGlsl = prefixVertex + vertexShader;
	var fragmentGlsl = prefixFragment + fragmentShader;

	// console.log( '*VERTEX*', vertexGlsl );
	// console.log( '*FRAGMENT*', fragmentGlsl );

	var glVertexShader = WebGLShader( gl, gl.VERTEX_SHADER, vertexGlsl );
	var glFragmentShader = WebGLShader( gl, gl.FRAGMENT_SHADER, fragmentGlsl );

	gl.attachShader( program, glVertexShader );
	gl.attachShader( program, glFragmentShader );

	// Force a particular attribute to index 0.

	if ( material.index0AttributeName !== undefined ) {

		gl.bindAttribLocation( program, 0, material.index0AttributeName );

	} /*else if ( parameters.morphTargets === true ) {

		// programs with morphTargets displace position out of attribute 0
		gl.bindAttribLocation( program, 0, 'position' );

	}*/

	gl.linkProgram( program );

	var programLog = gl.getProgramInfoLog( program );
	var vertexLog = gl.getShaderInfoLog( glVertexShader );
	var fragmentLog = gl.getShaderInfoLog( glFragmentShader );

	var runnable = true;
	var haveDiagnostics = true;

	// console.log( '**VERTEX**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( glVertexShader ) );
	// console.log( '**FRAGMENT**', gl.getExtension( 'WEBGL_debug_shaders' ).getTranslatedShaderSource( glFragmentShader ) );

	if ( gl.getProgramParameter( program, gl.LINK_STATUS ) === false ) {

		runnable = false;

		console.error( 'THREE.WebGLProgram: shader error: ', gl.getError(), 'gl.VALIDATE_STATUS', gl.getProgramParameter( program, gl.VALIDATE_STATUS ), 'gl.getProgramInfoLog', programLog, vertexLog, fragmentLog );

	} else if ( programLog !== '' ) {

		console.warn( 'THREE.WebGLProgram: gl.getProgramInfoLog()', programLog );

	} else if ( vertexLog === '' || fragmentLog === '' ) {

		haveDiagnostics = false;

	}

	if ( haveDiagnostics ) {

		this.diagnostics = {

			runnable: runnable,
			material: material,

			programLog: programLog,

			vertexShader: {

				log: vertexLog,
				prefix: prefixVertex

			},

			fragmentShader: {

				log: fragmentLog,
				prefix: prefixFragment

			}

		};

	}

	// clean up

	gl.deleteShader( glVertexShader );
	gl.deleteShader( glFragmentShader );

	// set up caching for uniform locations

	var cachedUniforms;

	this.getUniforms = function() {

		if ( cachedUniforms === undefined ) {

			cachedUniforms =
				new WebGLUniforms( gl, program, renderer );

		}

		return cachedUniforms;

	};

	// set up caching for attribute locations

	var cachedAttributes;

	this.getAttributes = function() {

		if ( cachedAttributes === undefined ) {

			cachedAttributes = fetchAttributeLocations( gl, program );

		}

		return cachedAttributes;

	};

	// free resource

	this.destroy = function() {

		gl.deleteProgram( program );
		this.program = undefined;

	};

	// DEPRECATED

	Object.defineProperties( this, {

		uniforms: {
			get: function() {

				console.warn( 'THREE.WebGLProgram: .uniforms is now .getUniforms().' );
				return this.getUniforms();

			}
		},

		attributes: {
			get: function() {

				console.warn( 'THREE.WebGLProgram: .attributes is now .getAttributes().' );
				return this.getAttributes();

			}
		}

	} );


	//

	this.id = programIdCount ++;
	this.code = code;
	this.usedTimes = 1;
	this.program = program;
	this.vertexShader = glVertexShader;
	this.fragmentShader = glFragmentShader;

	return this;

}

export { WebGLProgram };

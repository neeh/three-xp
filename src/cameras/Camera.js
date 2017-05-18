/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
*/

import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
import { SceneNode } from '../core/SceneNode';
import { Vector3 } from '../math/Vector3';

function Camera() {

	SceneNode.call( this );

	this.type = 'Camera';

	this.matrixWorldInverse = new Matrix4();
	this.projectionMatrix = new Matrix4();

}

Camera.prototype = Object.assign( Object.create( SceneNode.prototype ), {

	constructor: Camera,

	isCamera: true,

	copy: function ( source ) {

		SceneNode.prototype.copy.call( this, source );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );
		this.projectionMatrix.copy( source.projectionMatrix );

		return this;

	},

	getWorldDirection: function () {

		var quaternion = new Quaternion();

		return function getWorldDirection( optionalTarget ) {

			var result = optionalTarget || new Vector3();

			this.getWorldQuaternion( quaternion );

			return result.set( 0, 0, - 1 ).applyQuaternion( quaternion );

		};

	}(),

	clone: function () {

		return new this.constructor().copy( this );

	}

} );

export { Camera };

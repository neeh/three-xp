import { SceneNode } from '../core/SceneNode';

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

function Bone() {

	SceneNode.call( this );

	this.type = 'Bone';

}

Bone.prototype = Object.assign( Object.create( SceneNode.prototype ), {

	constructor: Bone,

	isBone: true

} );


export { Bone };

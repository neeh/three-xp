

function QuadNode(aabb, depth, x, y) {
    this.aabb = aabb;
    this.depth = depth || 0;

    this.x = x || 0;
    this.y = y || 0;

    this.children = null;
    this.objects = [];
}


QuadNode.prototype = {

    clear: function () {
        if (this.children !== null) {
            this.getAllObjects(this.objects);
            this.children = null;
        }
    },

    subdivide: function (nbIters) {
        if (this.children === null) {
            var minX = this.aabb[0];
            var minY = this.aabb[1];
            var minZ = this.aabb[2];

            var maxX = this.aabb[3];
            var maxY = this.aabb[4];
            var maxZ = this.aabb[5];

            var halfX = minX + 0.5 * (maxX - minX);
            var halfY = minY + 0.5 * (maxY - minY);
            var halfZ = minZ + 0.5 * (maxZ - minZ);

            var depth = this.depth + 1;
            var x = this.x * 2;
            var y = this.y * 2;

            this.children = [
                new QuadNode([minX, minY, minZ, halfX, maxY, halfZ], depth, x, y),
                new QuadNode([halfX, minY, minZ, maxX, maxY, halfZ], depth, x + 1, y),
                new QuadNode([minX, minY, halfZ, halfX, maxY, maxZ], depth, x, y + 1),
                new QuadNode([halfX, minY, halfZ, maxX, maxY, maxZ], depth, x + 1, y + 1)
            ];
        }
        if (nbIters > 1) {
            nbIters--;
            for (var i = 0; i < 4; i++) {
                this.children[i].subdivide(nbIters);
            }
        }

        if (this.objects.length > 0) {
            for (var i = 0, il = this.objects.length; i < il; i++) {
                this.addObject(this.objects[i]);
            }
            this.objects.length = 0;
        }
    },

    addObject: function (object) {
        if (!object.boundingSphere) {
            object.computeBoundingSphere();
        }

        if (testSphereAabb(this.aabb, object.boundingSphere)) {
            if (this.children === null) {
                object.spatialNodes.push(this);
                this.objects.push(object);
            } else {
                for (var i = 0; i < 4; i++) {
                    this.children[i].addObject(object);
                }
            }
        }
    },

    getAllObjects: function (objects) {
        if (this.children === null) {
            for (var i = 0, il = this.objects.length; i < il; i++) {
                if (objects.indexOf(this.objects[i]) === -1) {
                    objects.push(this.objects[i]);
                }
            }
        } else {
            for (var i = 0; i < 4; i++) {
                this.children[i].getAllObjects(objects);
            }
        }
    },

    getNodesInSphere: function (nodes, sphere, depth) {
        if (testSphereAabb(this.aabb, sphere)) {
            if (this.depth === depth) {
                nodes[nodes.shadowLength++] = this;
            } else if (this.depth < depth) {
                for (var i = 0; i < 4; i++) {
                    this.children[i].getNodesInSphere(nodes, sphere, depth);
                }
            }
        }
    },

    flagObjectsVisibleInFrustum: function (frustum, frame) {
        if ()
        // TODO

        for (var i = 0, il = this.children.length; i < il; i++) {
            // this.children[i].setFrame(frame); // not necessarily a function
            this.children[i].frame = frame;
        }
    },

    flagObjectsVisible: function (frame) {
        if (this.children === null) {
            for (var i = 0, il = this.object.length; i < il; i++) {
                this.objects[i].frame = frame;
            }
        } else {
            for (var i = 0; i < 4; i++) {
                this.children[i].flagObjectsVisible(frame);
            }
        }
    }

};


export { QuadNode };

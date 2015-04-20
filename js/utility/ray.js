require('js/utility/hit')

/**
 * Ray casting functionality container
 *
 * @public
 * @singleton module:Ray
 * @author Daniël Konings
 */
var Ray = {}

_.extend(Ray, {
	/**
	 * constructs a Ray data container
	 *
	 * @public
	 * @method module:Ray#construct
	 * @param {object} o - The origin of the ray represented as a Vector3D
	 * @param {object} d - The direction of the ray represented as a Vector3D
	 * @return {object} A Ray data container
	 * @author Daniël Konings
	 */
	construct: function(o, d)
	{
		return {
			origin: o,
			direction: d
		}
	},

	/**
	 * Does an intersection check with a 3D sphere
	 *
	 * @public
	 * @method module:Ray#sphereIntersection
	 * @param {object} ray - The ray to check the intersection for
	 * @param {object} o - The origin of the sphere represented as a Vector3D
	 * @param {number} r - The radius of the sphere
	 * @return {bool} False if no intersection was found, otherwise true
	 * @author Daniël Konings
	 */
	sphereIntersection: function(ray, o, r)
	{
		var q = Vector3D.sub(o, ray.origin);
	   	var c = Vector3D.length(q);
	   	var v = Vector3D.dot(q, ray.direction);
	   	var d = r*r - (c*c - v*v);

	   	if (d < 0.0) 
	   	{
	   		return false;
	   	}

	   	return d;
	},

	boxIntersection: function (ray, box, pos, delta, paddingX, paddingY)
	{
		paddingX = paddingX !== undefined ? paddingX : 0;
		paddingY = paddingY !== undefined ? paddingY : 0;

		var scaleX = 1.0 / delta.x;
    	var scaleY = 1.0 / delta.y;
    	var signX = Math.sign(scaleX);
    	var signY = Math.sign(scaleY);

    	var boxPos = box.position();
    	var boxHalf = {
    		x: box.size().x / 2,
    		y: box.size().y / 2
    	}

    	var nearTimeX = (boxPos.x - signX * (boxHalf.x + paddingX) - pos.x) * scaleX;
    	var nearTimeY = (boxPos.y - signY * (boxHalf.y + paddingY) - pos.y) * scaleY;
    	var farTimeX = (boxPos.x + signX * (boxHalf.x + paddingX) - pos.x) * scaleX;
    	var farTimeY = (boxPos.y + signY * (boxHalf.y + paddingY) - pos.y) * scaleY;

    	if (nearTimeX > farTimeY || nearTimeY > farTimeX) {
        	return null;
      	}

      	nearTime = nearTimeX > nearTimeY ? nearTimeX : nearTimeY;
      	farTime = farTimeX < farTimeY ? farTimeX : farTimeY;

      	if (nearTime >= 1 || farTime <= 0) {
        	return null;
      	}

      	hit = new Hit(box);
      	hit.time = Math.clamp(nearTime, 0, 1);

      	if (nearTimeX > nearTimeY) 
      	{
        	hit.normal.x = -signX;
        	hit.normal.y = 0;
      	} 
      	else 
      	{
        	hit.normal.x = 0;
        	hit.normal.y = -signY;
      	}

      	hit.delta.x = hit.time * delta.x;
      	hit.delta.y = hit.time * delta.y;
      	hit.pos.x = pos.x + hit.delta.x;
      	hit.pos.y = pos.y + hit.delta.y;

      	return hit;
	},

	getIntersectionPoint: function(ray, d)
	{
		return {
			x: ray.origin.x + ray.direction.x * d, 
			y: ray.origin.y + ray.direction.y * d,
			z: ray.origin.z + ray.direction.z * d
		}
	}
});
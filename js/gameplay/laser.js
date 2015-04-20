var Laser = Laser || function(origin, direction, texture, width, height, blocks)
{
	this._laser = new Quad();
	this._laser.setTechnique('Diffuse');
	this._laser.setDiffuseMap(texture);
	this._laser.setOffset(0, 0.5);
	this._laser.setEffect("effects/cull_none.effect");
	this._laser.setTranslation(0, 0, 1000);
	this._laser.spawn("Default");

	this._origin = origin;
	this._direction = direction;

	this._texture = texture;
	this._width = width;
	this._height = height;

	this._ray = Ray.construct(origin, direction);

	this._maxRange = 30000;

	this.constructLaser(blocks);
}

_.extend(Laser.prototype, {
	constructLaser: function (blocks)
	{
		var start = this._origin;

		var end = {
			x: Math.cos(Math.atan2(this._direction.y, this._direction.x)) * this._maxRange,
			y: Math.sin(Math.atan2(this._direction.y, this._direction.x)) * this._maxRange
		}

		var minDist = 100000000000000000000;
		var minHit = false;

		for (var i = 0; i < blocks.length; i++)
		{
			var pos = blocks[i].position();
			pos.z = 0;

			var result = Ray.boxIntersection(this._ray, blocks[i], start, end, 0, 0)

			if (result !== null)
			{
				var dist = Math.distance(start.x, start.y, result.pos.x, result.pos.y);
				if (dist < minDist)
				{
					minDist = dist;

					minHit = result;
				}
			}
		}

		this._endPoint = minHit;
	},

	update: function (blocks, dt)
	{
		if (this._endPoint !== false)
		{
			var angle = Math.atan2(this._origin.y - this._endPoint.pos.y, this._origin.x - this._endPoint.pos.x);

			var size = Math.distance(this._origin.x, this._origin.y, this._endPoint.pos.x, this._endPoint.pos.y);

			this._laser.setRotation(0, 0, angle + Math.PI);

			this._laser.setSize(size, 30);

			this._laser.setTranslation(this._origin.x, this._origin.y, 100);
		}
	}
});
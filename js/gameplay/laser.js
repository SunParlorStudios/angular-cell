require('js/gameplay/laser_point');

var Laser = Laser || function(x, y, editMode, parent)
{
	this._position = Vector2D.construct(x, y);

	this._base = new Quad(this);
	Laser._super.constructor.call(this, editMode, parent);
}

_.inherit(Laser, Moveable);

_.extend(Laser.prototype, {
	initialise: function ()
	{
		this.setTechnique('Diffuse');
		this.setDiffuseMap('textures/laser.png');
		this.setOffset(0, 0.5);
		this.setEffect("effects/cull_none.effect");
		this.setTranslation(0, 0, 1000);
		this.spawn("Default");

		this._base.setDiffuseMap('textures/laser_base.png');
		this._base.setTechnique('Diffuse');
		this._base.setEffect('effects/cull_none.effect');
		this._base.setSize(103, 49);
		this._base.setRotation(0, 0, Math.PI / 2);
		this._base.setOffset(0.5, 1);
		this._base.setTranslation(-3, 0, 1001);
		this._base.spawn("Default");
	},

	position: function ()
	{
		return this._position;
	},

	setPosition: function(x, y)
	{
		this._position = Vector2D.construct(x, y);
		this.setTranslation(this._position.x, this._position.y);
	},

	constructLaser: function (origin, direction, blocks)
	{
		this._position = origin;
		this._direction = direction;

		var start = this._position;

		var end = {
			x: Math.cos(Math.atan2(this._direction.y, this._direction.x)) * 30000,
			y: Math.sin(Math.atan2(this._direction.y, this._direction.x)) * 30000
		}

		var minDist = 100000000000000000;
		var minHit = false;

		for (var i = 0; i < blocks.length; i++)
		{
			var result = Ray.boxIntersection(this._ray, blocks[i], start, end, 0, 0);

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

	checkPlayerCollision: function (player)
	{
		var start = this._position;
		var end = {
			x: Math.cos(Math.atan2(this._direction.y, this._direction.x)) * Math.distance(start.x, start.y, this._endPoint.pos.x, this._endPoint.pos.y),
			y: Math.sin(Math.atan2(this._direction.y, this._direction.x)) * Math.distance(start.x, start.y, this._endPoint.pos.x, this._endPoint.pos.y)
		};

		var result = Ray.boxIntersection(this._ray, player, start, end, 0, 0);
		if (result !== null)
		{
			player.hurt(0, this);
		}
	},

	update: function (blocks, player, dt)
	{
		if (this._endPoint !== false)
		{
			var angle = Math.atan2(this._position.y - this._endPoint.pos.y, this._position.x - this._endPoint.pos.x);

			var size = Math.distance(this._position.x, this._position.y, this._endPoint.pos.x, this._endPoint.pos.y);

			this.setRotation(0, 0, angle + Math.PI);

			this.setSize(size, Math.clamp(Math.abs(Math.sin(Game.time() * 20) * 30), 25, 30));

			this.setTranslation(this._position.x, this._position.y, 100);

			this.setBlend(1, 1, 1);

			this.checkPlayerCollision(player);
		}
	},

	createDragPoints: function()
	{
		this._dragPoints.push(new LaserPoint(this, Vector2D.construct(0, 0)));
	},

	updateDragPoints: function(p, zoom, dt)
	{
		var used = false;
		var using = false;
		for (var i = 0; i < this._dragPoints.length; ++i)
		{
			used = this._dragPoints[i].update(p, zoom, dt);

			if (used == true)
			{
				using = true;
			}
		}

		return using;
	},

	destroyPoints: function()
	{
		for (var i = 0; i < this._dragPoints.length; ++i)
		{
			this._dragPoints[i].destroy();
		}
	},

	spawnPoints: function()
	{
		for (var i = 0; i < this._dragPoints.length; ++i)
		{
			this._dragPoints[i].spawn("Default");
		}
	},

	resetBlend: function()
	{
		this.setBlend(0, 0, 0);
	}
});
var Moveable = Moveable || function(editMode, parent)
{
	Moveable._super.constructor.call(this, parent);

	this._cellSize = Vector2D.construct(64, 64);
	this._dragPoints = [];
	this._depth = -1;

	if (editMode == true)
	{
		this.createDragPoints();
	}

	this._rotationSpeed = 0;
	this._zOffset = 0;
	this.initialise();
}

_.inherit(Moveable, Quad);

_.extend(Moveable.prototype, {
	increaseRotationSpeed: function(spd)
	{
		this._rotationSpeed += spd;
	},

	decreaseRotationSpeed: function(spd)
	{
		this._rotationSpeed -= spd;
	},

	resetRotationSpeed: function()
	{
		this._rotationSpeed = 0;
		this.setRotation(0, 0, 0);
	},

	setRotationSpeed: function(spd)
	{
		this._rotationSpeed = spd;
	},

	rotationSpeed: function()
	{
		return this._rotationSpeed;
	},

	setDepth: function()
	{

	},

	depth: function()
	{
		return this._depth + this._zOffset;
	},

	depthNoZ: function()
	{
		return this._depth;
	},

	increaseZOffset: function(v)
	{
		this._zOffset += v;
		this.setDepth(this._depth);
	},

	decreaseZOffset: function(v)
	{
		this._zOffset -= v;
		this.setDepth(this._depth);
	},

	zOffset: function()
	{
		return this._zOffset;
	},

	setZOffset: function(v)
	{
		this._zOffset = v;
		this.setDepth(this._depth);
	},

	position: function()
	{
		return this._position;
	},

	createDragPoints: function()
	{
		for (var x = -1; x <= 1; ++x)
		{
			for (var y = -1; y <= 1; ++y)
			{
				if (y == 0 || x == 0)
				{
					continue;
				}

				this._dragPoints.push(new DragPoint(this, Vector2D.construct(x, y)));
			}
		}
	},

	cellSize: function()
	{
		return this._cellSize;
	},

	setCellSize: function(x, y)
	{
		this._cellSize = Vector2D.construct(x, y);
		this.setSize(x, y);
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

	inBounds: function(p)
	{
		var block = this.translation();
		var cell = Vector2D.abs(Vector2D.mul(Vector2D.multiply(this.size(), this.scale()), 0.5));

		if (p.x > block.x - cell.x && p.y > block.y - cell.y && p.x < block.x + cell.x && p.y < block.y + cell.y)
		{
			return true;
		}

		return false;
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
	}
})
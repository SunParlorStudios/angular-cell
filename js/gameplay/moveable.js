var Moveable = Moveable || function(editMode, parent)
{
	Moveable._super.constructor.call(this, parent);

	this._cellSize = Vector2D.construct(64, 64);
	this._dragPoints = [];

	if (editMode == true)
	{
		this.createDragPoints();
	}

	this.initialise();
}

_.inherit(Moveable, Quad);

_.extend(Moveable.prototype, {
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
		x = Math.max(x, 4);
		y = Math.max(y, 4);
		
		this._cellSize = Vector2D.construct(x, y);
		this.setSize(x, y);
	},

	updateDragPoints: function(p, dt)
	{
		var used = false;
		var using = false;
		for (var i = 0; i < this._dragPoints.length; ++i)
		{
			used = this._dragPoints[i].update(p, dt);

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
		var cell = Vector2D.mul(this.size(), 0.5);

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
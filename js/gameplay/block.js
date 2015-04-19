require("js/gameplay/drag_point");

var Block = function(x, y, editMode, parent)
{
	Block._super.constructor.call(this, parent);

	this._cellSize = Vector2D.construct(64, 64);
	this._position = Vector2D.construct(x, y);
	this._dragPoints = [];

	if (editMode == true)
	{
		this.createDragPoints();
	}

	this.initialise();
}

_.inherit(Block, Quad);

_.extend(Block.prototype, {
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

	initialise: function()
	{
		this.setOffset(0.5, 0.5);
		this.setSize(64, 64);
		this.spawn("Default");
		this.setZ(0);
		this.setTechnique("Diffuse");
		this.setBlend(0, 0, 0);
		this.setTranslation(this._position.x, this._position.y);
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

	checkCollision: function(player)
	{
		var pos = player.position();
		var block = this.translation();

		var size = Vector2D.mul(player.size(), 0.5);
		var cell = Vector2D.mul(this._cellSize, 0.5);

		if (pos.x + size.x > block.x - cell.x && pos.y + size.y > block.y - cell.y && pos.x - size.x < block.x + cell.x && pos.y - size.y < block.y + cell.y)
		{
			return true;
		}

		return false;
	},

	inBounds: function(p)
	{
		var block = this.translation();
		var cell = Vector2D.mul(this._cellSize, 0.5);

		if (p.x > block.x - cell.x && p.y > block.y - cell.y && p.x < block.x + cell.x && p.y < block.y + cell.y)
		{
			return true;
		}

		return false;
	},

	penetrationDepth: function(player)
	{
		var pos = player.position();
		var block = this.translation();

		var size = Vector2D.mul(player.size(), 0.5);
		var cell = Vector2D.mul(this._cellSize, 0.5);

		var pen = Vector2D.construct(0, 0);

		if (pos.x + size.x > block.x - cell.x && pos.x <= block.x)
		{
			pen.x = (pos.x + size.x) - (block.x - cell.x);
		}
		
		if (pos.x - size.x < block.x + cell.x && pos.x >= block.x)
		{
			pen.x = (pos.x - size.x) - (block.x + cell.x);
		}

		if (pos.y + size.y > block.y - cell.y && pos.y <= block.y)
		{
			pen.y = (pos.y + size.y) - (block.y - cell.y);
		}
		
		if (pos.y - size.y < block.y + cell.y && pos.y >= block.y)
		{
			pen.y = (pos.y - size.y) - (block.y + cell.y);
		}

		return pen;
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
require("js/gameplay/drag_point");

var Block = Block || function(x, y, editMode, parent)
{
	this._position = Vector2D.construct(x, y);

	Block._super.constructor.call(this, editMode, parent);
}

_.inherit(Block, Moveable);

_.extend(Block.prototype, {
	initialise: function()
	{
		this.setOffset(0.5, 0.5);
		this.setSize(64, 64);
		this.spawn("Default");
		this.setZ(0);
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.setBlend(0, 0, 0);
		this.setTranslation(this._position.x, this._position.y);
	},

	checkCollision: function(player)
	{
		var pos = player.position();
		var block = this.translation();

		var size = Vector2D.abs(Vector2D.mul(player.size(), 0.5));
		var cell = Vector2D.abs(Vector2D.mul(this._cellSize, 0.5));

		if (pos.x + size.x > block.x - cell.x && pos.y + size.y > block.y - cell.y && pos.x - size.x < block.x + cell.x && pos.y - size.y < block.y + cell.y)
		{
			return true;
		}

		return false;
	},

	penetrationDepth: function(player)
	{
		var pos = player.position();
		var block = this.translation();

		var size = Vector2D.abs(Vector2D.mul(player.size(), 0.5));
		var cell = Vector2D.abs(Vector2D.mul(this._cellSize, 0.5));

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

	resetBlend: function()
	{
		this.setBlend(0, 0, 0);
	}
})
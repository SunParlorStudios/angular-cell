Enum("Collision", [
	"Left",
	"Right",
	"Top",
	"Bottom"]);

var Block = function(parent)
{
	Block._super.constructor.call(this, parent);

	this._cellSize = Vector2D.construct(3000, 256);
	this.setOffset(0.5, 0.5);
	this.setSize(3000, 256);
	this.spawn("Default");
	this.setZ(-3);
	this.setTechnique("Diffuse");
	this._width = 4;
	this.setBlend(0, 0, 0);
}

_.inherit(Block, Quad);

_.extend(Block.prototype, {
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
	}
})
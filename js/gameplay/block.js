Enum("Collision", [
	"Left",
	"Right",
	"Top",
	"Bottom"]);

var Block = function(parent)
{
	Block._super.constructor.call(this, parent);

	this._cellSize = Vector2D.construct(640, 64);
	this.setOffset(0.5, 0.5);
	this.setSize(640, 64);
	this.spawn("Default");
	this.setTechnique("Diffuse");
	this._width = 16;
}

_.inherit(Block, Quad);

_.extend(Block.prototype, {
	checkCollision: function(player)
	{
		var pos = player.position();
		var block = this.translation();

		var size = Vector2D.mul(Vector2D.multiply(player.size(), player.scale()), 0.5);
		var cell = Vector2D.mul(this._cellSize, 0.5);
		var xx, yy;

		if (pos.x + size.x > block.x - cell.x && pos.y + size.y > block.y - cell.y && pos.x - size.x < block.x + cell.x && pos.y - size.y < block.y + cell.y)
		{
			xx = pos.x + size.x;
			if (xx > block.x - cell.x && xx < block.x - cell.x + this._width)
			{
				return Collision.Left;
			}

			xx = pos.x - size.x;

			if (xx < block.x + cell.x && xx > block.x + cell.x - this._width)
			{
				return Collision.Right;
			}

			yy = pos.y + size.y;

			if (yy > block.y - cell.y && yy < block.y - cell.y + this._width)
			{
				return Collision.Top;
			}

			yy = pos.y - size.y;

			if (yy < block.y + cell.y && yy > block.y + cell.y - this._width)
			{
				return Collision.Bottom;
			}
		}

		return false;
	}
})
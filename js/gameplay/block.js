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
	this._width = 4;
}

_.inherit(Block, Quad);

_.extend(Block.prototype, {
	checkCollision: function(player, p)
	{
		var pos = Vector2D.add(player.position(), p);
		var block = this.translation();

		var size = 8;
		var cell = Vector2D.mul(this._cellSize, 0.5);

		if (pos.x + size > block.x - cell.x && pos.y + size > block.y - cell.y && pos.x - size < block.x + cell.x && pos.y - size < block.y + cell.y)
		{
			return true;
		}

		return false;
	}
})
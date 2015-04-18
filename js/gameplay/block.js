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
}

_.inherit(Block, Quad);

_.extend(Block.prototype, {
	checkCollision: function(player)
	{
		var pos = player.position();
		var block = this.translation();

		var size = Vector2D.mul(Vector2D.multiply(player.size(), player.scale()), 0.5);
		var cell = Vector2D.mul(this._cellSize, 0.5);
		var angle = 0;

		if (pos.x + size.x >= block.x - cell.x && pos.y + size.y >= block.y - cell.y && pos.x - size.x <= block.x + cell.x && pos.y - size.y <= block.y + cell.y)
		{
			angle = Math.atan2(block.y - pos.y, block.x - pos.x) + Math.PI / 4;

			if (angle >= 0 && angle < Math.PI / 2)
			{
				return Collision.Left;
			}
			else if (angle >= Math.PI / 2 && angle < Math.PI)
			{
				return Collision.Top;
			}
			else if (angle < 0 && angle < (Math.PI / 2) * -1 || angle > Math.PI)
			{
				return Collision.Right;
			}
			else
			{
				return Collision.Bottom;
			}
		}
	}
})
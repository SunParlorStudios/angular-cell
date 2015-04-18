Enum("Collision", [
	"Left",
	"Right",
	"Top",
	"Bottom"]);

var Block = function(parent)
{
	Block._super.constructor.call(this, parent);

	this._cellSize = 64;
	this.setOffset(0.5, 0.5);
	this.setSize(64, 64);
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
		var cell = this._cellSize / 2;
		var angle = 0;
		if (pos.x + size.x >= block.x - cell && pos.y + size.y >= block.y - cell && pos.x - size.x <= block.x + cell && pos.y - size.y <= block.y + cell)
		{
			angle = Math.atan2(block.y - pos.y, block.x - pos.x);

			Log.info(angle);

			if (angle >= 0 && angle < Math.PI / 2)
			{
				return "Bottom";
			}
			else if (angle >= Math.PI / 2 && angle < Math.PI)
			{
				return "Left";
			}
			else if (angle >= Math.PI && angle < Math.PI + Math.PI / 2)
			{
				return "Top";
			}
			else
			{
				return "Right";
			}
		}
	}
})
var Player = function(parent)
{
	Player._super.constructor.call(this, parent);

	this._velocity = Vector2D.construct(0, 0);
	this._position = Vector2D.construct(0, 0);
}

_.inherit(Player, Quad);

_.extend(Player.prototype, {
	initialise: function()
	{
		this.setSize(64, 64);
		this.setBlend(0.9, 1, 0);
		this.spawn("Default");
		this.setTechnique("Diffuse");
		this.setOffset(0.5, 0.5);
	},

	position: function()
	{
		return this._position;
	},

	update: function(blocks, dt)
	{
		this._position = Mouse.position(MousePosition.Relative);
		var collision;
		for (var i = 0; i < blocks.length; ++i)
		{
			collision = blocks[i].checkCollision(this);
		}
		this.setTranslation(this._position.x, this._position.y);
	}
})
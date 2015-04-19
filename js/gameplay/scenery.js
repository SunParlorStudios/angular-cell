var Scenery = Scenery || function(x, y, editMode, parent)
{
	this._cellSize = Vector2D.construct(64, 64);
	this._position = Vector2D.construct(x, y);

	Scenery._super.constructor.call(this, editMode, parent);
}

_.inherit(Scenery, Moveable);

_.extend(Scenery.prototype, {
	initialise: function()
	{
		this.setOffset(0.5, 0.5);
		this.setSize(64, 64);
		this.spawn("Default");
		this.setZ(0);
		this.setTechnique("Diffuse");
		this.setBlend(1, 1, 1);
		this.setTranslation(this._position.x, this._position.y);
	},

	resetBlend: function()
	{
		this.setBlend(1, 1, 1);
	}
});
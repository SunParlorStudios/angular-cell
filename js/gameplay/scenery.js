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
		this.setEffect("effects/cull_none.effect");
		this.setZ(0);
		this.setTechnique("Diffuse");
		this.setBlend(1, 1, 1);
		this.setTranslation(this._position.x, this._position.y);
		this._texture = undefined;
	},

	setTexture: function(tex)
	{
		this.setDiffuseMap(tex);
		this._texture = tex;
	},

	texture: function()
	{
		return this._texture;
	},

	resetBlend: function()
	{
		this.setBlend(1, 1, 1);
	}
});
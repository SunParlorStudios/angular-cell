var Scenery = Scenery || function(x, y, editMode, parent)
{
	this._cellSize = Vector2D.construct(64, 64);
	this._position = Vector2D.construct(x, y);
	this._depth = 0;
	this._maxDepth = 6;
	this._parallax = 1;

	Scenery._super.constructor.call(this, editMode, parent);
}

_.inherit(Scenery, Moveable);

_.extend(Scenery.prototype, {
	initialise: function()
	{
		this.setOffset(0.5, 0.5);
		this.setSize(64, 64);
		this.spawn("Default");
		this.setEffect("effects/fog.effect");
		this.setZ(-10 - this._depth);
		this.setTechnique("Diffuse");
		this.setBlend(1, 1, 1);
		this.setTranslation(this._position.x, this._position.y);
		this._texture = undefined;
	},

	setPosition: function(x, y)
	{
		this._position = Vector2D.construct(x, y);
	},

	setTexture: function(tex)
	{
		this.setDiffuseMap(tex);
		this._texture = tex;
	},

	setDepth: function(depth)
	{
		depth = Math.max(depth, 0);
		depth = Math.min(depth, this._maxDepth - 1);
		this._depth = depth;
		this.setZ(-10 - depth - this._zOffset);
		var r = depth / this._maxDepth;
		this.setScale(1 - r, 1 - r);
		this.setUniform(Uniform.Float, "Depth", r);
	},

	texture: function()
	{
		return this._texture;
	},

	resetBlend: function()
	{
		this.setBlend(1, 1, 1);
	},

	update: function(dt)
	{
		this.rotateBy(0, 0, this._rotationSpeed * dt);
		var t = Game.camera.translation();
		var r = this._depth / this._maxDepth;

		this.setTranslation(this._position.x + t.x * r * this._parallax, this._position.y + t.y * r * this._parallax);
	}
});
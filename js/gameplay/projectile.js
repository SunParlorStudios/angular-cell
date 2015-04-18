var Projectile = Projectile || function()
{
	Projectile._super.constructor.call(this, arguments);
	this._speed = 2000;
}

_.inherit(Projectile, Quad);

_.extend(Projectile.prototype, {
	initialise: function(dir, t)
	{
		this.setTranslation(t.x, t.y, 2);
		this._direction = dir;
		this.setDiffuseMap("textures/starfish.png");
		this.setOffset(0.5, 0.5);
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.setSize(32, 32);
		this.spawn("Default");
		this.setRotation(0, 0, Math.random() * Math.PI * 2);
	},

	update: function(dt)
	{
		var mx = Math.cos(this._direction) * this._speed * dt;
		var my = Math.sin(this._direction) * this._speed * dt;

		this.translateBy(mx, my);
		this.rotateBy(0, 0, dt * 100);
	}
});
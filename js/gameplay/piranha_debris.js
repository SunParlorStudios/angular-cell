var PiranhaDebris = PiranhaDebris || function(x, y, idx, parent)
{
	PiranhaDebris._super.constructor.call(this, parent);
	var textures = [
		"textures/particles/piranha_jaw.png",
		"textures/particles/piranha_eye.png",
		"textures/particles/piranha_body.png",
		"textures/particles/piranha_mouth.png",
	]
	this._direction = Math.random() * Math.PI * 2;

	this.setOffset(0.5, 0.5);
	this.setSize(48, 48);
	this.setTechnique("Diffuse");
	this.setDiffuseMap(textures[idx]);
	this.setEffect("effects/cull_none.effect");
	this.spawn("Default");
	this.setTranslation(x, y);
	this.setRotation(0, 0, Math.random() * Math.PI * 2);

	this._speed = Math.randomRange(400, 800);
	this._startSpeed = this._speed;
}

_.inherit(PiranhaDebris, Quad);

_.extend(PiranhaDebris.prototype, {
	update: function(dt)
	{
		var movement = Vector2D.construct(
			Math.cos(this._direction) * this._speed * dt,
			Math.sin(this._direction) * this._speed * dt
		)

		this.rotateBy(0, 0, dt * 10);
		this.translateBy(movement.x, movement.y);

		this._speed -= dt * 350;

		var r = this._speed / this._startSpeed;
		r = Math.max(r, 0);
		this.setAlpha(r);

		if (r <= 0)
		{
			return false;
		}

		return true;
	}
})
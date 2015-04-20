require("js/gameplay/piranha_debris");

var Piranha = Piranha || function(map, x, y, parent)
{
	Piranha._super.constructor.call(this, parent);
	this._dead = false;
	this._maxDistance = 640;
	this._speed = 700;
	this._maxSpeed = this._speed;
	this._speed = 0;
	this._map = map;
	this.setTranslation(x, y);
	this.initialise();
	this._randomAngle = Math.random() * Math.PI * 2;
	this._randomRadius = Math.randomRange(20, 240);
	this.setZ(105);
}

_.inherit(Piranha, Quad);

_.extend(Piranha.prototype, {
	initialise: function()
	{
		this._idleAnimation = new SpriteAnimation("animations/piranha_idle.anim", "textures/player/weapons.png");
		this._swimAnimation = new SpriteAnimation("animations/piranha_swim.anim", "textures/player/weapons.png");
		this._deathAnimation = new SpriteAnimation("animations/piranha_death.anim", "textures/player/weapons.png");

		this.setDiffuseMap("textures/player/weapons.png");
		this.setSize(96, 96);
		this.setOffset(0.5, 0.5);
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");

		this.spawn("Default");

		this.setAnimation(this._idleAnimation);
		this._idleAnimation.play();

		this._wobble = 0;
		this._wobbleHeight = 100;
		this._wobbleSpeed = 10;
		this._health = 4;
		this._knockTimer = 1;
		this._lockedOn = false;

		this.setScale(Math.round(Math.randomRange(-1, 1)), 1);
	},

	position: function()
	{
		return this.translation();
	},

	canHurt: function()
	{
		return this._knockTimer >= 1;
	},

	hurt: function()
	{
		if (this._knockTimer < 1)
		{
			return;
		}

		if (--this._health <= 0)
		{
			this.splat();
			this._dead = true;
		}
		
		this.knockBack();
	},

	knockBack: function()
	{
		this._speed = -this._maxSpeed / 5;
		this._knockTimer = 0;
	},

	splat: function()
	{
		var p;
		for (var i = 0; i < 4; ++i)
		{
			p = new PiranhaDebris(this.translation().x, this.translation().y, i);
			this._map.addParticle(p);
		}
	},

	update: function(player, blocks, dt)
	{

		if (this._speed < this._maxSpeed)
		{
			this._speed += 400 * dt;
			this._speed = Math.min(this._speed, this._maxSpeed);
		}

		if (this._knockTimer < 1)
		{
			this._knockTimer += dt * 2;
			this._knockTimer = Math.min(this._knockTimer, 1);
			this.setAlpha(Math.abs(Math.sin(this._knockTimer * 10)));
		}
		else
		{
			this.setAlpha(1);
		}

		var p = player.translation();
		var t = this.translation();
		p.x += Math.cos(this._randomAngle) * this._randomRadius;
		p.y += Math.sin(this._randomAngle) * this._randomRadius;
		var dist = Math.distance(p.x, p.y, t.x, t.y);

		this._randomAngle += dt * 2;

		this._wobble += dt * this._wobbleSpeed;
		p.y += Math.sin(this._wobble) * this._wobbleHeight;

		if (this._lockedOn == false)
		{
			this.setBlend(0, 1, 0);
			this.setAnimation(this._idleAnimation);
			this._idleAnimation.play();

			if (dist < this._maxDistance)
			{
				this._lockedOn = true;
			}

			this.translateBy(0, Math.sin(this._wobble) * this._wobbleHeight * dt);
		}
		else
		{
			if (dist < 16)
			{
				player.hurt(8, this);
			}
			this.setBlend(1, 0, 0);
			this.setAnimation(this._swimAnimation);
			this._swimAnimation.play();

			var a = Math.atan2(p.y - t.y, p.x - t.x);
			var degrees = (a + Math.PI) * 180 / Math.PI;

			if (degrees < 270 && degrees > 90)
			{
				this.setScale(1, -1);
			}
			else
			{
				this.setScale(1, 1);
			}

			var movement = Vector2D.construct(
				Math.cos(a) * this._speed * dt,
				Math.sin(a) * this._speed * dt
			)
			this.translateBy(movement.x, movement.y);

			this.setRotation(0, 0, a + Math.PI);
		}
	},

	isDead: function()
	{
		return this._dead;
	},

	removeYourself: function()
	{
		this.destroy();
	}
})
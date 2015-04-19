var PufferFish = PufferFish || function (parent) 
{
	PufferFish._super.constructor.call(this, parent);

	this._velocity = Vector2D.construct(0, 0);
	this._acceleration = 800;
	this._maxVelocity = Vector2D.construct(800, 2000);
	this._position = Vector2D.construct(0, -500);
	this._jumpHeight = 1200;
	this._margin = 9;

	this._hurtForce = Vector2D.construct(1300, -700);

	this._size = Vector2D.construct(40, 110);
	this._friction = 2;
	this._punchMax = 0.9;
	this._punchTimer = this._punchMax;
	this._deathMax = 1;
	this._deathTimer = this._deathMax;

	this._dead = false;

	this.setSize(256, 256);
	this.spawn("Default");
	this.setEffect("effects/cull_none.effect");
	this.setTechnique("Diffuse");
	this.setDiffuseMap("textures/henchman/weapons.png");
	this.setOffset(0.5, 0.5);

	this._animation = new SpriteAnimation("animations/puffer_fish.anim", "textures/player/weapons.png");
	this.setAnimation(this._animation);
	this._animation.play();
	this._animation.setSpeed(1);
};

_.inherit(PufferFish, Quad);

_.extend(PufferFish.prototype, {
	position: function()
	{
		return this._position;
	},

	update: function (target, blocks, dt)
	{
		this.move(target, dt);

		this.resolveCollisions(target, blocks, dt);

		this.updateVisuals(target, dt);
	},

	move: function(target, dt)
	{
		this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Game.gravity, Math.min(dt, 0.016)));

		var a = this._acceleration * dt;

		this._velocity.y = Math.min(this._velocity.y, this._maxVelocity.y);

		this._position = Vector2D.add(this._position, Vector2D.mul(this._velocity, dt));
	},

	resolveCollisions: function(blocks, dt)
	{
		var block;
		var foundBlocks = [];
		for (var i = 0; i < blocks.length; ++i)
		{
			block = blocks[i];

			if (block.checkCollision(this) == true)
			{
				foundBlocks.push(block);
			}
		}

		if (foundBlocks.length == 0)
		{
			this._grounded = false;
		}

		var pen;
		for (var i = 0; i < foundBlocks.length; ++i)
		{
			pen = foundBlocks[i].penetrationDepth(this);

			if (Math.abs(pen.y) < Math.abs(pen.x))
			{
				this._position.y -= pen.y;
				this._velocity.y = 0;

				if (pen.y > 0)
				{
					this._grounded = true;
				}
			}
			else
			{
				this._position.x -= pen.x;
				this._velocity.x = 0;
			}
		}
	},

	updateVisuals: function(target, dt)
	{
		var t = this._position;

		if (this._dead == true)
		{
			this._deathTimer += dt;

			this.setTranslation(t.x, t.y + this._margin);
			return;
		}

		this.setTranslation(t.x, t.y + this._margin, 2);
	},

	isDead: function ()
	{
		if (this._dead)
		{
			if (this._deathTimer <= this._deathMax)
				return false;
			else
				return true;
		}

		return false;
	},

	removeYourself: function ()
	{
		this.destroy();
	}
});
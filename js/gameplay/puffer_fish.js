var PufferFish = PufferFish || function (position, velocity) 
{
	PufferFish._super.constructor.call(this);

	this._velocity = velocity;
	this._acceleration = 800;
	this._maxVelocity = Vector2D.construct(1000, 3000);
	this._position = {x: position.x, y:position.y};
	this._jumpHeight = 1200;
	this._margin = 9;

	this._size = Vector2D.construct(40, 110);
	this._friction = 0.9;
	this._deathMax = 1;
	this._deathTimer = this._deathMax;

	this._dead = false;

	this._minimum = 30;
	this._maxSize = 256 - this._minimum;
	this._size = this._minimum;
	this._timer = 0;
	this._explosionDelay = 0.5;
	this._explosionTimer = 0;
	this._explosionMax = 0.02;
	this._idleTimer = 0;
	this._idleMax = 0.5;
	this._implosionTimer = 0;
	this._implosionMax = 0.5; 

	this.setSize(this._minimum, this._minimum);
	this.spawn("Default");
	this.setEffect("effects/cull_none.effect");
	this.setTechnique("Diffuse");
	this.setDiffuseMap("textures/player/weapons.png");
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

	update: function (targets, blocks, dt)
	{
		if (this._gone)
			return;

		this.move(targets, dt);

		this.resolveCollisions(blocks, dt);

		this.updateVisuals(targets, dt);
	},

	move: function(target, dt)
	{
		if (!this._collided)
			this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Game.gravity, Math.min(dt, 0.016)));

		var a = this._acceleration * dt;

		this._velocity.y = Math.min(this._velocity.y, this._maxVelocity.y);
		this._velocity.y = Math.max(this._velocity.y, -this._maxVelocity.y);

		if (!this._collided)
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

			this._collided = true;

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

	updateVisuals: function(targets, dt)
	{
		var t = this._position;

		if (this._dead == true)
		{
			this._deathTimer += dt;

			this.setTranslation(t.x, t.y);
			return;
		}

		if (this._collided)
		{
			this._timer += dt;
			if (this._timer < this._explosionDelay)
			{
				this.setAlpha(Math.abs(Math.sin(this._timer * 40)));
			}
			else
			{
				this._explosionTimer += dt;
				this._size = Math.lerp(this._minimum, this._maxSize, this._explosionTimer / this._explosionMax);

				var shake = Math.shake(3, this._explosionTimer / this._explosionMax);
				var ct = Game.camera.translation();

				if (this._explosionTimer > this._explosionMax)
					this._explosionTimer = this._explosionMax;
				
				Game.camera.setTranslation(ct.x + shake.x, ct.y + shake.y, ct.z);

				if (this._size > this._maxSize)
				{
					this._size = this._maxSize;

					this._idleTimer += dt;
					if (this._idleTimer > this._idleMax)
					{
						this._implosionTimer += dt;

						if (!this._velocitySet)
						{
							this._velocitySet = true;
							this._velocity = {x:0,y:-780};
						}

						this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Vector2D.mul(Game.gravity, 0.9), Math.min(dt, 0.016)));
						this._position = Vector2D.add(this._position, Vector2D.mul(this._velocity, dt));

						this._size = Math.lerp(this._maxSize, 0, Math.easeBackInCubic(
							this._implosionTimer / this._implosionMax,
							0, 1, 1
						));

						if (this._implosionTimer / this._implosionMax > 1)
						{
							this._gone = true;
							this._size = 0;
						}
					}

					for (var i = 0; i < targets.length; i++)
					{
						if (Math.distance(targets[i].position().x, targets[i].position().y, this.position().x, this.position().y) < this._size / 2)
						{
							targets[i].hurt(10, this);
						}
					}
				}

				this.setAlpha(1);
			}
		}

		this.setSize(this._size, this._size);

		this.setTranslation(t.x, t.y, 2);
	},

	isDead: function ()
	{
		return !!this._gone;
	},

	removeYourself: function ()
	{
		this.destroy();
	}
});
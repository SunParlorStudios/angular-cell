var Enemy = Enemy || function (parent) 
{
	Enemy._super.constructor.call(this, parent);

	this._velocity = Vector2D.construct(0, 0);
	this._acceleration = 500;
	this._maxVelocity = Vector2D.construct(800, 2000);
	this._position = Vector2D.construct(0, -500);
	this._jumpHeight = 1200;
	this._margin = 10;

	this._size = Vector2D.construct(40, 110);
	this._friction = 2;
	this._punchMax = 0.9;
	this._punchTimer = this._punchMax;
	this._deathMax = 1;
	this._deathTimer = this._deathMax;

	this._dead = false;

	this.setSize(194, 256);
	this.spawn("Default");
	this.setEffect("effects/cull_none.effect");
	this.setTechnique("Diffuse");
	this.setDiffuseMap("textures/henchman/henchman_sheet.png");
	this.setOffset(0.5, 0.5);

	this._idleAnimation = new SpriteAnimation("animations/henchman_idle.anim", "textures/henchman/henchman_sheet.png");
	this._walkAnimation = new SpriteAnimation("animations/henchman_walk.anim", "textures/henchman/henchman_sheet.png");
	this._attackAnimation = new SpriteAnimation("animations/henchman_attack.anim", "textures/henchman/henchman_sheet.png");

	this.setAnimation(this._idleAnimation);
	this._idleAnimation.play();

	this._walkAnimation.setSpeed(4);
	this._attackAnimation.setSpeed(5);

	this._attackMax = 1;
	this._attackTimer = this._attackMax;
};

_.inherit(Enemy, Quad);

_.extend(Enemy.prototype, {
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

		if (this._doJump)
		{
			this._velocity.y = -this._jumpHeight;
			this._doJump = !this._doJump;
		}

		var a = this._acceleration * dt;

		if (target.position().x < this._position.x)
			this._velocity.x -= a;

		if (target.position().x > this._position.x)
			this._velocity.x += a;

		if (Math.distance(target.position().x, target.position().y, this._position.x, this._position.y) < 180 && this._attackTimer == this._attackMax)
		{
			this._velocity.x *= 0.01;

			this._walkAnimation.stop();
			this.setAnimation(this._attackAnimation);
			this._attackAnimation.play();
			this._attackTimer = 0;
			this._attacked = false;
		}

		if (this._attackTimer < this._attackMax)
		{
			this._attackTimer += dt;

			if (this._attackTimer > this._attackMax)
			{
				this._attackTimer = this._attackMax;
				this._attacked = false;
			}

			if (this._attackTimer > this._attackMax * 0.8 && Math.distance(target.position().x, target.position().y, this._position.x, this._position.y) < 180 && !this._attacked)
			{
				target.hurt(10, this);
				this._attacked = true;
			}
		}
		else
		{
			this.setAnimation(this._walkAnimation);
			this._walkAnimation.play();
		}

		if (this._velocity.y > 0 || this._velocity.y < 0)
		{
			this._grounded = false;
		}
		
		if (this._dead == false && this._punchTimer == this._punchMax)
		{
			this._velocity.x = Math.min(this._velocity.x, this._maxVelocity.x);
			this._velocity.x = Math.max(this._velocity.x, -this._maxVelocity.x);
		}

		this._velocity.y = Math.min(this._velocity.y, this._maxVelocity.y);

		this._position = Vector2D.add(this._position, Vector2D.mul(this._velocity, dt));
	},

	resolveCollisions: function(target, blocks, dt)
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

				if (Math.distance(target.position().x, target.position().y, this._position.x, this._position.y) > 200 && target.position().y < this._position.y)
					this._doJump = true;
			}
		}
	},

	updateVisuals: function(target, dt)
	{
		var t = this._position;

		if (this._dead == true)
		{
			this.setTranslation(t.x, t.y);
			return;
		}

		if (this._punchTimer < this._punchMax)
		{
			Game.camera.setZoom(Math.lerp(1, 1.2, this._punchTimer / this._punchMax));
			this.setTranslation(t.x, t.y);
			return;
		}

		if (target.position().x < this._position.x)
		{
			this.setScale(-1, 1);
		}
		else
		{
			this.setScale(1, 1);
		}
		
		this.setTranslation(t.x, t.y, 2);
	}
});
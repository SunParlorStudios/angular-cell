var Enemy = Enemy || function (parent) 
{
	Enemy._super.constructor.call(this, parent);

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

	this.setSize(146, 192);
	this.spawn("Default");
	this.setEffect("effects/cull_none.effect");
	this.setTechnique("Diffuse");
	this.setDiffuseMap("textures/henchman/henchman_sheet.png");
	this.setOffset(0.5, 0.5);

	this._idleAnimation = new SpriteAnimation("animations/henchman_idle.anim", "textures/henchman/henchman_sheet.png");
	this._walkAnimation = new SpriteAnimation("animations/henchman_walk.anim", "textures/henchman/henchman_sheet.png");
	this._attackAnimation = new SpriteAnimation("animations/henchman_attack.anim", "textures/henchman/henchman_sheet.png");
	this._deathAnimation = new SpriteAnimation("animations/henchman_death.anim", "textures/henchman/henchman_sheet.png");

	this.setAnimation(this._idleAnimation);
	this._idleAnimation.play();

	this._walkAnimation.setSpeed(4);
	this._attackAnimation.setSpeed(4);
	this._deathAnimation.setSpeed(4);

	this._attackMax = 0.5;
	this._attackTimer = this._attackMax;

	this._hurting = false;
	this._hurtMax = 0.3;
	this._hurtTimer = this._hurtMax;

	this._health = 30;
	this.setZ(100);
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

		if (this._doJump && this._grounded)
		{
			this._velocity.y = -this._jumpHeight;
			this._doJump = !this._doJump;
		}

		var a = this._acceleration * dt;

		if (!this._dead)
		{
			if (target.position().x < this._position.x)
				this._velocity.x -= a;

			if (target.position().x > this._position.x)
				this._velocity.x += a;

			if (Math.distance(target.position().x, target.position().y, this._position.x, this._position.y) < 140 && this._attackTimer == this._attackMax && !this._hurting)
			{
				this._walkAnimation.stop();
				this.setAnimation(this._attackAnimation);
				this._attackAnimation.play();
				this._attackTimer = 0;
				this._attacked = false;
			}

			if (this._attackTimer < this._attackMax)
			{
				this._velocity.x *= 0.80;
				this._attackTimer += dt;

				if (this._attackTimer > this._attackMax)
				{
					this._attackTimer = this._attackMax;
					this._attacked = false;
				}

				if (this._attackTimer > this._attackMax * 0.7 && Math.distance(target.position().x, target.position().y, this._position.x, this._position.y) < 100 && !this._attacked)
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
		}
		else
		{
			this._velocity.x *= 0.95;
			this._velocity.y *= 0.95;
		}

		if (this._velocity.y > 0 || this._velocity.y < 0)
		{
			//this._grounded = false;
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

				if (Math.distance(target.position().x, target.position().y, this._position.x, this._position.y) > 200)
					this._doJump = true;
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

		if (this._hurting)
		{
			this._hurtTimer += dt;
			this.setAlpha(Math.abs(Math.sin(this._hurtTimer * 20)));

			if (this._hurtTimer > this._hurtMax)
			{
				this.setAlpha(1);
				this._hurting = false;

				this.setAnimation(this._walkAnimation);
			}
		}

		this.setTranslation(t.x, t.y + this._margin, 2);
	},

	hurt: function (damage, source, modifier)
	{
		if (modifier == undefined)
			modifier = 1;

		if (!this._hurting)
		{
			this._health -= damage;

			if (this._health <= 0)
			{
				this.setRotation(0, 0, 0);
				this._dead = true;
				this.setAnimation(this._deathAnimation);
				this._deathAnimation.stop();
				this._deathAnimation.setFrame(0);
				this._deathAnimation.play();
				this._deathTimer = 0;

				if (this.scale().x < 0)
				{
					this._velocity = {
						x: 1200,
						y: -800
					}
				}
				else
				{
					this._velocity = {
						x: -1200,
						y: -800
					}
				}
			}
			else
			{
				this._attackTimer = this._attackMax;

				this._controlsUsedDuringHurt = false;
				this._hurting = true;
				this._hurtTimer = 0;

				if (source.position().x > this._position.x)
				{
					this._velocity = {
						x: -this._hurtForce.x * modifier,
						y: this._hurtForce.y
					};
				}
				else
				{
					this._velocity = {
						x: this._hurtForce.x * modifier,
						y: this._hurtForce.y
					};
				}
			}
		}
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
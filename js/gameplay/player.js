Enum('Weapon', [
	'HammerHead']);

var Player = function(map, parent)
{
	Player._super.constructor.call(this, parent);
	this._velocity = Vector2D.construct(0, 0);
	this._acceleration = 4000;
	this._maxVelocity = Vector2D.construct(800, 2000);
	this._position = Vector2D.construct(0, -300);
	this._jumpHeight = 1200;
	this._hurtForce = Vector2D.construct(1300, -700);
	this._margin = 10;
	this._wobbleSpeed = 20;
	this._wobbleAngle = 16;
	this._wobbleHeight = 12;
	this._size = Vector2D.construct(40, 110);
	this._rotateSpeed = 20;
	this._friction = 0.95;
	this._frameRate = 5;
	this._parallaxSpeed = 20;
	this._grounded = false;
	this._maxCameraDistance = 75;
	this._camSpeed = 0.75;
	this._punchMax = 0.9;
	this._punchTimer = this._punchMax;

	this._deathMax = 1;
	this._deathTimer = this._deathMax;
	this._map = map;
	this._dead = false;

	this._health = 100;

	this._weaponBeingUsed = false;
	this._weaponInUse = 0;
	this._weaponTimer = 0;
	this._hammerHeadMax = 0.3;

	this._hurting = false;
	this._hurtMax = 2;
	this._hurtTimer = this._hurtMax;

	this._weapon = new Quad(this);
	this._weapon.setSize(256, 128);
	this._weapon.setDiffuseMap("textures/player/hammer_head.png");
	this._weapon.setEffect("effects/cull_none.effect");
	this._weapon.setTechnique("Diffuse");
	this._weapon.setOffset(0.5, 0.5);
	this._weapon.setTranslation(0, -30, 99);
	this._weapon.spawn("Default");
}

_.inherit(Player, Quad);

_.extend(Player.prototype, {
	initialise: function()
	{
		this.setSize(128, 128);
		this.spawn("Default");
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.setOffset(0.5, 0.5);
		this.setZ(101);

		this.setDiffuseMap("textures/player/player_sheet.png");
		this._walkAnimation = new SpriteAnimation("animations/player_walk.anim", "textures/player/player_sheet.png");
		this._punchAnimation = new SpriteAnimation("animations/player_punch.anim", "textures/player/player_sheet.png");
		this._deathAnimation = new SpriteAnimation("animations/player_death.anim", "textures/player/player_sheet.png");
		this._attackAnimation = new SpriteAnimation("animations/player_attack.anim", "textures/player/player_sheet.png");
		this._hurtAnimation = new SpriteAnimation("animations/player_hurt.anim", "textures/player/player_sheet.png");

		this._hammerHeadAnimation = new SpriteAnimation("animations/weapon_hammer_head.anim", "textures/player/hammer_head.png");
		
		this.setAnimation(this._walkAnimation);
		this._walkAnimation.play();
		this._walkAnimation.setSpeed(0);

		this._punchAnimation.setSpeed(4);
		this._deathAnimation.setSpeed(4);
		this._attackAnimation.setSpeed(3);

		this.switchWeapon();
	},

	size: function()
	{
		return this._size;
	},

	position: function()
	{
		return this._position;
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

	switchWeapon: function ()
	{
		this._weaponInUse++;
		if (this._weaponInUse >= 1)
		{
			this._weaponInUse = 0;
		}

		switch (this._weaponInUse)
		{
			case Weapon.HammerHead:
				this._weapon.setAnimation(this._hammerHeadAnimation);
				this._hammerHeadAnimation.setFrame(0);
				this._hammerHeadAnimation.stop(4);
				break;
		}
	},

	useWeapon: function ()
	{
		this._weaponBeingUsed = true;
		this._weaponTimer = 0;

		switch (this._weaponInUse)
		{
			case Weapon.HammerHead:
				this._weapon.setAnimation(this._hammerHeadAnimation);
				this._hammerHeadAnimation.setFrame(0);
				this._hammerHeadAnimation.setSpeed(5);
				this._hammerHeadAnimation.play();

				this.setAnimation(this._attackAnimation);
				this._attackAnimation.setSpeed(5);
				this._attackAnimation.play();
				break;
		}
	},

	move: function(dt, enemies)
	{
		if (Keyboard.isPressed(Key.Q))
		{
			this.setRotation(0, 0, 0);
			this._camPos = Game.camera.translation();
			this._dead = true;
			this.setAnimation(this._deathAnimation);
			this._deathAnimation.stop();
			this._deathAnimation.setFrame(0);
			this._deathAnimation.play();
			this._deathTimer = 0;
			this._velocity = {
				x: -1200,
				y: -800
			}
		}

		if (this._dead == true)
		{
			if (this._deathTimer < this._deathMax)
			{
				var shake = Math.shake(33, this._deathTimer);
				Game.camera.setTranslation(this._camPos.x + shake.x, this._camPos.y + shake.y, 0);
				this._deathTimer += dt * 3;

				this._deathTimer = Math.min(this._deathTimer, this._deathMax);
			}
		}

		if (this._dead == false)
		{
			if (this._weaponBeingUsed === false)
			{
				if (Keyboard.isPressed(Key.E))
				{
					this.switchWeapon();
				}

				if (Keyboard.isPressed(Key.Space) && this._punchTimer == this._punchMax && this._grounded)
				{
					this.setAnimation(this._punchAnimation);
					this._punchAnimation.play();
					this._punchTimer = 0;
					this._velocity.x = 50;
					this._velocity.y = -900;
				}

				if (this._punchTimer < this._punchMax)
				{
					this._punchTimer += dt;
					this._punchTimer = Math.min(this._punchTimer, this._punchMax);
				}
				else
				{
					this._punchAnimation.stop();
					this.setAnimation(this._walkAnimation);
				}

				if (Keyboard.isPressed(Key.F))
				{
					this.useWeapon();
				}
			}
			else
			{
				this._weaponTimer += dt;
				switch(this._weaponInUse)
				{
					case Weapon.HammerHead:
						if (this._weaponTimer > this._hammerHeadMax)
						{
							this._weaponBeingUsed = false;
							this._hammerHeadAnimation.setFrame(0);
							this._hammerHeadAnimation.stop();

							this._attackAnimation.stop();
							this.setAnimation(this._walkAnimation);
							this._walkAnimation.play();

							if (this._weaponTimer > this._hammerHeadMax * 0.5)
							{
								for (var i = 0; i < enemies.length; i++)
								{
									if ((enemies[i].position().x < this._position.x && this.scale().x < 0) || (enemies[i].position().x > this._position.x && this.scale().x > 0))
									{
										if (Math.distance(enemies[i].position().x, enemies[i].position().y, this.position().x, this.position().y) < 126)
										{
											enemies[i].hurt(10, this);
										}
									}
								}
							}
						}
						break;
				}
			}
		}
		

		this._previousVelocity = this._velocity;
		if (Keyboard.isDown(Key.W) && this._grounded == true && this._dead == false)
		{
			this._velocity.y = -this._jumpHeight;
		}

		var a = this._acceleration * dt;

		this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Game.gravity, Math.min(dt, 0.016)));

		if (this._velocity.y > 0 || this._velocity.y < 0)
		{
			this._grounded = false;
		}
		
		if (Keyboard.isDown(Key.A) && this._dead == false && this._punchTimer == this._punchMax)
		{
			this._controlsUsedDuringHurt = true;

			if (this._velocity.x > 0)
				this._velocity.x = 0;
			this._velocity.x -= a;
		}
		else if (Keyboard.isDown(Key.D) && this._dead == false && this._punchTimer == this._punchMax)
		{
			this._controlsUsedDuringHurt = true;


			if (this._velocity.x < 0)
				this._velocity.x = 0;
			this._velocity.x += a;
		}
		else if (this._velocity.x !== 0)
		{
			if (this._velocity.x > 0)
			{
				this._velocity.x -= a * this._friction;
			}
			else if (this._velocity.x < 0)
			{
				this._velocity.x += a * this._friction;
			}

			if ((this._previousVelocity.x < 0 && this._velocity.x) > 0 || (this._previousVelocity.x > 0 && this._velocity.x < 0))
			{
				this._velocity.x = 0;
			}
		}

		this._velocity.x = Math.min(this._velocity.x, this._maxVelocity.x);
		this._velocity.x = Math.max(this._velocity.x, -this._maxVelocity.x);

		this._velocity.y = Math.min(this._velocity.y, this._maxVelocity.y);

		this._position = Vector2D.add(this._position, Vector2D.mul(this._velocity, dt));
	},

	updateVisuals: function(dt)
	{
		var t = this._position;

		var ct = Game.camera.translation();
		var dist = Math.distance(ct.x, ct.y, t.x, t.y);

		if (dist > this._maxCameraDistance)
		{
			var r = dist / this._maxCameraDistance;
			Game.camera.translateBy((t.x - ct.x) * r * dt * this._camSpeed, (t.y - 100 - ct.y) * r * dt * this._camSpeed, 0, 1);
		}

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
		else
		{
			if (Game.camera.zoom() > 0.75)
			{
				var z = Game.camera.zoom() - dt;
				Game.camera.setZoom(Math.max(z, 0.75));
			}
		}
		var ratio = Math.abs(this._velocity.x) / this._maxVelocity.x;
		this._walkAnimation.setSpeed(ratio * this._frameRate);
		ParallaxManager.move((this._velocity.x / this._maxVelocity.x) * this._parallaxSpeed);
		if (ratio < 0.025)
		{
			this._walkAnimation.setFrame(0);
			this._walkAnimation.stop();
		}
		else
		{
			this.setScale(Math.abs(this._velocity.x) / this._velocity.x, 1);
			this._walkAnimation.play();
		}

		var wobble
		if (this._grounded == false)
		{
			this.rotateBy(0, 0, dt * this._rotateSpeed * this.scale().x);
		}
		else
		{
			wobble = Math.sin(Game.time() * this._wobbleSpeed) / this._wobbleAngle * ratio;
			this.setRotation(0, 0, wobble);
		}

		wobble = Math.abs(Math.sin(Game.time() * this._wobbleSpeed / 1.5)) * this._wobbleHeight * ratio;

		if (this._hurting)
		{
			if (!this._controlsUsedDuringHurt)
			{
				this.setAnimation(this._hurtAnimation);
			}

			this._hurtTimer += dt;
			this.setAlpha(Math.abs(Math.sin(this._hurtTimer * 20)));

			if (this._hurtTimer > this._hurtMax)
			{
				this.setAlpha(1);
				this._hurting = false;

				this.setAnimation(this._walkAnimation);
			}
		}
		
		this.setTranslation(t.x, t.y + wobble, -3);
	},

	hurt: function (damage, source)
	{
		if (!this._hurting)
		{
			this._health -= damage;

			if (this._health <= 0)
			{
				this.setRotation(0, 0, 0);
				this._camPos = Game.camera.translation();
				this._dead = true;
				this.setAnimation(this._deathAnimation);
				this._deathAnimation.stop();
				this._deathAnimation.setFrame(0);
				this._deathAnimation.play();
				this._deathTimer = 0;

				if (this.scale().x < 0)
				{
					this._velocity = {
						x: -1200,
						y: -800
					}
				}
				else
				{
					this._velocity = {
						x: 1200,
						y: -800
					}
				}
			}
			else
			{
				this.setAnimation(this._hurtAnimation);
				this._hurtAnimation.setSpeed(1);
				this._hurtAnimation.play();

				this._controlsUsedDuringHurt = false;
				this._hurting = true;
				this._hurtTimer = 0;

				if (source.position().x > this._position.x)
				{
					this._velocity = {
						x: -this._hurtForce.x,
						y: this._hurtForce.y
					};
				}
				else
				{
					this._velocity = {
						x: this._hurtForce.x,
						y: this._hurtForce.y
					};
				}
			}
		}
	},

	update: function(blocks, enemies, dt)
	{
		this.move(dt, enemies);

		this.resolveCollisions(blocks, dt);
		this.updateVisuals(dt);
	}
})
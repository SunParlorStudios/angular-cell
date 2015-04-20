Enum('Weapon', [
	'None',
	'HammerHead',
	'SwordFish']);

require('js/gameplay/puffer_fish');

var Puff = function(t, direction)
{
	Puff._super.constructor.call(this);
	this._direction = direction - Math.random() * Math.PI;
	this._speed = Math.randomRange(10, 50);
	this._upSpeed = Math.randomRange(100, 150);
	this._maxSpeed = this._speed;
	this._rotationSpeed = Math.randomRange(5, 20);
	this.setTranslation(t.x, t.y + 60, t.z - 0.1);

	this.setOffset(0.5, 0.5);
	this.setSize(48, 48);
	this.setTechnique("Diffuse");
	this.spawn("Default");

	var tex = [
		"textures/particles/puff_a.png",
		"textures/particles/puff_b.png"
	]
	this.setDiffuseMap(tex[Math.floor(Math.random() * 2)]);
	this.setEffect("effects/cull_none.effect");
	this.setRotation(0, 0, Math.random() * Math.PI * 2);
	this.setScale(0, 0);
}

_.inherit(Puff, Quad);

_.extend(Puff.prototype, {
	update: function(dt)
	{
		this._speed -= dt * 200;
		this._speed = Math.max(this._speed, 0);
		var movement = Vector2D.construct(
			Math.cos(this._direction) * this._speed * dt,
			Math.sin(this._direction) * this._speed * dt
		)
		this.translateBy(movement.x, movement.y - this._upSpeed * dt);
		this.rotateBy(0, 0, this._rotationSpeed * dt);
		var r = this._speed / this._maxSpeed;

		this.setAlpha(r * 0.8);

		this.setScale(1 - r, 1 - r);

		if (r <= 0)
		{
			return false;
		}

		return true;
	}
});

var HitPfx = function(t)
{
	HitPfx._super.constructor.call(this);
	this._direction = Math.random() * Math.PI * 2;
	this._speed = Math.randomRange(1000, 1300);
	this._maxSpeed = this._speed;
	
	this.setTranslation(t.x, t.y, t.z - 0.1);

	this.setOffset(0.5, 0.5);
	this.setSize(64, 64);
	this.setTechnique("Diffuse");
	this.spawn("Default");

	var tex = [
		"textures/particles/hit_a.png",
		"textures/particles/hit_b.png"
	]
	this.setDiffuseMap(tex[Math.floor(Math.random() * 2)]);
	this.setEffect("effects/cull_none.effect");
	this.setScale(4, 4);
	this.setRotation(0, 0, this._direction)
}

_.inherit(HitPfx, Quad);

_.extend(HitPfx.prototype, {
	update: function(dt)
	{
		this._speed -= dt * 2000;
		this._speed = Math.max(this._speed, 0);
		var movement = Vector2D.construct(
			Math.cos(this._direction) * this._speed * dt,
			Math.sin(this._direction) * this._speed * dt
		)
		this.translateBy(movement.x, movement.y);
		
		var r = this._speed / this._maxSpeed;

		this.setAlpha(r);

		this.setScale(4 - r, 4 - r);

		if (r <= 0)
		{
			return false;
		}

		return true;
	}
});

var Player = function(map, parent)
{
	Player._super.constructor.call(this, parent);
	this._velocity = Vector2D.construct(0, 0);
	this._acceleration = 4000;
	this._maxVelocity = Vector2D.construct(800, 2000);
	this._position = Vector2D.construct(0, -300);
	this._jumpHeight = 1900;
	this._hurtForce = Vector2D.construct(800, -1200);
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

	this._health = 20;

	this._weaponBeingUsed = false;
	this._weaponInUse = 0;
	this._hammerHeadTimer = 0;
	this._hammerHeadMax = 0.6;
	this._swordFishTimer = 0;
	this._swordFishMax = 0.4;

	this._pufferThrowMax = 0.2;
	this._pufferThrowTimer = this._pufferThrowMax;

	this._hurting = false;
	this._hurtMax = 2;
	this._hurtTimer = this._hurtMax;

	this._weapon = new Quad(this);
	this._weapon.setSize(512, 256);
	this._weapon.setDiffuseMap("textures/player/hammer_head.png");
	this._weapon.setEffect("effects/cull_none.effect");
	this._weapon.setTechnique("Diffuse");
	this._weapon.setOffset(0.5, 0.5);
	this._weapon.setTranslation(0, -90, -9);
	this._weapon.spawn("Default");

	this._currentWeapon = Weapon.SwordFish;
	this._shakeTimer = 1;
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

		this.setDiffuseMap("textures/player/player_sheet.png");
		this._walkAnimation = new SpriteAnimation("animations/player_walk.anim", "textures/player/player_sheet.png");
		this._punchAnimation = new SpriteAnimation("animations/player_punch.anim", "textures/player/player_sheet.png");
		this._deathAnimation = new SpriteAnimation("animations/player_death.anim", "textures/player/player_sheet.png");
		this._attackAnimation = new SpriteAnimation("animations/player_attack.anim", "textures/player/player_sheet.png");
		this._hurtAnimation = new SpriteAnimation("animations/player_hurt.anim", "textures/player/player_sheet.png");

		this._hammerHeadAnimation = new SpriteAnimation("animations/weapon_hammer_head.anim", "textures/player/hammer_head.png");
		this._swordFishAnimation = new SpriteAnimation("animations/weapon_sword_fish.anim", "textures/player/weapons.png");
		this._weaponEmptyAnimation = new SpriteAnimation("animations/weapon_empty.anim", "textures/player/hammer_head.png");
		
		this.setAnimation(this._walkAnimation);
		this._walkAnimation.play();
		this._walkAnimation.setSpeed(0);

		this._punchAnimation.setSpeed(4);
		this._deathAnimation.setSpeed(4);
		this._attackAnimation.setSpeed(3);

		this._weapon.setAnimation(this._weaponEmptyAnimation);
		this._weaponEmptyAnimation.play();
		this._camPos = Vector2D.construct(0, 0);
		this._weaponHit = false;
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

	useWeapon: function ()
	{
		this._weaponBeingUsed = true;

		switch (this._currentWeapon)
		{
			case Weapon.SwordFish:
				this._swordFishTimer = 0;

				this._weapon.setRotation(0, 0, 0);
				this._weapon.setTranslation(0, 0, -9);
				this._weapon.setSize(256, 256);
				this._weapon.setOffset(0, 0.5);
				this._weapon.setDiffuseMap('textures/player/weapons.png');

				this._weapon.setAnimation(this._swordFishAnimation);
				this._swordFishAnimation.setFrame(0);
				this._swordFishAnimation.setSpeed(5);
				this._swordFishAnimation.play();

				this.setAnimation(this._attackAnimation);
				this._attackAnimation.setFrame(0);
				this._attackAnimation.setSpeed(4);
				this._attackAnimation.play();
				break;
			case Weapon.HammerHead:
				this._hammerHeadTimer = 0;

				this._weapon.setRotation(0, 0, 0.12);
				this._weapon.setTranslation(0, -90, -9);
				this._weapon.setOffset(0.5, 0.5);
				this._weapon.setSize(512, 256);
				this._weapon.setDiffuseMap("textures/player/hammer_head.png");

				this._weapon.setAnimation(this._hammerHeadAnimation);
				this._hammerHeadAnimation.setFrame(0);
				this._hammerHeadAnimation.setSpeed(5);
				this._hammerHeadAnimation.play();

				this.setAnimation(this._attackAnimation);
				this._attackAnimation.setFrame(0);
				this._attackAnimation.setSpeed(5);
				this._attackAnimation.play();
				break;
		}
	},

	throwPuffer: function ()
	{
		this._pufferThrowTimer = 0;
		this.setAnimation(this._attackAnimation);
		this._attackAnimation.setSpeed(8);
		this._attackAnimation.stop();
		this._attackAnimation.play();
		this._weaponBeingUsed = true;

		this._thrown = false;
	},

	shake: function(mag, duration)
	{
		this._magnitude = mag;
		this._shakeDuration = duration;
		this._shakeTimer = 0;
	},

	move: function(dt, enemies, map)
	{
		if (this._shakeTimer < 1)
		{
			var shake = Math.shake(this._magnitude, this._shakeTimer);
			Game.camera.setTranslation(this._camPos.x + shake.x, this._camPos.y + shake.y, 0);
			this._shakeTimer += dt * 1 / this._duration;

			this._shakeTimer = Math.min(this._shakeTimer, 1);
		}

		if (this._dead == false)
		{
			if (this._weaponBeingUsed === false)
			{
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

				if (Keyboard.isPressed(Key[1]))
				{
					this._currentWeapon = Weapon.HammerHead;
				}

				if (Keyboard.isPressed(Key[2]))
				{
					this._currentWeapon = Weapon.SwordFish;
				}

				if (Mouse.isPressed(MouseButton.Left))
				{
					this.useWeapon();
				}

				if (Mouse.isPressed(MouseButton.Middle))
				{
					this.throwPuffer();
				}
			}
			else
			{
				if (this._hammerHeadTimer < this._hammerHeadMax)
				{
					this._hammerHeadTimer += dt;
					if (this._hammerHeadTimer > this._hammerHeadMax * 0.5)
					{
						for (var i = 0; i < enemies.length; i++)
						{
							if ((enemies[i].position().x < this._position.x && this.scale().x < 0) || (enemies[i].position().x > this._position.x && this.scale().x > 0))
							{
								if (Math.distance(enemies[i].position().x, enemies[i].position().y, this.position().x, this.position().y) < 256)
								{
									if (enemies[i].canHurt() == true)
									{
										this._map.addParticle(new HitPfx(this.translation()));
									}
									
									enemies[i].hurt(10, this);
									this.shake(24, 0.1);								
								}
							}
						}
					}
				}
				else if (this._swordFishTimer < 0.3)
				{
					this._swordFishTimer += dt;

					var maxSize = 256;
					var minSize = 0;

					var size = Math.lerp(minSize, maxSize, Math.easeOutQuadratic((this._swordFishTimer) / 0.1, 0, 1, 1));

					if (this._swordFishTimer >= 0.1)
					{
						this._attackAnimation.stop(0);

						for (var i = 0; i < enemies.length; i++)
						{
							if ((enemies[i].position().x < this._position.x && this.scale().x < 0) || (enemies[i].position().x > this._position.x && this.scale().x > 0))
							{
								if (Math.distance(enemies[i].position().x, enemies[i].position().y, this.position().x, this.position().y) < 256)
								{
									if (enemies[i].canHurt() == true)
									{
										this._map.addParticle(new HitPfx(this.translation()));
									}

									enemies[i].hurt(10, this);
									this.shake(24, 0.1);
								}
							}
						}

						size = Math.lerp(maxSize, minSize, Math.easeInQuadratic((this._swordFishTimer - 0.1) / 0.3, 0, 1, 1))
					}

					if (size < minSize)
					{
						size = 0;
					}

					this._weapon.setSize(size, (size / maxSize) * 56 + 200);
				}
				else if (this._pufferThrowTimer < this._pufferThrowMax)
				{
					this._pufferThrowTimer += dt;
					if (this._pufferThrowTimer / this._pufferThrowMax > 0.6 && !this._thrown)
					{
						this._thrown = true;

						var mousePos = Mouse.position(MousePosition.Relative);
						mousePos.x += Game.camera.translation().x;
						mousePos.y += Game.camera.translation().y;

						var dist = Math.distance(mousePos.x, mousePos.y, this._position.x, this._position.y);
						var a = Math.atan2(this._position.y - mousePos.y, this._position.x - mousePos.x);

						map._pufferFish.push( 
							new PufferFish(
								this._position,
								Vector2D.construct(
									Math.cos(a) * dist * 7 * -1,
									Math.sin(a) * dist * 7 * -1
								)
							)
						);
					}
				}
				else
				{
					this._weaponBeingUsed = false;

					this._hammerHeadAnimation.stop();
					this._swordFishAnimation.stop();
					this._weapon.setAnimation(this._weaponEmptyAnimation);
					this._weaponEmptyAnimation.play();
					this._weaponEmptyAnimation.setSpeed(0);
				}
			}
		}
		

		this._previousVelocity = this._velocity;
		if (Keyboard.isDown(Key.W) && this._grounded == true && this._dead == false)
		{
			this._velocity.y = -this._jumpHeight;
		}

		var a = this._acceleration * dt;

		this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Game.gravity, dt));
		
		if (Keyboard.isDown(Key.A) && this._dead == false && this._punchTimer == this._punchMax)
		{
			this._controlsUsedDuringHurt = true;

			if (this._velocity.x > 0)
				this._velocity.x = 0;
			this._velocity.x -= a;
			this._velocity.x = Math.min(this._velocity.x, this._maxVelocity.x);

			if (this._grounded == true)
			{
				var ang = this._velocity.x < 0 ? 0 : Math.PI;
				this._map.addParticle(new Puff(this.translation(), ang));
			}
		}
		else if (Keyboard.isDown(Key.D) && this._dead == false && this._punchTimer == this._punchMax)
		{
			this._controlsUsedDuringHurt = true;


			if (this._velocity.x < 0)
				this._velocity.x = 0;
			this._velocity.x += a;
			this._velocity.x = Math.min(this._velocity.x, this._maxVelocity.x);

			if (this._grounded == true)
			{
				var ang = this._velocity.x < 0 ? 0 : Math.PI;
				this._map.addParticle(new Puff(this.translation(), ang));
			}
		}
		else if (this._velocity.x !== 0 && this._hurting == false)
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

		if (this._velocity.y > 0 || this._velocity.y < 0)
		{
			this._grounded = false;
		}

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
			var mx = (t.x - ct.x) * r * dt * this._camSpeed;
			var my = (t.y - 100 - ct.y) * r * dt * this._camSpeed;
			Game.camera.translateBy(mx, my, 0, 1);
			this._camPos.x += mx;
			this._camPos.y += my;
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
		
		if (!this._weaponBeingUsed)
		{
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
		}
		else
		{
			var mousePos = Mouse.position(MousePosition.Relative);
			mousePos.x += Game.camera.translation().x;
			mousePos.y += Game.camera.translation().y;

			if (mousePos.x < this._position.x)
				this.setScale(-1, 1);
			else
				this.setScale(1, 1);
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

			this._hurtTimer += dt * 3;
			this.setAlpha(Math.abs(Math.sin(this._hurtTimer * 20)));

			if (this._hurtTimer > this._hurtMax)
			{
				this.setAlpha(1);
				this._hurting = false;

				this.setAnimation(this._walkAnimation);
			}
		}
		
		this.setTranslation(t.x, t.y + wobble, -10);
	},

	hurt: function (damage, source)
	{
		if (!this._hurting)
		{
			this._health -= damage;

			if (this._health <= 0)
			{
				this.shake(33, 3);
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

	update: function(blocks, enemies, map, dt)
	{
		this.move(dt, enemies, map);

		this.resolveCollisions(blocks, dt);
		this.updateVisuals(dt);
	}
})
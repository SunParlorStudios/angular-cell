var Player = function(parent)
{
	Player._super.constructor.call(this, parent);
	this._velocity = Vector2D.construct(0, 0);
	this._acceleration = 1200;
	this._maxVelocity = Vector2D.construct(800, 2000);
	this._position = Vector2D.construct(0, -300);
	this._jumpHeight = 1200;
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

	this._dead = false;
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
		
		this.setAnimation(this._walkAnimation);
		this._walkAnimation.play();
		this._walkAnimation.setSpeed(4);

		this._punchAnimation.setSpeed(4);
		this._deathAnimation.setSpeed(4);
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

	move: function(dt)
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
			if (Keyboard.isPressed(Key.Space) && this._punchTimer == this._punchMax && this._grounded)
			{
				this.setAnimation(this._punchAnimation);
				this._punchAnimation.play();
				this._punchTimer = 0;
			}

			if (this._punchTimer < this._punchMax)
			{
				this._punchTimer += dt;
				this._punchTimer = Math.min(this._punchTimer, this._punchMax);
				return;
			}
			else
			{
				this._punchAnimation.stop();
				this.setAnimation(this._walkAnimation);
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
		
		if (this._dead == false)
		{
			if (Keyboard.isDown(Key.A))
			{
				this._velocity.x -= a;
			}
			else if (Keyboard.isDown(Key.D))
			{
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
		}

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
			Game.camera.translateBy((t.x - ct.x) * r * dt * this._camSpeed, (t.y + 5 - ct.y) * r * dt * this._camSpeed, 0, 1);
		}

		if (this._dead == true)
		{
			this.setTranslation(t.x, t.y);
			return;
		}

		if (this._punchTimer < this._punchMax)
		{
			Game.camera.setZoom(Math.lerp(1, 1.2, this._punchTimer / this._punchMax));
			return;
		}
		else
		{
			if (Game.camera.zoom() > 1)
			{
				var z = Game.camera.zoom() - dt;
				Game.camera.setZoom(Math.max(z, 1));
			}
		}
		var ratio = Math.abs(this._velocity.x) / this._maxVelocity.x;
		this._walkAnimation.setSpeed(ratio * this._frameRate);
		ParallaxManager.move((this._velocity.x / this._maxVelocity.x) * this._parallaxSpeed);
		if (ratio < 0.1)
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
		
		this.setTranslation(t.x, t.y + wobble, 2);
	},

	update: function(blocks, dt)
	{
		this.move(dt);

		this.resolveCollisions(blocks, dt);
		this.updateVisuals(dt);
	}
})
var Player = function(parent)
{
	Player._super.constructor.call(this, parent);
	this._velocity = Vector2D.construct(0, 0);
	this._acceleration = 1200;
	this._maxVelocity = Vector2D.construct(500, 900);
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
		this._animation = new SpriteAnimation("animations/player.anim", "textures/player/player_sheet.png");
		
		this.setAnimation(this._animation);
		this._animation.play();
		this._animation.setSpeed(4);
	},

	size: function()
	{
		return this._size;
	},

	position: function()
	{
		return this._position;
	},

	getPenetration: function(block)
	{
		var p = this._position;
		var s = Vector2D.mul(this.size(), 0.5);

		var bt = block.translation();
		var bs = Vector2D.mul(block.size(), 0.5);

		var xpen = 0;
		var ypen = 0;

		if (p.x + s.x > bt.x - bs.x && p.x + s.x < bt.x)
		{
			var x1 = p.x + s.x;
			var x2 = bt.x - bs.x;

			xpen = x2 - x1;
		}
		else if (p.x - s.x < bt.x + bs.x && p.x - s.x > bt.x)
		{
			var x1 = p.x - s.x;
			var x2 = bt.x + bs.x;

			xpen = x2 - x1;
		}

		if (p.y + s.y > bt.y - bs.y && p.y + s.y < bt.y)
		{
			var y1 = p.y + s.y;
			var y2 = bt.y - bs.y;

			ypen = y2 - y1;
		}
		else if (p.y - s.y < bt.y + bs.y && p.y - s.y > bt.y)
		{
			var y1 = p.y - s.y;
			var y2 = bt.y + bs.y;

			ypen = y2 - y1;
		}

		return Vector2D.construct(xpen, ypen);
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
		this._previousVelocity = this._velocity;
		if (Keyboard.isDown(Key.W) && this._grounded == true)
		{
			this._velocity.y = -this._jumpHeight;
		}

		var a = this._acceleration * dt;

		this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Game.gravity, Math.min(dt, 0.016)));

		if (this._velocity.y > 0 || this._velocity.y < 0)
		{
			this._grounded = false;
		}
		
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
		this._velocity.y = Math.min(this._velocity.y, this._maxVelocity.y);

		this._position = Vector2D.add(this._position, Vector2D.mul(this._velocity, dt));
	},

	updateVisuals: function(dt)
	{
		var ratio = Math.abs(this._velocity.x) / this._maxVelocity.x;
		this._animation.setSpeed(ratio * this._frameRate);
		ParallaxManager.move((this._velocity.x / this._maxVelocity.x) * this._parallaxSpeed);
		if (ratio < 0.1)
		{
			this._animation.setFrame(0);
			this._animation.stop();
		}
		else
		{
			this.setScale(Math.abs(this._velocity.x) / this._velocity.x, 1);
			this._animation.play();
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
		
		var t = this._position;

		this.setTranslation(t.x, t.y + wobble, 2);
		Game.camera.setTranslation(t.x, t.y, 0);
	},

	update: function(blocks, dt)
	{
		this.move(dt);

		this.resolveCollisions(blocks, dt);
		this.updateVisuals(dt);
	}
})
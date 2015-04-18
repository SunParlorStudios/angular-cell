var Player = function(parent)
{
	Player._super.constructor.call(this, parent);
	this._velocity = Vector2D.construct(0, 0);
	this._maxVelocity = Vector2D.construct(500, 900);
	this._position = Vector2D.construct(0, -300);
	this._jumpHeight = 800;
	this._margin = 10;
	this._wobbleSpeed = 20;
	this._wobbleAngle = 16;
	this._wobbleHeight = 12;
}

_.inherit(Player, Quad);

_.extend(Player.prototype, {
	initialise: function()
	{
		this.setSize(64, 64);
		this.setBlend(0.9, 1, 0);
		this.spawn("Default");
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.setOffset(0.5, 0.5);

		var s = this.size();
		sy = s.y * 0.75;

		this._points = {
			bottom: Vector2D.construct(0, -s.y),
			top: Vector2D.construct(0, s.y),
			rightTop: Vector2D.construct(-s.x, -sy),
			leftTop: Vector2D.construct(s.x, -sy),
			rightBottom: Vector2D.construct(-s.x, sy),
			leftBottom: Vector2D.construct(s.x, sy)
		}
	},

	position: function()
	{
		return this._position;
	},

	handleCollision: function(block, collision)
	{
		var t = block.translation();
		var s = block.size();
		var size = this.size();

		switch(collision)
		{
			case Collision.Top:
				this._position.y = t.y - s.y / 2 - size.y / 2;
				this._velocity.y = 0;
				this._grounded = true;
			break;

			case Collision.Bottom:
				this._position.y = t.y + s.y / 2 + size.y / 2 + this._margin;
				this._velocity.y = 0;
			break;

			case Collision.Left:
				this._position.x = t.x - s.x / 2 - size.x / 2 - this._margin;
				this._velocity.x = 0;
			break;

			case Collision.Right:
				this._position.x = t.x + s.x / 2 + size.x / 2 + this._margin;
				this._velocity.x = 0;
			break;
		}
	},

	update: function(blocks, dt)
	{
		this._velocity = Vector2D.add(this._velocity, Vector2D.mul(Game.gravity, dt));

		if (Keyboard.isDown(Key.D) == true)
		{
			this._velocity.x = this._maxVelocity.x;
		}
		else if (Keyboard.isDown(Key.A) == true)
		{
			this._velocity.x = -this._maxVelocity.x;
		}
		else
		{
			this._velocity.x = 0;
		}

		var collision = undefined;
		var collisionData;

		for (var i = 0; i < blocks.length; ++i)
		{
			for (var p in this._points)
			{
				collision = blocks[i].checkCollision(this, this._points[p]);
				if (collision === true)
				{
					collisionData = {
						point: p,
						block: blocks[i]
					};
					break;
				}
			}

			if (collision === true)
			{
				break;
			}
		}

		if (collision !== false)
		{
			var point = collisionData.point;

			if (point == "bottom")
			{
				this.handleCollision(collisionData.block, Collision.Bottom);
			}
			else if (point == "top")
			{
				this.handleCollision(collisionData.block, Collision.Top);
			}
			else if (point == "leftBottom" || point == "leftTop")
			{
				this.handleCollision(collisionData.block, Collision.Left);
			}
			else if (point == "rightBottom" || point == "rightTop")
			{
				this.handleCollision(collisionData.block, Collision.Right);
			}
		}

		var moving = this._velocity.x > 0 || this._velocity.x < 0;
		var wobble = moving ? Math.abs(Math.sin(Game.time() * this._wobbleSpeed / 1.5) * this._wobbleHeight) : 0;

		var ct = Game.camera.translation();

		var dist = Math.distance(ct.x, ct.y, this._position.x, this._position.y);

		if (dist > 32)
		{
			var speed = dt * 1440;
			var r = dist / 720;

			if (Math.abs(this._position.x - ct.x) > 16)
			{
				if (ct.x < this._position.x)
				{
					Game.camera.translateBy(speed * r, 0, 0, 1);
				}
				else if (ct.x > this._position.x)
				{
					Game.camera.translateBy(-speed * r, 0, 0, 1);
				}
			}

			if (Math.abs(this._position.y - ct.y) > 16)
			{
				if (ct.y < this._position.y)
				{
					Game.camera.translateBy(0, speed / 6 * r, 0, 1);
				}
				else if (ct.y > this._position.y)
				{
					Game.camera.translateBy(0, -speed / 6 * r, 0, 1);
				}
			}
		}	
		
		this.setTranslation(this._position.x, this._position.y + wobble);

		this._position = Vector2D.add(this._position, Vector2D.mul(this._velocity, dt));


		if (moving)
		{
			this.setScale(Math.abs(this._velocity.x) / this._velocity.x, 1);
		}
		else
		{
			this.setScale(1, 1);
		}

		if (this._velocity.y > 0 || this._velocity.y < 0)
		{
			anim.stop();
			this.rotateBy(0, 0, dt * 20 * this.scale().x);
			this._grounded = false;
		}
		else
		{
			if (moving)
			{
				anim.play();
				this.setRotation(0, 0, Math.sin(Game.time() * this._wobbleSpeed) / this._wobbleAngle);
			}
			else
			{
				anim.stop();
				this.setRotation(0, 0, 0);
			}
		}

		if (Keyboard.isPressed(Key.W) == true)
		{
			if (this._grounded == false)
			{
				return;
			}
			this._position.y -= this._margin;
			this._velocity.y = -this._jumpHeight;
		}
	}
})
var Player = function(parent)
{
	Player._super.constructor.call(this, parent);

	this._speed = 50;
	this._velocity = Vector2D.construct(0, 0);
	this._maxVelocity = Vector2D.construct(10, 10);
	this._position = Vector2D.construct(0, -50);

	this._friction = 0.99;
}

_.inherit(Player, Quad);

_.extend(Player.prototype, {
	initialise: function()
	{
		this.setSize(64, 64);
		this.setBlend(0.9, 1, 0);
		this.spawn("Default");
		this.setTechnique("Diffuse");
		this.setOffset(0.5, 0.5);
		this._position.y = -500;
	},

	position: function()
	{
		return this._position;
	},

	handleCollision: function (block, collisionSide)
	{
		var s = this.size();
		var bs = block.size();
		var bp = block.translation();
		switch(collisionSide)
		{
			case Collision.Left:
				this._position.x = bp.x - bs.x / 2.0 - s.x / 2;
				this._velocity.x = 0;
				break;
			case Collision.Right:
				this._position.x = bp.x + bs.x / 2.0 + s.x / 2;
				this._velocity.x = 0;
				break;
			case Collision.Top:
				this._position.y = bp.y - bs.y / 2.0 - s.y / 2;
				this._velocity.y = 0;
				this._grounded = true;
				break;
			case Collision.Bottom:
				this._position.y = bp.y + bs.y / 2.0 - s.y / 2;
				this._velocity.y = 0;
				break;
		}
	},

	handleInput: function ()
	{
		if (Keyboard.isPressed(Key.W) && this._grounded)
		{
			this._velocity.y -= this._speed;
		}

		if (Keyboard.isDown(Key.A))
		{
			this._velocity.x -= this._speed;
		}
		else if (!Keyboard.isDown(Key.D))
		{
			this._velocity.x = 0;
		}

		if (Keyboard.isDown(Key.D))
		{
			this._velocity.x += this._speed;
		}
		else if (!Keyboard.isDown(Key.A))
		{
			this._velocity.x = 0;
		}
	},

	update: function(blocks, dt)
	{
		if (this._velocity.x > this._maxVelocity.x)
			this._velocity.x = this._maxVelocity.x;

		if (this._velocity.x < -this._maxVelocity.x)
			this._velocity.x = -this._maxVelocity.x;

		if (this._velocity.y > this._maxVelocity.y)
			this._velocity.y = this._maxVelocity.y;

		if (this._velocity.y < -this._maxVelocity.y)
			this._velocity.y = -this._maxVelocity.y;

		this._position = Vector2D.add(this._position, this._velocity);

		var collision;
		for (var i = 0; i < blocks.length; ++i)
		{
			collision = blocks[i].checkCollision(this);

			if (collision !== false)
			{
				this.handleCollision(blocks[i], collision);
				break;
			}
		}

		if (!collision)
			this._grounded = false;

		this._velocity = Vector2D.add(this._velocity, Game.gravity);

		this.handleInput();

		this.setTranslation(this._position.x, this._position.y);
	}
})
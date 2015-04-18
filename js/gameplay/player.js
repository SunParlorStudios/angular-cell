var Player = function(parent)
{
	Player._super.constructor.call(this, parent);

	this._speed = 50;
	this._velocity = Vector2D.construct(0, 0);
	this._maxVelocity = Vector2D.construct(10, 10);
	this._position = Vector2D.construct(0, 0);

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
		this._position.y = -10;
	},

	position: function()
	{
		return this._position;
	},

	handleCollision: function (block, collisionSide)
	{
		this._grounded = false;

		switch (collisionSide)
		{
			case Collision.Top:
				this._position.y = block.translation().y - block.size().y;
				this._grounded = true;
				break;
			case Collision.Right:
				this._position.x = block.translation().x + block.size().x;
				this._velocity.x *= -this._friction;
				break;
			case Collision.Bottom:
				this._position.y = block.translation().y + block.size().y;
				break;
			case Collision.Left:
				this._position.x = block.translation().x - block.size().x;
				this._velocity.x *= -this._friction;
				break;
		}

		Vector2D.mul(this._velocity, this._friction);
	},

	handleInput: function ()
	{
		if (Keyboard.isPressed(Key.W) && this._grounded)
		{
			this._velocity.y -= this._speed;
		}

		if (Keyboard.isPressed(Key.A))
		{
			this._velocity.x -= this._speed;
		}

		if (Keyboard.isPressed(Key.S))
		{
			this._velocity.y += this._speed;
		}

		if (Keyboard.isPressed(Key.D))
		{
			this._velocity.x += this._speed;
		}
	},

	update: function(blocks, dt)
	{
		this._velocity = Vector2D.add(this._velocity, Game.gravity);

		this.handleInput();

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

			if (collision !== undefined)
			{
				this.handleCollision(blocks[i], collision);
				break;
			}
		}

		if (!collision)
			this._grounded = false;

		this.setTranslation(this._position.x, this._position.y);
	}
})
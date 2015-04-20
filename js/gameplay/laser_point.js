var LaserPoint = LaserPoint || function(parent, pos, root)
{
	LaserPoint._super.constructor.call(this, root);

	this._parent = parent;
	this._dragging = false;
	this._size = 6;

	this._pos = pos;
	this._dragging = false;

	this.initialise();
}

_.inherit(LaserPoint, Quad);

_.extend(LaserPoint.prototype, {
	initialise: function()
	{
		this.setSize(this._size, this._size);
		this.setOffset(0.5, 0.5);
		this.setZ(200);

		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.spawn("Default");
	},

	update: function(p, zoom, dt)
	{
		var size = this._parent.size();
		var scale = this._parent.scale();

		var t = Vector2D.construct(
			this._pos.x,
			this._pos.y
		);

		this.setScale(1 / this._parent.scale().x + 1 / zoom, 1 / this._parent.scale().y + 1 / zoom);

		var pt = this._parent.translation();
		this.setTranslation(pt.x + t.x, pt.y + t.y);

		if (Mouse.isReleased(MouseButton.Left) && this._dragging == true)
		{
			this._dragging = false;
			return false;
		}

		if (this._dragging == true)
		{
			if (Keyboard.isDown(Key.M))
			{
				this._parent._direction = {
					x: Math.cos(Math.atan2(p.y - this._parent._position.y, p.x - this._parent._position.x)),
					y: Math.sin(Math.atan2(p.y - this._parent._position.y, p.x - this._parent._position.x))
				};
			}
			else
			{
				this._parent._position = p;
			}

			this._parent.constructLaser(this._parent._position, this._parent._direction, WM.blocks());
			return true;
		}

		if (this.inBounds(p) == true)
		{
			this.setBlend(1, 0, 1);
			if (Mouse.isPressed(MouseButton.Left) == true)
			{
				this._dragging = true;
				return true;
			}
		}
		else
		{
			this.setBlend(1, 1, 1);
			return false;
		}
	},

	inBounds: function(p)
	{
		var t = this.translation();
		var s = Vector2D.mul(this.scale(), this._size * 0.5).x;

		if (p.x > t.x - s && p.y > t.y - s && p.x < t.x + s && p.y < t.y + s)
		{
			return true;
		}

		return false;
	}
})
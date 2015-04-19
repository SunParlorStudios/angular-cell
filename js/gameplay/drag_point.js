var DragPoint = DragPoint || function(parent, pos)
{
	DragPoint._super.constructor.call(this, parent);

	this._parent = parent;
	this._dragging = false;
	this._size = 12;

	this._pos = pos;
	this._dragging = false;

	this.initialise();
}

_.inherit(DragPoint, Quad);

_.extend(DragPoint.prototype, {
	initialise: function()
	{
		this.setSize(this._size, this._size);
		this.setOffset(0.5, 0.5);
		this.setZ(1);

		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.spawn("Default");
	},

	update: function(p, dt)
	{
		var size = Vector2D.mul(this._parent.size(), 0.5);

		var t = Vector2D.construct(
			this._pos.x * size.x,
			this._pos.y * size.y
		);

		this.setTranslation(t.x, t.y);

		if (this._dragging == true)
		{
			if (Mouse.isReleased(MouseButton.Left))
			{
				this._dragging = false;
				return false;
			}

			p = Vector2D.sub(p, this._parent.translation());
			p.x /= size.x;
			p.y /= size.y;

			if (Keyboard.isDown(Key.Shift))
			{
				if (p.x < p.y)
				{
					var diff = Math.abs(p.x) - Math.abs(p.y);

					if (p.y > 0)
					{
						p.y += diff;
					}
					else
					{
						p.y -= diff;
					}
				}
			}

			this._pos = p;
			this._parent.setCellSize(Math.abs(size.x * 2 * p.x), Math.abs(size.y * 2 * p.y));

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
		var t = Vector2D.add(this._parent.translation(), this.translation());
		var s = this._size * 0.5;

		if (p.x > t.x - s && p.y > t.y - s && p.x < t.x + s && p.y < t.y + s)
		{
			return true;
		}

		return false;
	}
})
var DragPoint = DragPoint || function(parent, pos, root)
{
	DragPoint._super.constructor.call(this, root);

	this._parent = parent;
	this._dragging = false;
	this._size = 6;

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
			this._pos.x * Math.abs(size.x) * scale.x / 2,
			this._pos.y * Math.abs(size.y) * scale.y / 2
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
			p = Vector2D.sub(p, this._parent.translation());

			p.x /= size.x / 2;
			p.y /= size.y / 2;

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
				else if (p.y < p.x)
				{
					var diff = Math.abs(p.y) - Math.abs(p.x);

					if (p.x > 0)
					{
						p.x += diff;
					}
					else
					{
						p.x -= diff;
					}
				}
			}

			size = Vector2D.construct(size.x * p.x / scale.x * this._pos.x, size.y * p.y / scale.y * this._pos.y);
			if (size.x != 0 && size.y != 0)
			{
				this._parent.setCellSize(size.x, size.y);
			}
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
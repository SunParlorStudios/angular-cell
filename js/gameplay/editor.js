var Editor = Editor || function(map)
{
	this._dragging = false;
	this._cameraPosition = Vector2D.construct(0, 0);
	this._zoom = 1;
	this._zoomSpeed = 0.1;
	this._map = map;
	this._selectedBlock = undefined;
	this._scaleSpeed = 500;
}

_.extend(Editor.prototype, {
	update: function(blocks, dt)
	{
		var p = Mouse.position(MousePosition.Relative);
		p = Vector2D.add(this._cameraPosition, Vector2D.mul(p, 1 / this._zoom));

		if (Mouse.wheelDown())
		{
			this._zoom -= this._zoomSpeed;
		}
		else if (Mouse.wheelUp())
		{
			this._zoom += this._zoomSpeed;
		}

		this._zoom = Math.min(this._zoom, 1);
		this._zoom = Math.max(this._zoom, 0.1);

		if (this._selected === undefined)
		{
			if (Mouse.isPressed(MouseButton.Left))
			{
				this._dragging = true;
			}
			else if (Mouse.isReleased(MouseButton.Left))
			{
				this._dragging = false;
			}
		}
		else if (Mouse.isDown(MouseButton.Left))
		{
			this._selected.setTranslation(p.x, p.y);
		}

		if (this._dragging == true)
		{
			var movement = Mouse.movement();
			this._cameraPosition = Vector2D.add(this._cameraPosition, Vector2D.mul(movement, -1 / this._zoom));
		}


		Game.camera.setTranslation(this._cameraPosition.x, this._cameraPosition.y, 0);
		Game.camera.setZoom(this._zoom);

		if (Mouse.isReleased(MouseButton.Right))
		{
			if (this._selected === undefined)
			{
				this._map.createBlock(p.x, p.y);
			}
			else
			{
				this._map.removeBlock(this._selected);
				this._selected = undefined;
			}
		}

		if (!Mouse.isDown(MouseButton.Left))
		{
			var found = false;
			var selected = undefined;
			for (var i = 0; i < blocks.length; ++i)
			{
				if (blocks[i].inBounds(p))
				{
					selected = blocks[i];
					selected.setBlend(0, 1, 0);
					found = true;
					break;
				}
			}

			if (selected !== undefined)
			{
				if (this._selected !== undefined && this._selected !== selected)
				{
					this._selected.setBlend(0, 0, 0);
				}

				this._selected = selected;
			}
			else
			{
				if (this._selected !== undefined)
				{
					this._selected.setBlend(0, 0, 0);
					this._selected = undefined;
				}
			}
		}

		if (this._selected !== undefined)
		{
			var s;
			var speed = dt * this._scaleSpeed;
			if (Keyboard.isDown(Key.R))
			{
				s = this._selected.cellSize();
				this._selected.setCellSize(s.x - speed, s.y);
			}
			else if (Keyboard.isDown(Key.T))
			{
				s = this._selected.cellSize();
				this._selected.setCellSize(s.x + speed, s.y);
			}

			if (Keyboard.isDown(Key.F))
			{
				s = this._selected.cellSize();
				this._selected.setCellSize(s.x, s.y - speed);
			}
			else if (Keyboard.isDown(Key.G))
			{
				s = this._selected.cellSize();
				this._selected.setCellSize(s.x, s.y  + speed);
			}

			if (Keyboard.isDown(Key.Y))
			{
				s = this._selected.cellSize();
				this._selected.setCellSize(s.x - speed, s.y - speed);
			}
			else if (Keyboard.isDown(Key.U))
			{
				s = this._selected.cellSize();
				this._selected.setCellSize(s.x + speed, s.y + speed);
			}
		}

		if (Keyboard.isReleased(Key.E))
		{
			this._map.setEditing(false);
			if (this._selected !== undefined)
			{
				this._selected.setBlend(0, 0, 0);
				this._selected = undefined;
			}
		}
	}
})
require("js/ui/editor/editor_ui");

var Editor = Editor || function(map)
{
	this._dragging = false;
	this._cameraPosition = Vector2D.construct(0, 0);
	this._zoom = 1;
	this._zoomSpeed = 0.1;
	this._map = map;
	this._selectedBlock = undefined;
	this._scaleSpeed = 500;
	this._dragPoint = false;
	this._ui = new EditorUI(this);
	this._tool = MoveableType.Block;
	this._offset = Vector2D.construct(0, 0);
	this._startDrag = false;
	this._inputEnabled = false;
}

_.extend(Editor.prototype, {
	setInputEnabled: function(v)
	{
		this._inputEnabled = v;
	},

	map: function()
	{
		return this._map;
	},

	setTool: function(tool)
	{
		this._tool = tool;
	},

	show: function()
	{
		this._ui.show();
	},

	update: function(moveables, dt)
	{
		this._ui.update(this._selected, dt);

		if (this._inputEnabled == false)
		{
			return;
		}
		
		var p = Mouse.position(MousePosition.Relative);
		p = Vector2D.add(this._cameraPosition, Vector2D.mul(p, 1 / this._zoom));

		var found = false;
		var selected = undefined;
		var used = false;
		var using = false;
		var maxDepth = 0;
		for (var i = 0; i < moveables.length; ++i)
		{
			used = moveables[i].updateDragPoints(p, this._zoom, dt);

			if (used == true)
			{
				using = true;
			}

			if (moveables[i].inBounds(p) && (found == false || moveables[i].depth() < maxDepth) && !Mouse.isDown(MouseButton.Left))
			{
				selected = moveables[i];
				maxDepth = selected.depth();
				found = true;
			}
		}

		if (selected !== undefined)
		{
			selected.setBlend(0, 1, 0);
		}

		this._dragPoint = using;

		if (!Mouse.isDown(MouseButton.Left))
		{
			this._startDrag = false;
			if (selected !== undefined)
			{
				if (this._selected !== undefined && this._selected !== selected)
				{
					this._selected.resetBlend()
				}

				this._selected = selected;
			}
			else
			{
				if (this._selected !== undefined)
				{
					this._selected.resetBlend();
					this._selected = undefined;
				}
			}
		}

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


		if (Mouse.isPressed(MouseButton.Middle))
		{
			this._dragging = true;
		}
		else if (Mouse.isReleased(MouseButton.Middle))
		{
			this._dragging = false;
		}

		else if (Mouse.isDown(MouseButton.Left) && this._dragPoint == false && this._selected !== undefined)
		{
			if (this._startDrag == false)
			{
				this._startDrag = true;
				this._offset = Vector2D.sub(this._selected.translation(), p);
			}

			this._selected.setPosition(p.x + this._offset.x, p.y + this._offset.y);

			if (Keyboard.isReleased(Key.Minus))
			{
				this._selected.setDepth(this._selected.depth() + 1);
			}
			else if (Keyboard.isReleased(Key.Plus))
			{
				this._selected.setDepth(this._selected.depth() - 1);
			}
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
			if (this._selected === undefined || (this._selected !== undefined && !Keyboard.isDown(Key.R)))
			{
				var moveable = this._map.createMoveable(p.x, p.y, this._tool);
				if (this._tool == MoveableType.Scenery)
				{
					moveable.setTexture(this._ui.selectedTexture());
					moveable.setDepth(0);
				}
			}
			else if (Keyboard.isDown(Key.R))
			{
				this._map.removeMoveable(this._selected);
				this._selected = undefined;
			}
		}

		if (Keyboard.isReleased(Key.E))
		{
			this._ui.hide();
			this._map.setEditing(false);
			if (this._selected !== undefined)
			{
				this._selected.resetBlend();
				this._selected = undefined;
			}

			for (var i = 0; i < moveables.length; ++i)
			{
				moveables[i].destroyPoints();
			}
		}
	}
})
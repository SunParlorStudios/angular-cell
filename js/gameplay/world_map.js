require("js/gameplay/editor");

Enum("MoveableType", [
	"Block",
	"Scenery"]);

var WorldMap = WorldMap || function()
{
	this._blocks = [];
	this._scenery = [];

	this._moveables = [];

	this._editing = false;

	this._editMode = CVar.get("editMode");

	this._sceneryTextures = IO.filesInDirectory("textures/scenery");

	for (var i = 0; i < this._sceneryTextures.length; ++i)
	{
		ContentManager.load("texture", this._sceneryTextures[i]);
	}

	if (this._editMode === true)
	{
		RenderTargets.default.setUniform(Uniform.Float, "Distortion", 0);
		this._editor = new Editor(this);
		this._editing = true;
	}
	else
	{
		RenderTargets.default.setUniform(Uniform.Float, "Distortion", 0.3);
	}

	this._background = undefined;
}

_.extend(WorldMap.prototype, {
	initialise: function()
	{
		this._background = new Quad();
		this._background.setSize(9999999, 9999999);
		this._background.setOffset(0.5, 0.5);
		this._background.setTechnique("Diffuse");
		this._background.setBlend(0.18, 0.65, 0.33)
		this._background.spawn("Default");
		this._background.setZ(-1000);

		this._player = new Player(this);
		this._player.initialise();
	},

	sceneryTextures: function()
	{
		return this._sceneryTextures;
	},

	editing: function()
	{
		return this._editing;
	},

	setEditing: function(v)
	{
		this._editing = v;
	},

	blocks: function()
	{
		return this._blocks;
	},

	createMoveable: function(x, y, type)
	{
		var moveable;
		switch(type)
		{
			case MoveableType.Block:
				moveable = new Block(x, y, this._editMode === true);
				this._blocks.push(moveable);
				this._moveables.push(moveable);
			break;

			case MoveableType.Scenery:
				moveable = new Scenery(x, y, this._editMode === true);
				this._scenery.push(moveable);
				this._moveables.push(moveable);
			break;
		}
		
		return moveable;
	},

	removeMoveable: function(moveable, type)
	{
		moveable.destroy();
		moveable.destroyPoints();
		this._moveables.splice(this._moveables.indexOf(moveable), 1);

		var idx = this._blocks.indexOf(moveable);

		if (idx !== -1)
		{
			this._blocks.splice(this._blocks.indexOf(moveable), 1);
			return;
		}

		idx = this._scenery.indexOf(moveable);

		if (idx !== -1)
		{
			this._scenery.splice(this._scenery.indexOf(moveable), 1);
			return;
		}
	},

	update: function(dt)
	{
		if (this._editMode == true)
		{
			if (this._editing == true)
			{
				this._editor.update(this._moveables, dt);
			}
			else
			{
				if (Keyboard.isReleased(Key.E))
				{
					for (var i = 0; i < this._moveables.length; ++i)
					{
						this._moveables[i].spawnPoints();
					}
					this._editing = true;
					this._editor.show();
				}
			}
		}
		
		RenderTargets.default.setUniform(Uniform.Float, "Flicker", 0.9 + Math.random() * 0.1);

		if (this._editing == true)
		{
			return;
		}

		this._player.update(this._blocks, dt);
	},

	save: function()
	{

	},

	load: function()
	{

	}
});
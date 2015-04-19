require("js/gameplay/editor");

var WorldMap = WorldMap || function()
{
	this._blocks = [];
	this._visuals = [];
	this._main = [];

	this._editing = false;

	this._editMode = CVar.get("editMode");

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

	createBlock: function(x, y)
	{
		this._blocks.push(new Block(x, y, this._editMode === true));
	},

	removeBlock: function(block)
	{
		block.destroy();
		block.destroyPoints();
		this._blocks.splice(this._blocks.indexOf(block), 1);
	},

	update: function(dt)
	{
		if (this._editMode == true)
		{
			if (this._editing == true)
			{
				this._editor.update(this._blocks, dt);
			}
			else
			{
				if (Keyboard.isReleased(Key.E))
				{
					for (var i = 0; i < this._blocks.length; ++i)
					{
						this._blocks[i].spawnPoints();
					}
					this._editing = true;
				}
			}
		}
		
		RenderTargets.default.setUniform(Uniform.Float, "Flicker", 0.9 + Math.random() * 0.1);

		if (this._editing == true)
		{
			return;
		}

		this._player.update(this._blocks, dt);
	}
});
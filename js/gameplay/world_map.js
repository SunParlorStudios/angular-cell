require("js/gameplay/editor");
require("js/gameplay/piranha");
require("js/gameplay/enemy_ray");

Enum("MoveableType", [
	"Block",
	"Scenery"]);

var WorldMap = WorldMap || function()
{
	this._blocks = [];
	this._scenery = [];

	this._moveables = [];
	this._particles = [];

	this._editing = false;

	this._editMode = CVar.get("editMode");

	this._pufferFish = [];
	this._distortion = this._editMode === true ? 0 : 0.3;

	this._sceneryTextures = IO.filesInDirectory("textures/scenery");

	for (var i = 0; i < this._sceneryTextures.length; ++i)
	{
		if (this._sceneryTextures[i] == "textures/scenery/Thumbs.db")
			continue;
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
		RenderTargets.default.setUniform(Uniform.Float, "Distortion", this._distortion);
	}

	this._background = undefined;
}

_.extend(WorldMap.prototype, {
	distortion: function()
	{
		return this._distortion;
	},

	initialise: function()
	{
		this._background = new Quad();
		this._background.setSize(1280, 720);
		this._background.setOffset(0.5, 0.5);
		this._background.setTechnique("Diffuse");
		this._background.setBlend(15 / 255, 95 / 255, 55 / 255)
		this._background.spawn("Default");
		this._background.setZ(-1000);
		this._background.setEffect("effects/gradient.effect");

		this._player = new Player(this);
		this._player.initialise();

		this._enemies = [];
		//this._enemies.push(new Enemy());
		this.load();
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

	createEnemy: function(x, y)
	{
		var e = new Enemy();
		e.setPosition(x, y);
		this._enemies.push(e);
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

	addParticle: function(particle)
	{
		this._particles.push(particle);
	},

	update: function(dt)
	{
		this._background.setBlend(50 / 255, 180 / 255, 180 / 255)
		var ct = Game.camera.translation();
		var z = Game.camera.zoom();
		this._background.setTranslation(ct.x, ct.y);
		this._background.setScale(1 / z + 0.3, 1 / z + 0.3);
		for (var i = 0; i < this._scenery.length; ++i)
		{
			this._scenery[i].update(dt);
		}

		if (this._editMode == true)
		{
			if (this._editing == true)
			{
				if (Keyboard.isDown(Key.Control) && Keyboard.isPressed(Key.S))
				{
					this.save();
				}
				if (Keyboard.isDown(Key.Control) && Keyboard.isPressed(Key.O))
				{
					this.load();
				}
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
		
		RenderTargets.default.setUniform(Uniform.Float, "Flicker", Math.random() * 0.3);

		if (this._editing == true)
		{
			return;
		}

		this._player.update(this._blocks, this._enemies, this, dt);

		for (var i = this._enemies.length - 1; i >= 0; i--)
		{
			this._enemies[i].update(this._player, this._blocks, dt);

			if (this._enemies[i].isDead())
			{
				this._enemies[i].removeYourself();
				this._enemies.splice(i, 1);
			}
		}

		for (var i = this._pufferFish.length - 1; i >= 0; i--)
		{
			this._pufferFish[i].update(this._enemies, this._blocks, dt);

			if(this._pufferFish[i].isDead())
			{
				this._pufferFish[i].removeYourself();
				this._pufferFish.splice(i, 1);
			}
		}

		for (var i = this._particles.length - 1; i >= 0; i--)
		{
			if (this._particles[i].update(dt) == false)
			{
				this._particles[i].destroy();
				this._particles.splice(i, 1);
			}
		}
	},

	save: function()
	{
		var save = {}
		save.blocks = [];
		save.scenery = [];

		var t, s;

		var moveable;
		for (var i = 0; i < this._blocks.length; ++i)
		{
			moveable = this._blocks[i];
			t = moveable.position();
			s = moveable.size();

			save.blocks.push({
				x: t.x,
				y: t.y,
				sx: s.x,
				sy: s.y
			});
		}

		var t, s;

		for (var i = 0; i < this._scenery.length; ++i)
		{
			moveable = this._scenery[i];
			t = moveable.position();
			s = moveable.size();

			save.scenery.push({
				x: t.x,
				y: t.y,
				sx: s.x,
				sy: s.y,
				texture: moveable.texture(),
				depth: moveable.depthNoZ(),
				rotationSpeed: moveable.rotationSpeed(),
				zOffset: moveable.zOffset()
			});
		}

		var str = JSON.stringify(save);
		IO.write("json/map.json", str);

		Log.success("Saved the map");
	},

	clear: function()
	{
		for (var i = 0; i < this._moveables.length; ++i)
		{
			this._moveables[i].destroy();
			this._moveables[i].destroyPoints();
		}

		for (var i = 0; i < this._enemies.length; ++i)
		{
			this._enemies[i].removeYourself();
		}

		for (var i = 0; i < this._particles.length; ++i)
		{
			this._particles[i].destroy();
		}

		for (var i = 0; i < this._pufferFish.length; ++i)
		{
			this._pufferFish[i].destroy();
		}

		this._enemies.length = 0;
		this._particles.length = 0;
		this._blocks.length = 0;
		this._scenery.length = 0;
		this._moveables.length = 0;
		this._pufferFish.length = 0;
	},

	load: function()
	{
		this.clear();
		if (IO.exists("json/map.json") == false)
		{
			return;
		}

		var str = IO.read("json/map.json");
		var json = JSON.parse(str);
		var moveable;
		var obj;

		for (var i = 0; i < json.blocks.length; ++i)
		{
			moveable = json.blocks[i];
			obj = this.createMoveable(moveable.x === undefined ? 0 : moveable.x, moveable.y === undefined ? 0 : moveable.y, MoveableType.Block);
			obj.setCellSize(moveable.sx === undefined ? 64 : moveable.sx, moveable.sy === undefined ? 64 : moveable.sy);
		}

		for (var i = 0; i < json.scenery.length; ++i)
		{
			moveable = json.scenery[i];
			obj = this.createMoveable(moveable.x, moveable.y, MoveableType.Scenery);
			obj.setCellSize(moveable.sx === undefined ? 64 : moveable.sx, moveable.sy === undefined ? 64 : moveable.sy);
			obj.setTexture(moveable.texture);
			obj.setDepth(moveable.depth === undefined ? 0 : moveable.depth);
			obj.setRotationSpeed(moveable.rotationSpeed === undefined ? 0 : moveable.rotationSpeed);
			obj.setZOffset(moveable.zOffset === undefined ? 0 : moveable.zOffset);
		}

		Log.success("Loaded the map");
	}
});
require("js/ui/editor/texture_widget");

Enum("ToolType", [
	"Block",
	"Scenery",
	"Enemy"]);

var testUI = testUI || false;

var EditorUI = EditorUI || function(editor, root)
{
	this._editor = editor;
	this._root = root;
	this._frame = undefined;

	this._path = "textures/ui/editor/";

	this._toolData = [
		{path: this._path + "block_object.png", type: ToolType.Block},
		{path: this._path + "scenery_object.png", type: ToolType.Scenery},
		{path: this._path + "enemy_object.png", type: ToolType.Enemy}
	];
	this._texturePanel = undefined;
	this._numTools = 3;
	this._tools = [];
	this._metrics = {
		button: {
			margin: 20,
			size: 64,
			padding: 20
		}
	}

	testUI = this;

	this.initialise();
}

_.extend(EditorUI.prototype, {
	initialise: function()
	{
		ContentManager.load("texture", "textures/ui/editor/block_object.png");
		ContentManager.load("texture", "textures/ui/editor/scenery_object.png");
		ContentManager.load("texture", "textures/ui/editor/enemy_object.png");

		this._inputArea = new Widget(this._root);
		this._frame = new Widget(this._root);
		var button;

		for (var i = 0; i < this._numTools; ++i)
		{
			button = new Button(this._frame);
			this._tools.push(button);
		}

		this._texturePanel = new Widget(this._frame);
		this._textures = this._editor.map().sceneryTextures();
		this._textureWidgets = [];
		for (var i = 0; i < this._textures.length; ++i)
		{
			this._textureWidgets.push(new TextureWidget(this._textures[i], this, this._texturePanel));
		}

		this._selected = undefined;
		this._depthText = new Text();

		this._savedText = new Text();
		this._input = new MouseArea(this._inputArea);
		this._inputDisable = new MouseArea(this._frame);

		this.setUI();
	},

	setUI: function()
	{
		this.enableInput.ctx = this;
		this.disableInput.ctx = this;
		this._input.setOnEnter(this.enableInput);
		this._input.setOnLeave(this.disableInput);

		var m = this._metrics.button;
		var res = RenderSettings.resolution();

		this._inputArea.setOffset(0.5, 0.5);
		this._inputArea.setSize(res.w, res.h);
		this._inputArea.setZ(-100);

		var half_res = {w: res.w / 2, h: res.h / 2}
		this._frame.spawn("Default");
		this._frame.setSize(
			m.size + m.padding * 2 + 200, 
			(m.size + m.padding * 2) * this._numTools - m.padding);
		this._frame.setBlend(0, 0, 0);

		this._frame.setTranslation(
			half_res.w - this._frame.size().x - 20, 
			-half_res.h + 20);


		var tool;
		
		for (var i = 0; i < this._tools.length; ++i)
		{
			tool = this._tools[i];
			tool.setTranslation(m.margin, m.margin + i * (m.size + m.padding));
			tool.setSize(m.size, m.size);
			tool.setBlend(1, 1, 1);
			tool.setZ(1);
			tool.spawn("Default");
			tool.setTextures(this._toolData[i].path);

			tool.setBlend(0.5, 0.5, 0.5);
			tool.selected = false;
			tool.ui = this;
			tool.idx = i;

			tool.setOnEnter(this.onEnter, tool);
			tool.setOnLeave(this.onLeave, tool);
			tool.setOnReleased(this.onReleased, tool);
		}

		var widget;
		for (var i = 0; i < this._textureWidgets.length; ++i)
		{
			widget = this._textureWidgets[i];
			widget.setUI();

			widget.setTranslation(0, i * 23);
			widget.selected = false;
		}

		this._depthText.setText("Depth ");
		this._depthText.spawn("Default");
		this._depthText.setShadowOffset(1, 1);

		this._savedText.setFontSize(64);
		this._savedText.setText("Saved");
		this._savedText.spawn("Default");
		this._savedText.setShadowOffset(2, 2);
		this._savedText.setShadowColour(0, 0, 0, 0.5);

		this._savedTimer = 0;

		var m = this._savedText.metrics();
		this._savedText.setOffset(m.w / 2, m.h / 2);

		this._texturePanel.setTranslation(100, 20);

		this.setSelectedTexture(this._textureWidgets[0]);
		this.setSelected(0);
	},

	enableInput: function()
	{
		this._editor.setInputEnabled(true);
	},

	disableInput: function()
	{
		this._editor.setInputEnabled(false);
	},

	setSelectedTexture: function(tex)
	{
		var widget;
		for (var i = 0; i < this._textureWidgets.length; ++i)
		{
			widget = this._textureWidgets[i];
			if (widget == tex)
			{
				widget.setSelected();
				widget.selected = true;
				continue;
			}

			widget.reset();
		}

		this._selectedTexture = tex;
	},

	selectedTexture: function()
	{
		return this._selectedTexture.path();
	},

	setSelected: function(idx)
	{
		if (this._selected !== undefined)
		{
			this._selected.selected = false;
			this._selected.setBlend(0.5, 0.5, 0.5);
		}
		
		var tool = this._tools[idx];
		tool.selected = true;
		this._selected = tool;
		tool.setBlend(0.8, 1, 0);

		this._editor.setTool(this._selected.idx);
	},

	onReleased: function(button)
	{
		if (button == MouseButton.Left)
		{
			this.ui.setSelected(this.idx);
		}
	},

	onEnter: function()
	{
		this.setBlend(1, 1, 1);
	},

	onLeave: function()
	{
		if (this.selected == false)
		{
			this.setBlend(0.5, 0.5, 0.5);
		}
		else
		{
			this.setBlend(0.8, 1, 0);
		}
	},

	show: function()
	{
		this._frame.setAlpha(1);

		for (var i = 0; i < this._tools.length; ++i)
		{
			this._tools[i].setActivated(true);
		}
	},

	hide: function()
	{
		this._frame.setAlpha(0);

		for (var i = 0; i < this._tools.length; ++i)
		{
			this._tools[i].setActivated(false);
		}

		this._depthText.setAlpha(0);
	},

	update: function(selected, dt)
	{
		if (Keyboard.isDown(Key.Control) && Keyboard.isPressed(Key.O))
		{
			this._savedText.setText("Loaded");
			this._savedTimer = 0;
		}

		if (Keyboard.isDown(Key.Control) && Keyboard.isPressed(Key.S))
		{
			this._savedText.setText("Saved");
			this._savedTimer = 0;
		}

		if (this._savedTimer < 1)
		{
			this._savedTimer += dt;
			this._savedTimer = Math.min(this._savedTimer, 1);

			this._savedText.setAlpha(1 - this._savedTimer);
		}

		var p = Mouse.position(MousePosition.Relative);
		this._depthText.setTranslation(p.x, p.y - 32);

		if (selected !== undefined)
		{
			this._depthText.setText("Depth " + selected.depth());
			this._depthText.setAlpha(1);
		}
		else if (selected === undefined)
		{
			this._depthText.setAlpha(0);
		}
	}
});


if (testUI !== false)
{
	testUI.setUI = EditorUI.prototype.setUI;
	testUI.setUI();
}
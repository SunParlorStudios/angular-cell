Enum("ToolType", [
	"Block",
	"Scenery"]);

var testUI = testUI || false;

var EditorUI = EditorUI || function(editor, root)
{
	this._editor = editor;
	this._root = root;
	this._frame = undefined;

	this._path = "textures/ui/editor/";

	this._toolData = [
		{path: this._path + "block_object.png", type: ToolType.Block},
		{path: this._path + "scenery_object.png", type: ToolType.Scenery}
	];

	this._numTools = 2;
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

		this._frame = new Widget(this._root);
		var button;

		for (var i = 0; i < this._numTools; ++i)
		{
			button = new Button(this._frame);
			this._tools.push(button);
		}

		this._selected = undefined;
		this.setUI();
	},

	setUI: function()
	{
		var m = this._metrics.button;
		var res = RenderSettings.resolution();
		var half_res = {w: res.w / 2, h: res.h / 2}
		this._frame.spawn("Default");
		this._frame.setSize(m.size + m.padding * 2, (m.size + m.padding * 2) * this._numTools - m.padding);
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

		this.setSelected(0);
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
	}
});


if (testUI !== false)
{
	testUI.setUI = EditorUI.prototype.setUI;
	testUI.setUI();
}
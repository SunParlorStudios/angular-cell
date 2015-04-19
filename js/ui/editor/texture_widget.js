var TextureWidget = TextureWidget || function(path, ui, root)
{
	TextureWidget._super.constructor.call(this, root);

	this._ui = ui;
	this._path = path;
	this._padding = 6;

	this.selected = false;

	this.initialise();
}

_.inherit(TextureWidget, Widget);

_.extend(TextureWidget.prototype, {
	initialise: function()
	{
		this._selector = new Button(this);
		this._text = new Text(this._selector);

		this._selector.setOnEnter(this.onEnter, this);
		this._selector.setOnLeave(this.onLeave, this);
		this._selector.setOnReleased(this.onReleased, this);
	},

	onReleased: function()
	{
		this.selected = true;
		this._ui.setSelectedTexture(this);
	},

	onEnter: function()
	{
		this._selector.setBlend(1, 1, 0);
		this._text.setBlend(0, 0, 0);
	},

	onLeave: function()
	{
		if (this.selected == false)
		{
			this._selector.setBlend(0.3, 0.3, 0.3);
			this._text.setBlend(1, 1, 1);
		}
		else
		{
			this._selector.setBlend(0, 1, 0);
			this._text.setBlend(0, 0, 0);
		}
	},

	reset: function()
	{
		this.selected = false;
		this._selector.setBlend(0.3, 0.3, 0.3);
		this._text.setBlend(1, 1, 1);
	},

	setSelected: function()
	{
		this._selector.setBlend(0, 1, 0);
		this._text.setBlend(0, 0, 0);
	},

	path: function()
	{
		return this._path;
	},

	setUI: function()
	{
		this._selector.setBlend(0.3, 0.3, 0.3);

		this._text.setText(this._path);
		this._text.spawn("Default");

		var m = this._text.metrics();

		this._selector.setSize(m.w + this._padding, m.h + this._padding);
		this._selector.setOffset(this._padding / m.w / 2, this._padding / m.h / 2);

		this._selector.spawn("Default");
		this._selector.setZ(3);
		this._text.setZ(4);
		this._text.setBlend(1, 1, 1);
	}
});
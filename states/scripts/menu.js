require("js/gameplay/player");
require("js/gameplay/block");

/** 
 * The menu state
 *
 * @public
 * @constructor module:Menu
 * @extends module:State
 * @author Riko Ophorst
 */
var Menu = Menu || function()
{
	Menu._super.constructor.call(this, arguments);
}

_.inherit(Menu, State);

_.extend(Menu.prototype, {
	show: function (data)
	{
		Menu._super.show.call(this);

		ContentManager.load("texture", "textures/test.png");
		ContentManager.load("texture", "textures/test_sheet.png");
		ContentManager.load("anim", "test.anim");
		RenderTargets.default.setUniform(Uniform.Float, "Distortion", 0.1);

		this._blocks = [];

		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());
		this._blocks.push(new Block());

		this._player = new Player();
		this._player.initialise();
		this._player.setSize(128, 128);

		this._player.setDiffuseMap("textures/test_sheet.png");
		anim = new SpriteAnimation("test.anim", "textures/test_sheet.png");
		this._player.setAnimation(anim);
		anim.play();
		anim.setSpeed(4);

		Game.gravity = Vector2D.construct(0, 2500);
		
		this._background = new Quad();
		this._background.setSize(1280, 720);
		this._background.setOffset(0.5, 0.5);
		this._background.setTechnique("Diffuse");
		this._background.spawn("Default");
		this._background.setDiffuseMap("textures/test.png");
	},

	update: function (dt)
	{
		Menu._super.update.call(this);
		this._player.update(this._blocks, dt);
		RenderTargets.default.setUniform(Uniform.Float, "Flicker", 0.95 + Math.random() * 0.05);
	},

	draw: function ()
	{
		Menu._super.draw.call(this);
	},

	leave: function()
	{
		
	}
});
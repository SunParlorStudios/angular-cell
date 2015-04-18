require("js/gameplay/player");
require("js/gameplay/enemy");
require("js/gameplay/block");
require("js/gameplay/fish_tank");
require("js/gameplay/projectile");

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
		ContentManager.load("texture", "textures/paral1.png");
		ContentManager.load("texture", "textures/paral2.png");
		ContentManager.load("texture", "textures/paral3.png");
		ContentManager.load("texture", "textures/rec.png");
		ContentManager.load("texture", "textures/Environment/BG_Wall.png");
		ContentManager.load("texture", "textures/player/player_sheet.png");
		ContentManager.load("texture", "textures/Environment/BG_Fish_Tank.png");
		ContentManager.load("texture", "textures/Environment/Fish_Tank.png");
		ContentManager.load("texture", "textures/Environment/BG_Color.png");
		ContentManager.load("texture", "textures/starfish.png");
		ContentManager.load("texture", "textures/ui/crosshair.png");
		ContentManager.load("anim", "animations/player_walk.anim");
		ContentManager.load("anim", "animations/player_punch.anim");
		ContentManager.load("anim", "animations/player_death.anim");
		ContentManager.load("shader", "shaders/fog.fx");
		ContentManager.load("effect", "effects/fog.effect");

		ContentManager.load("texture", "textures/henchman/henchman_sheet.png");
		ContentManager.load("anim", "animations/henchman_walk.anim");
		ContentManager.load("anim", "animations/henchman_idle.anim");
		ContentManager.load("anim", "animations/henchman_attack.anim");

		RenderTargets.default.setUniform(Uniform.Float, "Distortion", 0.3);

		this._blocks = [];

		this._blocks.push(new Block());

		this._player = new Player(this);
		this._player.initialise();

		Game.gravity = Vector2D.construct(0, 5000);
		
		this._background = new Quad();
		this._background.setSize(999999, 999999);
		this._background.setOffset(0.5, 0.5);
		this._background.setTechnique("Diffuse");
		this._background.setDiffuseMap("textures/Environment/BG_Color.png");
		this._background.spawn("Default");
		this._background.setZ(-100);

		this._widget = new Widget();
		this._widget.setSize(256, 64);
		this._widget.setDiffuseMap("textures/rec.png");
		this._widget.spawn("Default");
		this._widget.setOffset(0.5, 0.5);
		this._widget.setTranslation(-RenderSettings.resolution().w / 2 + 150, -RenderSettings.resolution().h / 2 + 80);

		this._crosshair = new Widget();
		this._crosshair.setSize(32, 32);
		this._crosshair.setDiffuseMap("textures/ui/crosshair.png");
		this._crosshair.spawn("Default");
		this._crosshair.setOffset(0.5, 0.5);

		this._fishTank = new FishTank();

		this._projectiles = [];
		this._enemy = new Enemy();
	},

	update: function (dt)
	{
		Menu._super.update.call(this);
		this._player.update(this._blocks, dt);
		
		var p = Mouse.position(MousePosition.Relative);
		this._crosshair.setTranslation(p.x * 1.05, p.y * 1.05);

		for (var i = 0; i < this._projectiles.length; ++i)
		{
			this._projectiles[i].update(dt);
		}

		this._enemy.update(this._player, this._blocks, dt);
		RenderTargets.default.setUniform(Uniform.Float, "Flicker", 0.9 + Math.random() * 0.1);
	},

	addProjectile: function(proj)
	{
		this._projectiles.push(proj);
	},

	draw: function ()
	{
		Menu._super.draw.call(this);
	},

	leave: function()
	{
		
	}
});
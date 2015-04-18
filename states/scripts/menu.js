require("js/gameplay/player");
require("js/gameplay/enemy");
require("js/gameplay/block");
require("js/gameplay/fish_tank");
require("js/gameplay/projectile");
require("js/gameplay/world_map");

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

		ContentManager.load("texture", "textures/rec.png");
		ContentManager.load("texture", "textures/player/player_sheet.png");
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

		this._worldMap = new WorldMap();
		this._worldMap.initialise();

		Game.gravity = Vector2D.construct(0, 5000);
	},

	update: function (dt)
	{
		Menu._super.update.call(this);
		this._worldMap.update(dt);
	},

	draw: function ()
	{
		Menu._super.draw.call(this);
	},

	leave: function()
	{
		
	}
});
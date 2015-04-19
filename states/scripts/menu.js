require("js/gameplay/player");
require("js/gameplay/enemy");
require("js/gameplay/moveable");
require("js/gameplay/scenery");
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
		ContentManager.load("texture", "textures/player/hammer_head.png");
		ContentManager.load("texture", "textures/player/weapons.png");
		ContentManager.load("texture", "textures/Environment/BG_Fish_Tank.png");
		ContentManager.load("texture", "textures/Environment/Fish_Tank.png");
		ContentManager.load("texture", "textures/Environment/BG_Color.png");
		ContentManager.load("texture", "textures/Environment/Camera_Gradient.png");
		ContentManager.load("texture", "textures/starfish.png");
		ContentManager.load("texture", "textures/ui/crosshair.png");
		ContentManager.load("anim", "animations/player_walk.anim");
		ContentManager.load("anim", "animations/player_punch.anim");
		ContentManager.load("anim", "animations/player_death.anim");
		ContentManager.load("anim", "animations/player_attack.anim");
		ContentManager.load("anim", "animations/player_hurt.anim");
		ContentManager.load("anim", "animations/puffer_fish.anim");
		ContentManager.load("anim", "animations/weapon_hammer_head.anim");
		ContentManager.load("anim", "animations/weapon_empty.anim");
		ContentManager.load("shader", "shaders/fog.fx");
		ContentManager.load("effect", "effects/fog.effect");

		ContentManager.load("texture", "textures/henchman/henchman_sheet.png");
		ContentManager.load("anim", "animations/henchman_walk.anim");
		ContentManager.load("anim", "animations/henchman_idle.anim");
		ContentManager.load("anim", "animations/henchman_attack.anim");
		ContentManager.load("anim", "animations/henchman_death.anim");

		this._worldMap = new WorldMap();
		this._worldMap.initialise();

		this._gradient = new Widget();
		this._gradient.setSize(1280, 360);
		this._gradient.setDiffuseMap("textures/Environment/Camera_Gradient.png");
		this._gradient.setOffset(0.5, 1);

		this._gradient.spawn("Default");
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
require("js/gameplay/player");
require("js/gameplay/enemy");
require("js/gameplay/moveable");
require("js/gameplay/scenery");
require("js/gameplay/block");
require("js/gameplay/fish_tank");
require("js/gameplay/projectile");
require("js/gameplay/world_map");
require("js/gameplay/laser");

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
		ContentManager.load("texture", "textures/laser.png");
		ContentManager.load("texture", "textures/camera_gradient.png");
		ContentManager.load("texture", "textures/ui/crosshair.png");
		ContentManager.load("texture", "textures/particles/piranha_jaw.png");
		ContentManager.load("texture", "textures/particles/piranha_mouth.png");
		ContentManager.load("texture", "textures/particles/piranha_eye.png");
		ContentManager.load("texture", "textures/particles/piranha_body.png");
		ContentManager.load("texture", "textures/particles/puff_a.png");
		ContentManager.load("texture", "textures/particles/puff_b.png");
		ContentManager.load("texture", "textures/particles/hit_a.png");
		ContentManager.load("texture", "textures/particles/hit_b.png");
		ContentManager.load("texture", "textures/ray/ray.png");
		ContentManager.load("texture", "textures/ray/ray_tail.png");
		ContentManager.load("texture", "textures/ray/ray_spike.png");
		ContentManager.load("anim", "animations/player_walk.anim");
		ContentManager.load("anim", "animations/player_punch.anim");
		ContentManager.load("anim", "animations/player_death.anim");
		ContentManager.load("anim", "animations/player_attack.anim");
		ContentManager.load("anim", "animations/player_hurt.anim");
		ContentManager.load("anim", "animations/piranha_swim.anim");
		ContentManager.load("anim", "animations/piranha_idle.anim");
		ContentManager.load("anim", "animations/piranha_death.anim");
		ContentManager.load("anim", "animations/puffer_fish.anim");
		ContentManager.load("anim", "animations/weapon_hammer_head.anim");
		ContentManager.load("anim", "animations/weapon_sword_fish.anim");
		ContentManager.load("anim", "animations/weapon_empty.anim");
		ContentManager.load("shader", "shaders/fog.fx");
		ContentManager.load("effect", "effects/fog.effect");
		ContentManager.load("shader", "shaders/gradient.fx");
		ContentManager.load("effect", "effects/gradient.effect");

		ContentManager.load("texture", "textures/henchman/henchman_sheet.png");
		ContentManager.load("anim", "animations/henchman_walk.anim");
		ContentManager.load("anim", "animations/henchman_idle.anim");
		ContentManager.load("anim", "animations/henchman_attack.anim");
		ContentManager.load("anim", "animations/henchman_death.anim");

		this._worldMap = new WorldMap();
		this._worldMap.initialise();

		WM = this._worldMap;

		this._gradient = new Widget();
		this._gradient.setSize(1280, 360);
		this._gradient.setDiffuseMap("textures/camera_gradient.png");
		this._gradient.setOffset(0.5, 1);

		this._gradient.spawn("Default");

		this._crosshair = new Widget();
		this._crosshair.setSize(30, 30);
		this._crosshair.setDiffuseMap('textures/ui/crosshair.png');
		this._crosshair.setTechnique('Diffuse');
		this._crosshair.setOffset(0.5, 0.5);
		this._crosshair.spawn('Default');

		Game.gravity = Vector2D.construct(0, 5000);
	},

	update: function (dt)
	{
		Menu._super.update.call(this);

		var mousePos = Mouse.position(MousePosition.Screen);
		mousePos = Vector2D.mul(Vector2D.add(mousePos, Vector2D.construct(1, 1)), 0.5);

		var cc = Vector2D.sub(mousePos, Vector2D.construct(0.5, 0.5));
    	var dist = Vector2D.dot(cc, cc) * this._worldMap.distortion();

    	cc = Vector2D.mul(Vector2D.mul(cc, dist + 1), dist);

    	mousePos = Vector2D.add(mousePos, cc);
    	var res = RenderSettings.resolution();
    	mousePos = Vector2D.multiply(mousePos, Vector2D.construct(res.w, res.h));
    	mousePos = Vector2D.sub(mousePos, Vector2D.construct(res.w / 2, res.h / 2));
		this._crosshair.setTranslation(mousePos.x, mousePos.y);

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
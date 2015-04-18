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

		this._blocks = [];

		this._blocks.push(new Block());

		this._player = new Player();
		this._player.initialise();
	},

	update: function (dt)
	{
		Menu._super.update.call(this);
		this._player.update(this._blocks, dt);
	},

	draw: function ()
	{
		Menu._super.draw.call(this);
	},

	leave: function()
	{
		
	}
});
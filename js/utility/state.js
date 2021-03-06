/**
 * Base class for all states
 *
 * @public
 * @constructor module:State
 * @author Riko Ophorst
 */
function State (data)
{
	
}

_.extend(State.prototype, {
	/** 
	 * Initializes this state for first time initialization 
	 *
	 * @public
	 * @method module:State#init
	 * @author Riko Ophorst
	 */
	init: function ()
	{

	},

	/** 
	 * Shows this state
	 *
	 * @public
	 * @method module:State#show
	 * @author Riko Ophorst
	 */
	show: function ()
	{
		
	},
	
	/** 
	 * Leaves this state
	 *
	 * @public
	 * @method module:State#leave
	 * @author Riko Ophorst
	 */
	leave: function ()
	{
		RenderTargets.default.clear();
	},
	
	/** 
	 * Updates this state
	 *
	 * @public
	 * @method module:State#update
	 * @param {number} dt - deltatime
	 * @author Riko Ophorst
	 */
	update: function (dt) 
	{
		
	},
	
	/** 
	 * Fixed updates this state
	 *
	 * @public
	 * @method module:State#fixedUpdate
	 * @author Riko Ophorst
	 */
	fixedUpdate: function ()
	{

	},
	
	/** 
	 * Draws this state
	 *
	 * @public
	 * @method module:State#draw
	 * @author Riko Ophorst
	 */
	draw: function (dt) 
	{
		Game.render(Game.camera, RenderTargets.default);
	},
	
	/** 
	 * Reloads this state
	 *
	 * @public
	 * @method module:State#reload
	 * @author Riko Ophorst
	 */
	reload: function () 
	{

	},
	
	/** 
	 * Shuts down
	 *
	 * @public
	 * @method module:State#shutdown
	 * @author Riko Ophorst
	 */
	shutdown: function ()
	{

	},
	
	/** 
	 * Serializes this state
	 *
	 * @public
	 * @method module:State#serialize
	 * @return {object} The serialized data of this state
	 * @author Riko Ophorst
	 */
	serialize: function ()
	{
		return JSON.stringify(this);
	}
});
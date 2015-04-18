var Enemy = Enemy || function (parent) 
{
	Enemy._super.constructor.call(this, parent);
};

_.inherit(Enemy, Quad);

_.extend(Enemy.prototype, {
	update: function (player, blocks, dt)
	{
		
	}
});
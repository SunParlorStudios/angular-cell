var FishTank = FishTank || function(parent)
{
	FishTank._super.constructor.call(this, parent);
	this.initialise();
}

_.inherit(FishTank, Quad);

_.extend(FishTank.prototype, {
	initialise: function()
	{
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");
		this.setSize(315, 820);
		this.setDiffuseMap("textures/Environment/Fish_Tank.png");
		this.spawn("Default");
		this.setTranslation(64, -40);
		this.setOffset(0, 1);
		this.setZ(-3);
	}
});
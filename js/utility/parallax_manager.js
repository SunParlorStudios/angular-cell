Enum('ParallaxDirection', [
		'Left',
		'Right'
	])
var xxx = 0;
/**
 * The ParallaxManager which manages the parallax layers
 *
 * @public
 * @singleton module:ParallaxManager
 * @author Riko Ophorst
 */
var ParallaxManager = ParallaxManager || {};

_.extend(ParallaxManager, {
	overwrite: false,
	override: false
}, {
	_layers: []
});

_.extend(ParallaxManager, {
	add: function (texture, width, height, speed, depth, repeating) {
		repeating = !!repeating;

		var layer = {};
		layer.speed = speed;
		layer.depth = depth;
		layer.width = width;
		layer.height = height;
		layer.repeating = repeating;
		layer.quad = new Quad();

		layer.quad.setDiffuseMap(texture);
		layer.quad.setSize(width, height);
		layer.quad.setOffset(0.5, 0.5);
		layer.quad.setTranslation(++xxx * 100, 0, -depth);
		layer.quad.setTechnique("Diffuse");
		layer.quad.setEffect("effects/fog.effect");

		layer.quad.spawn("Default");
		this._layers.push(layer);
	},
	move: function (speed)
	{
		var layer;
		for (var i = 0; i < this._layers.length; i++)
		{
			layer = this._layers[i];
			layer.quad.translateBy((layer.speed * speed) * -1, 0, 0);
		}
	}
});
require("js/lib/bottom_line");
require("js/utility/enumerator");
require("js/utility/broadcaster");
require("js/utility/state_manager");
require("js/utility/parallax_manager");
require("js/utility/math_extension");
require("js/utility/weighted_collection");
require("js/utility/json");
require("js/utility/vector2d");
require("js/utility/vector3d");
require("js/utility/ray");
require("js/utility/world");
require("js/ui/button");

var RenderTargets = RenderTargets || {
	default: new RenderTarget("Default"),
	distort: new RenderTarget("Distort")
}

Game.Initialise = function()
{
	SoundSystem.addChannelGroup("Channel");
	ContentManager.load("sound", "music/angler_song.mp3");
	SoundSystem.play("music/angler_song.mp3", "Channel", true);
	ContentManager.load("effect", "effects/cull_none.effect");
	RenderTargets.default.setLightingEnabled(false);
	RenderTargets.default.setTechnique('Diffuse');
	RenderTargets.default.addMultiTarget(RenderTargets.distort);

	Window.setName("Angler Cell");
	Window.setSize(1280, 720);

	RenderSettings.setVsync(true);
	RenderSettings.setResolution(1280, 720);
	RenderSettings.setInvertY(true);

	Game.camera = new Camera(CameraType.Orthographic);
	Game.camera.setTranslation(0, 0, 0);

	StateManager.loadState('states/loader.json');
	StateManager.loadState('states/menu.json');
	StateManager.switch('menu');
}

Game.Update = function(dt)
{
	StateManager.update(dt);
}

Game.Draw = function(dt)
{
	StateManager.draw();
}

Game.Shutdown = function()
{
	RenderTargets.default.clear();
	StateManager.shutdown();
}

Game.FixedUpdate = function()
{
	StateManager.fixedUpdate();
}

Game.OnReload = function(path)
{
	StateManager.reload(path);
}
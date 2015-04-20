require("js/gameplay/piranha_debris");

var RayTail = RayTail || function(ray)
{
	RayTail._super.constructor.call(this, ray);
	
	this._ray = ray;
	this._numSegments = 8;
	this._previous = this._ray.translation();

	this.initialise();
}

_.inherit(RayTail, Quad);

_.extend(RayTail.prototype, {
	initialise: function()
	{
		this._segments = [];
		this._segmentSize = 24;

		var seg, r;
		for (var i = 0; i < this._numSegments + 1; ++i)
		{
			r = 1 - (i / (this._numSegments + 1) / 2);
			seg = new Quad();
			seg.setSize(64 * r, 64 * r);
			seg.setOffset(0, 0.5);
			seg.setTranslation(this._ray.translation().x - i * this._segmentSize, this._ray.translation().y);
			if (i < this._numSegments)
			{
				seg.setDiffuseMap("textures/ray/ray_tail.png");
			}
			else
			{
				seg.setDiffuseMap("textures/ray/ray_spike.png");
			}
			seg.spawn("Default");
			seg.setEffect("effects/cull_none.effect");
			seg.setTechnique("Diffuse");
			seg.setZ(105);
			this._segments.push(seg);
		}
	},

	setParent: function(v)
	{
		this._ray = v;
	},

	update: function(dt)
	{
		if (this._ray === undefined)
		{
			if (this._splatting === undefined)
			{
				this._splatting = true;
				for (var i = 0; i < this._segments.length; ++i)
				{
					this._segments[i].direction = Math.random() * Math.PI * 2;
					this._segments[i].speed = Math.randomRange(400, 800);
					this._segments[i].timer = 0;
				}

				return true;
			}

			for (var i = 0; i < this._segments.length; ++i)
			{
				seg = this._segments[i];
				seg.translateBy(Math.cos(seg.direction) * seg.speed * dt, Math.sin(seg.direction) * seg.speed * dt);
				seg.timer += dt;
				seg.timer = Math.min(seg.timer, 1);
				seg.setAlpha(1 - seg.timer);

				if (seg.timer >= 1)
				{
					seg.destroy();
				}
			}

			if (seg.timer >= 1)
			{
				return false;
			}

			return true;
		}

		var t = this._ray.translation();
		
		var prev, current;
		var delta, angle, pos, s;
		for (var i = 0; i < this._segments.length; ++i)
		{
			if (i == 0)
			{
				prev = this._ray;

			}
			else
			{
				prev = this._segments[i - 1];
			}
			
			current = this._segments[i];
			delta = Vector2D.sub(prev.translation(), current.translation());
			s = i == 0 ? 0 : this._segmentSize;
			angle = Math.atan2(delta.y, delta.x) + Math.PI;
			pos = Vector2D.add(prev.translation(), Vector2D.construct(Math.cos(angle) * s, Math.sin(angle) * s));
			current.setTranslation(pos.x, pos.y);
			current.setRotation(0, 0, angle + Math.PI);
		}
	}
})

var EnemyRay = EnemyRay || function(map, x, y, parent)
{
	EnemyRay._super.constructor.call(this, parent);
	this._dead = false;
	this._maxDistance = 640;
	this._speed = 400;
	this._maxSpeed = this._speed;
	this._speed = 0;
	this._map = map;
	this.setTranslation(x, y);
	this.initialise();
	this._randomAngle = Math.random() * Math.PI * 2;
	this._randomRadius = Math.randomRange(20, 240);
	this.setZ(105);
	this._tail = new RayTail(this);
}

_.inherit(EnemyRay, Quad);

_.extend(EnemyRay.prototype, {
	initialise: function()
	{
		this.setDiffuseMap("textures/ray/ray.png");
		this.setSize(256, 256);
		this.setOffset(0, 0.5);
		this.setEffect("effects/cull_none.effect");
		this.setTechnique("Diffuse");

		this.spawn("Default");

		this._wobble = 0;
		this._wobbleHeight = 100;
		this._wobbleSpeed = 2;
		this._health = 8;
		this._knockTimer = 1;
		this._lockedOn = false;
	},

	position: function()
	{
		return this.translation();
	},

	canHurt: function()
	{
		return this._knockTimer >= 1;
	},

	hurt: function()
	{
		if (this._knockTimer < 1)
		{
			return;
		}

		if (--this._health <= 0)
		{
			this.splat();
			this._dead = true;
		}
		
		this.knockBack();
	},

	knockBack: function()
	{
		this._speed = -this._maxSpeed / 2;
		this._knockTimer = 0;
	},

	splat: function()
	{
		this._map.addParticle(this._tail);
		this._tail.setParent(undefined);
	},

	update: function(player, blocks, dt)
	{
		this._tail.update(dt);
		if (this._speed < this._maxSpeed)
		{
			this._speed += 3000 * dt;
			this._speed = Math.min(this._speed, this._maxSpeed);
		}

		if (this._knockTimer < 1)
		{
			this._knockTimer += dt * 2;
			this._knockTimer = Math.min(this._knockTimer, 1);
			this.setAlpha(Math.abs(Math.sin(this._knockTimer * 10)));
		}
		else
		{
			this.setAlpha(1);
		}

		var p = player.translation();
		var t = this.translation();
		p.x += Math.cos(this._randomAngle) * this._randomRadius;
		p.y += Math.sin(this._randomAngle) * this._randomRadius;
		var dist = Math.distance(p.x, p.y, t.x, t.y);

		this._randomAngle += dt * 2;

		this._wobble += dt * this._wobbleSpeed;
		p.y += Math.sin(this._wobble) * this._wobbleHeight;

		if (this._lockedOn == false)
		{
			if (dist < this._maxDistance)
			{
				this._lockedOn = true;
			}

			this.translateBy(0, Math.sin(this._wobble) * this._wobbleHeight * dt);
		}
		else
		{
			if (dist < 16)
			{
				player.hurt(16, this);
			}

			var a = Math.atan2(p.y - t.y, p.x - t.x);
			var degrees = (a + Math.PI) * 180 / Math.PI;

			if (degrees < 270 && degrees > 90)
			{
				this.setScale(1, -1);
			}
			else
			{
				this.setScale(1, 1);
			}

			var movement = Vector2D.construct(
				Math.cos(a) * this._speed * dt,
				Math.sin(a) * this._speed * dt
			)
			this.translateBy(movement.x, movement.y);

			this.setRotation(0, 0, a);
		}
	},

	isDead: function()
	{
		return this._dead;
	},

	removeYourself: function()
	{
		this.destroy();
	}
})
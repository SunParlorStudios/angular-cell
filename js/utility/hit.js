var Hit = Hit || function (collider)
{
	this.collider = collider;
    this.pos = Vector2D.construct(0, 0);
    this.delta = Vector2D.construct(0, 0);
    this.normal = Vector2D.construct(0, 0);
}
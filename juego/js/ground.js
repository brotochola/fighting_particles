class Ground extends GenericObject {
  constructor(opt) {
    super(opt);
    const { x, y, particleSystem, width, height, sprite } = opt;
    this.sprite = sprite;

    this.createContainers();

    this.createSprite();
    this.update();
  }

  createSprite() {
    this.image = new PIXI.Sprite(
      this.particleSystem.res[this.sprite].texture.clone()
    );

    this.alignSpriteMiddleBottom();

    this.container.addChildAt(this.image, 0);
  }

  update(COUNTER) {
    super.update(COUNTER);

    this.lastY = this.pos.y;
    this.lastX = this.pos.x;

    super.render();
  }
}

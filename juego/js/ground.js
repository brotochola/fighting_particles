class Ground extends GenericObject {
  constructor(opt) {
    super(opt);

    this.sprite = opt.sprite;

    this.createSprite();

    this.update();
  }

  createSprite() {
    this.image = new PIXI.Sprite(this.particleSystem.res[this.sprite]);

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

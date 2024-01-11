class House extends GenericObject {
  constructor(opt) {
    // console.log("pole", opt);
    super(opt);
    const { x, y, particleSystem, width, height, sprite } = opt;
    this.sprite = sprite;

    this.spriteWidth = particleSystem.res[sprite].texture.width * 2;
    this.spriteHeight = particleSystem.res[sprite].texture.height * 2;

    /////////////////////////////

    //initialize variables:

    //create stuff
    this.createBody(
      this.spriteWidth,
      this.spriteHeight,
      "rectangle",
      "house",
      0,
      true,
      999
    );

    this.createContainers();

    this.createSprite();

    this.updateMyPositionInCell();
    this.update();

    // this.body.angle = this.startingAngle;
    // this.addParticleEmitter();
  }

  createContainers() {
    this.container = new PIXI.Container();

    this.container.pivot.set(
      this.spriteWidth * 0.25,
      -this.spriteHeight * 0.125
    );

    // this.particleContainer.zIndex = 1;

    // this.container.addChild(this.particleContainer);
    this.particleSystem.mainContainer.addChild(this.container);
  }

  createSprite() {
    this.image = new PIXI.Sprite(
      this.particleSystem.res[this.sprite].texture.clone()
    );

    this.container.addChildAt(this.image, 0);
  }

  update(COUNTER) {
    super.update(COUNTER);

    // if (this.state != "dead") {
    this.lastY = this.pos.y;
    this.lastX = this.pos.x;
    //get the position in the matterjs world and have it here

    this.pos.x = this.body.position.x;
    this.pos.y = this.body.position.y;
    this.container.zIndex = Math.floor(this.pos.y);

    this.updateMyPositionInCell();

    super.render();
    this.container.scale.x = this.container.scale.y;
  }

  // render() {
  //   super.render();
  // }
  //   remove() {}
}

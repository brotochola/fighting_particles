class House extends GenericObject {
  constructor(opt) {
    
    super(opt);
    
    const { x, y, particleSystem, width, height, sprite } = opt;
    this.sprite = sprite;

    this.spriteWidth = particleSystem.res[sprite].texture.width;
    this.spriteHeight = particleSystem.res[sprite].texture.height;

    /////////////////////////////

    //initialize variables:

    //create stuff
    this.createBody(
      this.spriteWidth / 1.42,
      this.spriteWidth / 1.42,
      "rectangle",
      "house",
      45,
      true,
      999,
      0.5
    );

    this.createContainers();

    this.createSprite();

    // debugger
    this.updateMyPositionInCell();
    this.update();

    // this.body.angle = this.startingAngle;
    // this.addParticleEmitter();
  }

  // createContainers() {
  //   this.container = new PIXI.Container();

  //   this.particleSystem.mainContainer.addChild(this.container);
  //   this.addTempCircleAt00();
  // }

  createSprite() {
    this.image = new PIXI.Sprite(
      this.particleSystem.res[this.sprite].texture.clone()
    );
    this.alignSpriteForIsometricView();

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
  }

  // render() {
  //   super.render();
  // }
  //   remove() {}
}

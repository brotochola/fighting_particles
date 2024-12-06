class Humo extends GenericObject {
  constructor(opt) {
    super({
      ...opt,
      spritesheetName: "humo_ss",
    });

    this.initialScale = this.scale = 1;
    const { x, y, particleSystem, team, isStatic, diameter } = opt;
    this.speed = 0.5;
    this.createAnimatedSprite("humo_ss", "anim", true);


    this.image.pivot.y=this.image.height
    this.image.pivot.x=this.image.height*0.5

    this.image.scale.set(0.25);
    this.image.alpha = 0.5;

    this.image.onComplete = () => {
      this.remove();
    };
    // this.alignSpriteMiddleBottom();
    
  }

  update(COUNTER) {
    this.COUNTER = COUNTER;
    this.container.zIndex = Math.floor(this.pos.y);

    this.render();
  }

  render() {
    this.container.y = this.pos.y; // this.calculateContainersY();
    this.container.x = this.pos.x; //this.calculateContainersX();

    // //SI ESTA HIGHLIGHTED
  }
}

class Humo extends GenericObject {
  constructor(opt) {
    super({
      ...opt,
      spritesheetName: "humo_ss",
    });

    // if (!Humo.blur) {
    //   Humo.blur = new PIXI.filters.KawaseBlurFilter();
    // }

    this.initialScale = this.scale = 1;
    const { x, y, particleSystem, team, isStatic, diameter } = opt;
    this.speed = 0.5;
    this.createAnimatedSprite("humo_ss", "anim", true);
    // this.image.filters = [Humo.blur];

    this.image.scale.x = Math.random() < 0.5 ? 1 : -1;
    this.image.scale.y = Math.random() < 0.5 ? 1 : -1;

    this.cell = opt.cell;

    //this.image.blendMode = "negation";

    this.image.pivot.y = this.image.height;
    this.image.pivot.x = this.image.width * 0.5;

    this.image.scale.set(0.2 + Math.random() * 0.1);
    this.image.alpha = 0.5;

    this.image.onComplete = () => {
      this.remove();
    };
    // this.alignSpriteMiddleBottom();
  }

  update(COUNTER, gas) {
    this.COUNTER = COUNTER;
    this.container.zIndex = Math.floor(this.pos.y);
    this.container.alpha = gas;
    this.render();
  }

  render() {
    this.container.y = this.pos.y; // this.calculateContainersY();
    this.container.x = this.pos.x; //this.calculateContainersX();

    // //SI ESTA HIGHLIGHTED
  }
}

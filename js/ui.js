class UI {
  constructor(options) {
    const { panelInfoElement, particleSystem } = options;

    if (!(panelInfoElement instanceof HTMLElement))
      return console.error("the element is not a HTMLElement");

    this.particleSystem = particleSystem;
    this.panelInfoElement = panelInfoElement;
  }
  update(COUNTER) {
    this.COUNTER = COUNTER;

    if (this.particleSystem.selectedPerson instanceof Person) {
      if (COUNTER % 10 == 0) {
        this.panelInfoElement.style.display = "block";
        let obj = this.particleSystem.selectedPerson.getInfo();
        this.panelInfoElement.innerHTML = "";
        let keys = Object.keys(obj);
        keys.forEach((k) => {
          this.panelInfoElement.innerHTML +=
            "<b>" + k + ": </b>" + obj[k] + "<br>";
        });
      }
    } else {
      this.panelInfoElement.style.display = "none";
    }
    // console.log("UI", COUNTER);
  }
}

class UI {
  constructor(options) {
    const { panelInfoElement, particleSystem, configElement } = options;

    if (!(panelInfoElement instanceof HTMLElement))
      return console.error("the element is not a HTMLElement");

    this.particleSystem = particleSystem;
    this.configElement = configElement;
    this.panelInfoElement = panelInfoElement;

    this.createConfigPanel();
  }
  toggleConfig() {
    this.configElement.style.display =
      this.configElement.style.display == "none" ? "block" : "none";
  }
  createConfigPanel() {
    this.configElement.innerHTML = "";
    let keys = Object.keys(this.particleSystem.MULTIPLIERS);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let span = document.createElement("span");
      this.configElement.appendChild(span);
      span.innerHTML += "<span><p>" + key + ":</p>";
      let input = document.createElement("input");
      input.value = this.particleSystem.MULTIPLIERS[key];
      input.oninput = (e) => {
        if (isNaN(e.currentTarget.value)) return;
        this.particleSystem.MULTIPLIERS[key] = Number(e.currentTarget.value);
      };

      span.appendChild(input);
    }
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

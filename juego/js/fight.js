//uses matter.js

var Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Constraint = Matter.Constraint,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World;

var particleSystem;

// create an engine

//STARTING POINT
document.body.onload = (e) => {
  particleSystem = new ParticleSystem(
    "canvas",
    1920, //ancho del mundo
    1080, //alto del mundo
    Matter,
    document.querySelector("panelInfo"),
    document.querySelector("config")
  );
  //   particleSystem.init();

  //   particleSystem.startSimulation();
};

// var addingParticlesOfTeam = 1;

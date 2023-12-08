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
  particleSystem = new ParticleSystem("canvas", 4000, 2000, Matter);
  //   particleSystem.init();

  //   particleSystem.startSimulation();
};

var addingParticlesOfTeam = 1;

import {
  Helpers,
  Clock,
  Computer,
  Renderer,
  ComputeProgram,
  RenderProgram,
  Geometry,
  UniformsInput,
  PingPongBufferInput,
  StructuredFloat32Array,
} from "mini-gpu";
import { primitives } from "twgl.js";
import { vec2 } from "gl-matrix";

// With Vite, if we add ?raw to the path, we get it as the plain text shader
import shaderHeader from "./shaders/header.wgsl?raw";
import shaderCommon from "./shaders/common.wgsl?raw";
import boundaryShader from "./shaders/boundary.wgsl?raw";
import externalForceShader from "./shaders/external-force.wgsl?raw";
import advectionShader from "./shaders/advection.wgsl?raw";
import viscousityShader from "./shaders/viscousity.wgsl?raw";
import divergenceShader from "./shaders/divergence.wgsl?raw";
import pressureShader from "./shaders/pressure.wgsl?raw";
import pressureGradientShader from "./shaders/pressure-gradient.wgsl?raw";
import renderShader from "./shaders/render.wgsl?raw";

const WORKGROUP_SIZE = 256; // Must match the workgroup size of our compute shaders
const RESOLUTION = 0.25; // How big the simulation grid will be, with respect to the pixel dimentions of the renderer
const VISCOSITY = 2; // How 'sticky' our fluid will be (higher = more sticky)

const canvas = document.querySelector("canvas");
const clock = new Clock();

let computer, renderer;
const resolution = vec2.create(); // The pixel dimentions of the renderer
const simulationResolution = vec2.create(); // the grid dimentions of the flow field

let isMouseDown = false;
const mousePosition = vec2.create();
const mouseDelta = vec2.create(); // On each frame we'll calculate where the mouse is and how much it's moved, to add external force to the fluid

let uniforms, simulationInput;
let boundaryProgram,
  advectionProgram,
  externalForceProgram,
  viscousityProgram,
  divergenceProgram,
  pressureProgram,
  pressureGradientProgram;
let renderProgram;

const animate = () => {
  const { delta } = clock.tick();

  // Apply damping to the mouseDelta so it converges to zero when the mouse stops moving
  vec2.scale(mouseDelta, mouseDelta, 1 - 0.01 * delta);

  // MiniGPU allows us to access and update our uniforms by name
  uniforms.member.delta_time = Math.max(Math.min(delta, 33.33), 8) / 1000; // Clamp to keep in a sensible range.
  uniforms.member.mouse_position = mousePosition;
  uniforms.member.mouse_delta = mouseDelta;

  // Run a compute program with MiniGPU
  computer.run(boundaryProgram);
  simulationInput.step(); // After every computation, swap the ping-pong buffers, so the output buffer becomes the input buffer for the next

  computer.run(advectionProgram);
  simulationInput.step();

  computer.run(externalForceProgram);
  simulationInput.step();

  // No need to run this if viscousity is zero
  if (VISCOSITY > 0) {
    // Run for multiple relaxation steps
    for (let i = 0; i < 24; i++) {
      computer.run(viscousityProgram);
      simulationInput.step();
    }
  }

  computer.run(divergenceProgram);
  simulationInput.step();

  // Run for multiple relaxation steps
  for (let i = 0; i < 24; i++) {
    computer.run(pressureProgram);
    simulationInput.step();
  }

  computer.run(pressureGradientProgram);
  simulationInput.step();

  // Render a render program with MiniGPU
  renderer.render(renderProgram);

  // Loop
  requestAnimationFrame(animate);
};

const onMouseMove = (e) => {
  if (!isMouseDown) return;
  const { clientX, clientY, movementX, movementY } = e;

  // Add the mouse movement to the delta in both directions
  mouseDelta[0] += movementX;
  mouseDelta[1] += movementY;

  // We want the mouse position to match the same dimentions as the renderer resolution
  vec2.set(
    mousePosition,
    clientX * renderer.pixelRatio,
    clientY * renderer.pixelRatio
  );
};

const onMouseDown = () => (isMouseDown = true);
const onMouseUp = () => (isMouseDown = false);

const init = async () => {
  // MiniGPU helper access the GPU Device
  const device = await Helpers.requestWebGPU();

  // MiniGPU Computer and Renderer to run out programs
  computer = new Computer(device);
  renderer = new Renderer(device, canvas);

  vec2.set(resolution, renderer.width, renderer.height);
  vec2.set(
    simulationResolution,
    Math.round(renderer.width * RESOLUTION),
    Math.round(renderer.height * RESOLUTION)
  );

  // MiniGPU input which helps to set up and structure a buffer to use for our uniforms.
  uniforms = new UniformsInput(device, {
    resolution: resolution,
    simulation_resolution: simulationResolution,
    delta_time: 8.33 / 1000, // The timestep (as a fraction of a second), which will be calculated and updated on each frame
    viscosity: VISCOSITY,
    mouse_position: mousePosition,
    mouse_delta: mouseDelta,
  });

  const dataSize = simulationResolution[0] * simulationResolution[1]; // Simulation width * height, to get our total number of grid cells

  // MiniGPU extention of a Float32Array, which allows us to pass in a structure description and item count. Creating the array (including padding) is handled for you.
  const data = new StructuredFloat32Array(
    {
      velocity: () => [0, 0],
      divergence: 0,
      pressure: 0,
    },
    dataSize
  );

  // MiniGPU input which creates two buffers which can be swapped to enable running a feedback loop
  simulationInput = new PingPongBufferInput(device, data);

  const inputs = {
    simulationInput,
    uniforms,
  };

  // MiniGPU compute program which can be run with a Computer
  boundaryProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${boundaryShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  advectionProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${advectionShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  externalForceProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${externalForceShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  viscousityProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${viscousityShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  divergenceProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${divergenceShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  pressureProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${pressureShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  pressureGradientProgram = new ComputeProgram(
    device,
    `${shaderHeader} ${shaderCommon} ${pressureGradientShader}`,
    inputs,
    data.count,
    WORKGROUP_SIZE
  );

  // MiniGPU helps to create the buffers needed to run the vertex shader
  const geometry = new Geometry(
    renderer,
    primitives.createPlaneVertices(2, 2), // Using twgl.js to create plane vertices (these are created Y+ but are flipped to Z+ in the vertex shader)
    1
  );

  // MiniGPU compute render which can be run with a Renderer
  renderProgram = new RenderProgram(
    renderer,
    `${shaderHeader} ${shaderCommon} ${renderShader}`,
    geometry,
    {
      simulation: simulationInput,
      uniforms,
    }
  );

  // Used to add external force
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousedown", onMouseDown);

  requestAnimationFrame(animate);
};

init();

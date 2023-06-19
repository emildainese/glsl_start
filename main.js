import * as THREE from "three";
import { vshader, fshader } from "./shaders/shaders";

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
const clock = new THREE.Clock();
const geometry = new THREE.PlaneGeometry(2, 2);
const renderer = new THREE.WebGLRenderer();

const material = new THREE.ShaderMaterial({
  vertexShader: vshader,
  fragmentShader: fshader,
  uniforms: {
    u_resolution: new THREE.Uniform(new THREE.Vector2()),
    u_mouse: new THREE.Uniform(new THREE.Vector2()),
    u_time: new THREE.Uniform(0.0),
  },
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

camera.position.z = 1;
const plane = new THREE.Mesh(geometry, material);

scene.add(plane);

function render() {
  material.uniforms.u_resolution.value.x = window.innerWidth;
  material.uniforms.u_resolution.value.y = window.innerHeight;
  material.uniforms.u_time.value = clock.getElapsedTime();

  renderer.render(scene, camera);
}

function onMouseMove(event) {
  event.preventDefault();
  const mouseX = event.clientX * 2.0 - 1.0;
  const mouseY = event.clientY * 2.0 + 1.0;

  material.uniforms.u_mouse.value.x = mouseX;
  material.uniforms.u_mouse.value.y = mouseY;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

animate();

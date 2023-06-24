import * as THREE from "three";
import { fshader } from "./shaders/fshader";
import { vshader } from "./shaders/vshader";

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

function animate() {
  requestAnimationFrame(animate);
  render();
}

animate();

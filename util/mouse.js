export const onMouseMove = (event, material) => {
  event.preventDefault();
  const mouseX = event.clientX * 2.0 - 1.0;
  const mouseY = event.clientY * 2.0 + 1.0;
  material.uniforms.u_mouse.value.x = mouseX;
  material.uniforms.u_mouse.value.y = mouseY;
};

export const moveCamera = (renderer, material) => {
  let down = false;
  renderer.domElement.addEventListener("mousedown", () => (down = true));
  renderer.domElement.addEventListener("mousemove", (event) => down && onMouseMove(event, material));
  renderer.domElement.addEventListener("mouseup", () => (down = false));
};

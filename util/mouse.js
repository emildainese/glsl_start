export function onMouseMove(event) {
  event.preventDefault();
  const mouseX = event.clientX * 2.0 - 1.0;
  const mouseY = event.clientY * 2.0 + 1.0;

  material.uniforms.u_mouse.value.x = mouseX;
  material.uniforms.u_mouse.value.y = mouseY;
}

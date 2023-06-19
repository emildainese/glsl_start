export const vshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;
	
	void main(){
	  v_uv = uv;
	  v_position = position;
	  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	
	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	void main() {
		vec2 uv = v_uv / u_resolution.xy;
		vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
		gl_FragColor = vec4(color, 1.0); 
	}
`;

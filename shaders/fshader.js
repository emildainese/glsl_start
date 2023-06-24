export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	vec2 NormalizedCoordinate() {
		vec2 aspectRatio =  u_resolution / u_resolution.y;
		return  (gl_FragCoord.xy * 2.0 - u_resolution) / u_resolution.y - 0.5 * aspectRatio;
	}

	void main() {
		vec2 uv = v_uv;
		vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0.0, 2.0, 4.0));
		
		gl_FragColor = vec4(color, 1.0); 
	}
`;

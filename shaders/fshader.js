export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	vec2 UvCoordinate() {
		return  (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	}

	void main() {
		vec2 uv = UvCoordinate() ;
		vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0.0, 2.0, 4.0));
		
		gl_FragColor = vec4(color, 1.0); 
	}
`;

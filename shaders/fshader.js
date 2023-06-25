export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	vec3 Palette(float t) {
		vec3 a = vec3(0.731, 1.098, 0.192);
		vec3 b = vec3(0.358, 1.090, 0.657);
		vec3 c = vec3(1.077, 0.360, 0.328);
		vec3 d = vec3(0.965, 2.265, 0.837);
      return a + b * cos(6.28318*(c * t + d));
  }

	vec2 UvCoordinate() {
		return  (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	}

	void main() {
		vec2 uv = UvCoordinate() ;
		vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0.0, 2.0, 4.0));
		
		gl_FragColor = vec4(color, 1.0); 
	}
`;

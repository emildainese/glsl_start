export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	

	#define MAX_STEPS 100
	#define SURFACE_DIST 0.001
	#define MAX_DIST 100.

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	float SdfCylinder(){
		return 1.;
	}

	float SdfBox() {
		return 1.;
	}

	float SdfCapsule(){
		return 1.;
	}

	float SdfTorous() {
		return 1.;
	}

  float SdfSphere(vec3 p, vec4 sphere) {
		return length(p - sphere.xyz) - sphere.w;
   }

  float SdfPlane(vec3 p) {
		return p.y;
   }

	// My Scene
  float GetDistance(vec3 p) {
	   float sphereDist = SdfSphere(p, vec4(0., 1., 6., 1.));
		float planeDist  = SdfPlane(p);
		float d = min(sphereDist, planeDist);

		return d;
   }

  float RayMarch(vec3 ro, vec3 rd) {
	float d0 = 0.;

	for(int i = 0; i < MAX_STEPS; ++i) {
		vec3 p = ro + d0 * rd;
		float ds = GetDistance(p);
		d0 += ds;
		if(ds < SURFACE_DIST || d0 > MAX_DIST) break;
	}

	return d0;
  }

  vec3 GetNormal(vec3 p) {
		float d = GetDistance(p);
		vec2 e = vec2(.01, 0.);
		vec3 n = d - vec3(GetDistance(p - e.xyy), GetDistance(p - e.yxy), GetDistance(p - e.yyx));

		return normalize(n);
  }

  float GetShadow(vec3 p, vec3 light, vec3 normal) {
		float diff = 1.0;
		// Keep a small distance form scene plane !!
		float shadow = RayMarch(p + normal * SURFACE_DIST * 2., light);
		if(shadow < length(light - p)) diff *= 0.1;
		return diff;
  }

   float GetLight(vec3 p) {
		vec3 lightPos = vec3(0., 5., 6.);
		lightPos.xz += vec2(sin(u_time), cos(u_time)) * 3.;

		vec3 lightVec = normalize(lightPos - p);
		vec3 normal = GetNormal(p);
		float diff = clamp(dot(normal, lightVec), 0., 1.);

    	return diff * GetShadow(p, lightVec, normal);
   }

	vec2 UvCoordinate() {
		return (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	}

	void main() {
		vec2 uv = UvCoordinate() ;
		vec3 color  = vec3(0.0);

		vec3 ro = vec3(0., 1., 0.);
		vec3 rd = normalize(vec3(uv.x, uv.y, 1.));

		float d =  RayMarch(ro, rd) ;

		vec3 p = ro + rd * d;
		float diff = GetLight(p);
		
		color = vec3(diff);
			
		gl_FragColor = vec4(color, 1.0); 
	}
`;

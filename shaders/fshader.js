export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	

	#define MAX_STEPS 100
	#define SURFACE_DIST 0.01
	#define MAX_DIST 100.

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	// https://www.youtube.com/watch?v=AfKGMUDWfuE&list=PLGmrMu-IwbgtMxMiV3x4IrHPlPmg7FD-P&index=3

	// PRIMITIVE SHAPES
	float SdfBox(vec3 p, vec3 size) {
		return length( max( abs(p) - size, 0. ) );
	}

	float SdfCylinder(vec3 p, vec3 a, vec3 b, float r) {
		vec3 ap = p - a;
		vec3 ab = b - a;

		float t = dot(ap, ab) / dot(ab, ab);
		vec3 c  = a + t * ab;

		float x = length(p - c) - r;
		float y = (abs(t - 0.5) - 0.5) * length(ab);

		float de = length( max( vec2(x, y), 0. ) );
		float di = min( max(x, y), 0.);

		return de + di;
	}

	float SdfPrism(vec3 p, vec2 h) {
		vec3 q = abs(p);
		return max(q.z - h.y, max(q.x * 0.866025 + p.y * 0.5, -p.y) - h.x * 0.5);
	}

	float SdfCapsule(vec3 p, vec3 a, vec3 b, float r) {
		vec3 ap = p - a;
		vec3 ab = b - a;
		float t = dot(ap, ab) / dot(ab, ab);
		vec3 c  = a + clamp(t, 0., 1.) * ab;
		return length(p - c) - r;
	}

	float SdfTorus(vec3 p, vec2 r) {
		float x = length(p.xz) - r.x;
		return length(vec2(x, p.y)) - r.y;
	}

   float SdfSphere(vec3 p, vec4 sphere) {
		return length(p - sphere.xyz) - sphere.w;
   }

   float SdfPlane(vec3 p) {
		return p.y;
   }

	// OPERATORS
	float Union(float shape1, float shape2) {
		return min(shape1, shape2);
	}

	float Inverse(float shape) {
		return -shape;
	}  
	
	float Intersect(float shape1, float shape2){
		return max(shape1, shape2);
	}

	float Difference(float base, float subtraction){
		return Intersect(base, -subtraction);
	}

	float Interpolate(float shape1, float shape2, float amount){
		return mix(shape1, shape2, amount);
	}

  float RenderScene(vec3 p) {
	   float sphere   = SdfSphere(p, vec4(0., 1., 6., 1.));
		float plane    = SdfPlane(p);
		float capsule  = SdfCapsule(p, vec3(3.5, 2., 6.5), vec3(6., 2., 6.5), .5);
		float torus    = SdfTorus(p - vec3(0., 2, 6.), vec2(2., .5));
		float box      = SdfBox(p- vec3(-2., 0.5, 5.), vec3(0.5));
		float cylinder = SdfCylinder(p, vec3(2., .5, 5.), vec3(4., .5, 6.), .5);
		float prism    = SdfPrism(p - vec3(-7., 1., 11.), vec2(2.));

		float d = Union(sphere, plane);
				d = Union(capsule, d);
				d = Union(torus, d);
				d = Union(box, d);
				d = Union(cylinder, d);
				d = Union(prism, d);

		return d;
   }

  float RayMarch(vec3 ro, vec3 rd) {
	 float d0 = 0.;

	 for(int i = 0; i < MAX_STEPS; ++i) {
		vec3 p = ro + d0 * rd;

		float ds = RenderScene(p);
		d0 += ds;

		if(ds < SURFACE_DIST || d0 > MAX_DIST) break;
	 }

	return d0;
  }

  vec3 GetNormal(vec3 p) {
		float d = RenderScene(p);
		vec2 e = vec2(.01, 0.);
		vec3 n = d - vec3(RenderScene(p - e.xyy), RenderScene(p - e.yxy), RenderScene(p - e.yyx));

    	return normalize(n);
  }

  float GetShadow(vec3 p, vec3 light, vec3 normal) {
		float diff = 1.0;
		// Keep a small distance form scene plane !!
		float shadow = RayMarch(p + normal * SURFACE_DIST * 2., light);
		if(shadow < length(light - p)) diff *= 0.1;

		return diff;
  }

   // DIFFUSE LIGHT
   float GetLight(vec3 p, vec3 lightPos) {
		lightPos.xz += vec2(cos(u_time), sin(u_time)) * 5.;

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
		float diff = GetLight(p, vec3(0., 7., 1.));
		
		color = vec3(diff);
			
		gl_FragColor = vec4(color, 1.0); 
	}
`;

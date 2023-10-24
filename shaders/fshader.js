export const fshader = /*glsl*/ `
	varying vec2 v_uv;
	varying vec3 v_position;	

	#define MAX_STEPS 100
	#define SURFACE_DIST 0.01
	#define MAX_DIST 100.
	#define PI 3.1425

	uniform vec2 u_resolution;
	uniform vec2 u_mouse;
	uniform float u_time;

	// 2D Rotation Matrix		
	mat2 Rot(float a) {
		float s = sin(a);
		float c = cos(a);
		return mat2(c, -s, s, c);
	}

	float smin( float a, float b, float k ) {
		float h = clamp( 0.5 + 0.5 * (b - a) / k, 0., 1. );
		return mix(b, a, h) - k * h * (1.0 - h);
  }

	// PRIMITIVE SHAPES
	float SdfBox(vec3 p, vec3 size) {
		vec3 q = abs(p) - size;
		return length(max(q, 0.)) + min( max(q.x, max(q.y, q.z) ), 0.);
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

	float Intersect(float shape1, float shape2){
		return max(shape1, shape2);
	}

	float Difference(float base, float subtraction){
		return max(base, -subtraction);
	}

	float Interpolate(float shape1, float shape2, float amount){
		return mix(shape1, shape2, amount);
	}

  float RenderScene(vec3 p) {
		float plane    = SdfPlane(p);

		vec3 sp = p;
		float scaleY = 1.;
		float scaleZ = 1.;
		sp *= vec3(1., scaleY , scaleZ);
	   float sphereA   = SdfSphere(sp, vec4(0., 1., 0., 1.));
		float sphereB  = SdfSphere(sp, vec4(1., 1., 0., 1.));

		// float capsule  = SdfCapsule(p, vec3(3.5, 2., 6.5), vec3(6., 2., 6.5), .5);
		// float torus    = SdfTorus(p - vec3(0., 2, 6.), vec2(2., .5));

		vec3  bp   = p - vec3(0., 1., 0.);
		bp.xz *= Rot(u_time);
		float box  = SdfBox(bp, vec3(1.));

		// float cylinder = SdfCylinder(p, vec3(2., .5, 5.), vec3(4., .5, 6.), .5);
		// float prism    = SdfPrism(p - vec3(-7., 1., 11.), vec2(2.));

		// float spheres = Difference(sphereA, sphereB);
		// float spheres = Intersect(sphereA, sphereB);
		// float spheres = smin(sphereA, box, 0.5);
		float spheres = Interpolate(sphereA, box, sin(u_time) * 0.5 + 0.5);

		float d = Union(spheres , plane);
		// 		d = Union(capsule, d);
		// 		d = Union(torus, d);
		//       d = Union(cylinder, d);
		//       d = Union(prism, d);
		//       d = Union(box, d);

		return d;
   }

  float RayMarch(vec3 ro, vec3 rd) {
	 float d0 = 0.;
	 for(int i = 0; i < MAX_STEPS; ++i) {
		vec3 p = ro + d0 * rd;
		float ds = abs( RenderScene(p) );
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
		// lightPos.xz += vec2(cos(u_time), sin(u_time)) * 3.;
		vec3 lightVec = normalize(lightPos - p);
		vec3 normal = GetNormal(p);
		float diff = clamp(dot(normal, lightVec), 0., 1.);
    	return diff * GetShadow(p, lightVec, normal);
   }

	vec3 LookAt(vec2 uv, vec3 p, vec3 l, float z) {
		vec3 f = normalize(l - p),
			  r = normalize( cross(vec3(0, 1, 0), f)),
			  u = cross(f, r),
			  c = p + f * z,
			  i = c + uv.x * r + uv.y * u,
			  d = normalize(i - p);
		return d;
  }

	vec2 UvCoordinate() {
		return (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
	}

	void main() {
		vec2 uv = UvCoordinate() ;
		vec3 color  = vec3(0.0);
		vec2 m = u_mouse.xy / u_resolution.xy;

		vec3 ro = vec3(0, 3., -7.);
		ro.yz *= Rot(m.y * PI);
		ro.xz *= Rot(m.x * PI);

		vec3 rd = LookAt(uv, ro, vec3(0, 0, 0), .7);
		float d = RayMarch(ro, rd) ;

		if(d < MAX_DIST) {
			vec3 p = ro + rd * d;
			vec3 lp = vec3(-1., 4., -1.);
			float dif = GetLight(p, lp);
			color = vec3(dif);
		}

		color = pow(color, vec3(.4545));

		gl_FragColor = vec4(color, 1.0); 
	}
`;

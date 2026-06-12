/* Aurora Background — Vanilla WebGL
   GLSL shader ported from the starfall-portfolio reference.
   No dependencies. Graceful fallback if WebGL is unavailable.
*/
;(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  canvas.id = 'aurora-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'z-index:0;pointer-events:none;display:block';
  document.body.insertBefore(canvas, document.body.firstChild);

  var gl =
    canvas.getContext('webgl') ||
    canvas.getContext('experimental-webgl');
  if (!gl) return; // fallback: orbs remain visible

  /* ── Vertex shader: full-screen quad ──────────────────────── */
  var VERT = 'attribute vec4 a;void main(){gl_Position=a;}';

  /* ── Fragment shader: aurora borealis effect ──────────────── */
  var FRAG = [
    'precision mediump float;',
    'uniform float T;',   /* time */
    'uniform vec2 R;',    /* resolution */

    'float rand(vec2 n){',
    '  return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);',
    '}',

    'float noise(vec2 p){',
    '  vec2 ip=floor(p),u=fract(p);',
    '  u=u*u*(3.-2.*u);',
    '  return mix(',
    '    mix(rand(ip),rand(ip+vec2(1,0)),u.x),',
    '    mix(rand(ip+vec2(0,1)),rand(ip+vec2(1,1)),u.x),u.y);',
    '}',

    'float fbm(vec2 x){',
    '  float v=0.,a=.3;',
    '  vec2 s=vec2(100.);',
    '  mat2 m=mat2(.877,.479,-.479,.877);', /* rotation ~0.5 rad */
    '  for(int i=0;i<3;i++){v+=a*noise(x);x=m*x*2.+s;a*=.4;}',
    '  return v;',
    '}',

    'void main(){',
    '  vec2 p=(gl_FragCoord.xy-R*.5)/R.y;',
    '  p=p*mat2(6.,-4.,4.,6.);',
    '  vec4 o=vec4(0.);',
    '  float f=2.+fbm(p+vec2(T*5.,0.))*.5;',
    '  for(int n=0;n<35;n++){',
    '    float i=float(n);',
    '    vec2 v=p+cos(i*i+(T+p.x*.08)*.025+i*vec2(13.,11.))*3.5;',
    '    float tn=fbm(v+vec2(T*.5,i))*.3*(1.-i/35.);',
    '    vec4 ac=vec4(.1+.3*sin(i*.2+T*.4),.3+.5*cos(i*.3+T*.5),.7+.3*sin(i*.4+T*.3),1.);',
    '    float lv=max(length(max(v,vec2(v.x*f*.015,v.y*1.5))),.001);',
    '    vec4 cc=ac*exp(sin(i*i+T*.8))/lv;',
    '    float tf=smoothstep(0.,1.,i/35.)*.6;',
    '    o+=cc*(1.+tn*.8)*tf;',
    '  }',
    '  vec4 t=pow(abs(o/100.),vec4(1.6));',          /* pow tone-map */
    '  vec4 e=exp(2.*clamp(t,0.,10.));',             /* tanh: (e^2x-1)/(e^2x+1) */
    '  gl_FragColor=clamp((e-1.)/(e+1.)*1.5,0.,1.);',
    '}'
  ].join('\n');

  function mkShader(src, type) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, mkShader(VERT, gl.VERTEX_SHADER));
  gl.attachShader(prog, mkShader(FRAG, gl.FRAGMENT_SHADER));
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn('[aurora] shader link failed:', gl.getProgramInfoLog(prog));
    return;
  }

  gl.useProgram(prog);

  /* Full-screen triangle strip */
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  );
  var aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  var uT = gl.getUniformLocation(prog, 'T');
  var uR = gl.getUniformLocation(prog, 'R');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uR, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('load', resize, { passive: true });

  /* Pause when tab is hidden to save GPU */
  var paused = false;
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });
  /* Expose pause/resume for external tooling */
  window.__auroraPause  = function () { paused = true; };
  window.__auroraResume = function () { paused = false; };

  var time = 0;
  function tick() {
    requestAnimationFrame(tick);
    if (paused) return;
    /* Lazy init: resize on first frame if dimensions were 0 at startup */
    if (canvas.width === 0) { resize(); return; }
    time += 0.016;
    gl.uniform1f(uT, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  tick();
})();

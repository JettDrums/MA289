(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,89612,e=>{"use strict";var t=e.i(43476),i=e.i(71645);let r=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`,o=8294400;class a{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=(function(){let e=navigator.userAgent.toLowerCase();return e.includes("safari")&&!e.includes("chrome")&&!e.includes("android")})();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(e,t,i,r,a=0,s=0,l=2,u=o,c=[]){if(e?.nodeType===1)this.parentElement=e;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=e.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){const e=this.ownerDocument.createElement("style");e.innerHTML=n,e.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(e)}const h=this.ownerDocument.createElement("canvas");this.canvasElement=h,this.parentElement.prepend(h),this.fragmentShader=t,this.providedUniforms=i,this.mipmaps=c,this.currentFrame=s,this.minPixelRatio=l,this.maxPixelCount=u;const f=h.getContext("webgl2",r);if(!f)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=f,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setupIntersectionObserver(),this.setSpeed(a),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let e=function(e,t,i){let r=e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT),o=r?r.precision:null;o&&o<23&&(t=t.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),i=i.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3"));let a=s(e,e.VERTEX_SHADER,t),n=s(e,e.FRAGMENT_SHADER,i);if(!a||!n)return null;let l=e.createProgram();return l?(e.attachShader(l,a),e.attachShader(l,n),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS))?(e.detachShader(l,a),e.detachShader(l,n),e.deleteShader(a),e.deleteShader(n),l):(console.error("Unable to initialize the shader program: "+e.getProgramInfoLog(l)),e.deleteProgram(l),e.deleteShader(a),e.deleteShader(n),null):null}(this.gl,r,this.fragmentShader);e&&(this.program=e)};setupPositionAttribute=()=>{let e=this.gl.getAttribLocation(this.program,"a_position"),t=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(e),this.gl.vertexAttribPointer(e,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let e={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([t,i])=>{if(e[t]=this.gl.getUniformLocation(this.program,t),i instanceof HTMLImageElement){let i=`${t}AspectRatio`;e[i]=this.gl.getUniformLocation(this.program,i)}}),this.uniformLocations=e};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;intersectionObserver=null;isInViewport=!0;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([e])=>{if(e?.borderBoxSize[0]){let t=e.devicePixelContentBoxSize?.[0];void 0!==t&&(this.devicePixelsSupported=!0,this.parentDevicePixelWidth=t.inlineSize,this.parentDevicePixelHeight=t.blockSize),this.parentWidth=e.borderBoxSize[0].inlineSize,this.parentHeight=e.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};setupIntersectionObserver=()=>{let e=this.ownerDocument.defaultView;e?.IntersectionObserver&&(this.intersectionObserver=new e.IntersectionObserver(([e])=>{this.isInViewport=e?.isIntersecting??!0,this.updateCurrentSpeed()}),this.intersectionObserver.observe(this.parentElement))};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let e=0,t=0,i=Math.max(1,window.devicePixelRatio),r=visualViewport?.scale??1;if(this.devicePixelsSupported){let o=Math.max(1,this.minPixelRatio/i);e=this.parentDevicePixelWidth*o*r,t=this.parentDevicePixelHeight*o*r}else{var o;let a,s,n=Math.max(i,this.minPixelRatio)*r;this.isSafari&&(n*=Math.max(1,(o=this.ownerDocument,(s=Math.round(100*(a=outerWidth/((visualViewport?.scale??1)*(visualViewport?.width??window.innerWidth)+(window.innerWidth-o.documentElement.clientWidth)))))%5==0?s/100:33===s?1/3:67===s?2/3:133===s?4/3:a))),e=Math.round(this.parentWidth)*n,t=Math.round(this.parentHeight)*n}let a=Math.min(1,Math.sqrt(this.maxPixelCount)/Math.sqrt(e*t)),s=Math.round(e*a),n=Math.round(t*a),l=s/Math.round(this.parentWidth);(this.canvasElement.width!==s||this.canvasElement.height!==n||this.renderScale!==l)&&(this.renderScale=l,this.canvasElement.width=s,this.canvasElement.height=n,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now()))};render=e=>{if(this.hasBeenDisposed)return;if(null===this.program)return void console.warn("Tried to render before program or gl was initialized");let t=e-this.lastRenderTime;this.lastRenderTime=e,0!==this.currentSpeed&&(this.currentFrame+=t*this.currentSpeed),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,.001*this.currentFrame),this.resolutionChanged&&(this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1),this.gl.drawArrays(this.gl.TRIANGLES,0,6),0!==this.currentSpeed?this.requestRender():this.rafId=null};requestRender=()=>{null!==this.rafId&&cancelAnimationFrame(this.rafId),this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(e,t)=>{if(!t.complete||0===t.naturalWidth)throw Error(`Paper Shaders: image for uniform ${e} must be fully loaded`);let i=this.textures.get(e);i&&this.gl.deleteTexture(i),this.textureUnitMap.has(e)||this.textureUnitMap.set(e,this.textureUnitMap.size);let r=this.textureUnitMap.get(e);this.gl.activeTexture(this.gl.TEXTURE0+r);let o=this.gl.createTexture();this.gl.bindTexture(this.gl.TEXTURE_2D,o),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,t),this.mipmaps.includes(e)&&(this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR));let a=this.gl.getError();if(a!==this.gl.NO_ERROR||null===o)return void console.error("Paper Shaders: WebGL error when uploading texture:",a);this.textures.set(e,o);let s=this.uniformLocations[e];if(s){this.gl.uniform1i(s,r);let i=`${e}AspectRatio`,o=this.uniformLocations[i];if(o){let e=t.naturalWidth/t.naturalHeight;this.gl.uniform1f(o,e)}}};areUniformValuesEqual=(e,t)=>e===t||!!(Array.isArray(e)&&Array.isArray(t))&&e.length===t.length&&e.every((e,i)=>this.areUniformValuesEqual(e,t[i]));setUniformValues=e=>{this.gl.useProgram(this.program),Object.entries(e).forEach(([e,t])=>{let i=t;if(t instanceof HTMLImageElement&&(i=`${t.src.slice(0,200)}|${t.naturalWidth}x${t.naturalHeight}`),this.areUniformValuesEqual(this.uniformCache[e],i))return;this.uniformCache[e]=i;let r=this.uniformLocations[e];if(!r)return void console.warn(`Uniform location for ${e} not found`);if(t instanceof HTMLImageElement)this.setTextureUniform(e,t);else if(Array.isArray(t)){let i=null,o=null;if(void 0!==t[0]&&Array.isArray(t[0])){let r=t[0].length;if(!t.every(e=>e.length===r))return void console.warn(`All child arrays must be the same length for ${e}`);i=t.flat(),o=r}else o=(i=t).length;switch(o){case 2:this.gl.uniform2fv(r,i);break;case 3:this.gl.uniform3fv(r,i);break;case 4:this.gl.uniform4fv(r,i);break;case 9:this.gl.uniformMatrix3fv(r,!1,i);break;case 16:this.gl.uniformMatrix4fv(r,!1,i);break;default:console.warn(`Unsupported uniform array length: ${o}`)}}else"number"==typeof t?this.gl.uniform1f(r,t):"boolean"==typeof t?this.gl.uniform1i(r,+!!t):console.warn(`Unsupported uniform type for ${e}: ${typeof t}`)})};getCurrentFrame=()=>this.currentFrame;setFrame=e=>{this.currentFrame=e,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(e=1)=>{this.speed=e,this.updateCurrentSpeed()};updateCurrentSpeed=()=>{this.setCurrentSpeed(this.ownerDocument.hidden||!this.isInViewport?0:this.speed)};setCurrentSpeed=e=>{this.currentSpeed=e,null===this.rafId&&0!==e&&(this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render)),null!==this.rafId&&0===e&&(cancelAnimationFrame(this.rafId),this.rafId=null)};setMaxPixelCount=(e=o)=>{this.maxPixelCount=e,this.handleResize()};setMinPixelRatio=(e=2)=>{this.minPixelRatio=e,this.handleResize()};setUniforms=e=>{this.setUniformValues(e),this.providedUniforms={...this.providedUniforms,...e},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.updateCurrentSpeed()};dispose=()=>{this.hasBeenDisposed=!0,null!==this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.gl&&this.program&&(this.textures.forEach(e=>{this.gl.deleteTexture(e)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError()),this.resizeObserver&&(this.resizeObserver.disconnect(),this.resizeObserver=null),this.intersectionObserver&&(this.intersectionObserver.disconnect(),this.intersectionObserver=null),visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}}function s(e,t,i){let r=e.createShader(t);return r?(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))?r:(console.error("An error occurred compiling the shaders: "+e.getShaderInfoLog(r)),e.deleteShader(r),null):null}let n=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function l(e){if(e.naturalWidth<1024&&e.naturalHeight<1024){if(e.naturalWidth<1||e.naturalHeight<1)return;let t=e.naturalWidth/e.naturalHeight;e.width=Math.round(t>1?1024*t:1024),e.height=Math.round(t>1?1024:1024/t)}}async function u(e){let t={},i=[];return Object.entries(e).forEach(([e,r])=>{if("string"==typeof r){let o=r||"data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";if(!(e=>{try{if(e.startsWith("/"))return!0;return new URL(e),!0}catch{return!1}})(o))return void console.warn(`Uniform "${e}" has invalid URL "${o}". Skipping image loading.`);let a=new Promise((i,r)=>{let a=new Image;(e=>{try{if(e.startsWith("/"))return!1;return new URL(e,window.location.origin).origin!==window.location.origin}catch{return!1}})(o)&&(a.crossOrigin="anonymous"),a.onload=()=>{l(a),t[e]=a,i()},a.onerror=()=>{console.error(`Could not set uniforms. Failed to load image at ${o}`),r()},a.src=o});i.push(a)}else if(r instanceof HTMLImageElement){let o=r.decode().then(()=>{l(r),t[e]=r});i.push(o)}else t[e]=r}),await Promise.all(i),t}let c=(0,i.forwardRef)(function({fragmentShader:e,uniforms:r,webGlContextAttributes:o,speed:s=0,frame:n=0,width:l,height:c,minPixelRatio:h,maxPixelCount:f,mipmaps:p,style:g,...d},m){var v;let x,_,[S,b]=(0,i.useState)(!1),y=(0,i.useRef)(null),R=(0,i.useRef)(null),w=(0,i.useRef)(o);(0,i.useEffect)(()=>((async()=>{let t=await u(r);y.current&&!R.current&&(R.current=new a(y.current,e,t,w.current,s,n,h,f,p),b(!0))})(),()=>{R.current?.dispose(),R.current=null}),[e]),(0,i.useEffect)(()=>{let e=!1;return(async()=>{let t=await u(r);e||R.current?.setUniforms(t)})(),()=>{e=!0}},[r,S]),(0,i.useEffect)(()=>{R.current?.setSpeed(s)},[s,S]),(0,i.useEffect)(()=>{R.current?.setMaxPixelCount(f)},[f,S]),(0,i.useEffect)(()=>{R.current?.setMinPixelRatio(h)},[h,S]),(0,i.useEffect)(()=>{R.current?.setFrame(n)},[n,S]);let U=(v=[y,m],x=i.useRef(void 0),_=i.useCallback(e=>{let t=v.map(t=>{if(null!=t){if("function"==typeof t){let i=t(e);return"function"==typeof i?i:()=>{t(null)}}return t.current=e,()=>{t.current=null}}});return()=>{t.forEach(e=>e?.())}},v),i.useMemo(()=>v.every(e=>null==e)?null:e=>{x.current&&(x.current(),x.current=void 0),null!=e&&(x.current=_(e))},v));return(0,t.jsx)("div",{ref:U,style:void 0!==l||void 0!==c?{width:"string"==typeof l&&!1===isNaN(+l)?+l:l,height:"string"==typeof c&&!1===isNaN(+c)?+c:c,...g}:g,...d})});c.displayName="ShaderMount";let h=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`,f=`
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`,p=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`,g=`#version 300 es
precision mediump float;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform float u_radius;
uniform float u_contrast;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_size;
uniform float u_grainMixer;
uniform float u_grainOverlay;
uniform float u_grainSize;
uniform float u_grid;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_type;

in vec2 v_imageUV;

out vec4 fragColor;

${h}
${f}
${p}

float valueNoise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
  return smoothstep(edge0, edge1, x);
}

float getCircle(vec2 uv, float r, float baseR) {
  r = mix(.25 * baseR, 0., r);
  float d = length(uv - .5);
  float aa = fwidth(d);
  return 1. - smoothstep(r - aa, r + aa, d);
}

float getCell(vec2 uv) {
  float insideX = step(0.0, uv.x) * (1.0 - step(1.0, uv.x));
  float insideY = step(0.0, uv.y) * (1.0 - step(1.0, uv.y));
  return insideX * insideY;
}

float getCircleWithHole(vec2 uv, float r, float baseR) {
  float cell = getCell(uv);

  r = mix(.75 * baseR, 0., r);
  float rMod = mod(r, .5);

  float d = length(uv - .5);
  float aa = fwidth(d);
  float circle = 1. - smoothstep(rMod - aa, rMod + aa, d);
  if (r < .5) {
    return circle;
  } else {
    return cell - circle;
  }
}

float getGooeyBall(vec2 uv, float r, float baseR) {
  float d = length(uv - .5);
  float sizeRadius = .3;
  if (u_grid == 1.) {
    sizeRadius = .42;
  }
  sizeRadius = mix(sizeRadius * baseR, 0., r);
  d = 1. - sst(0., sizeRadius, d);

  d = pow(d, 2. + baseR);
  return d;
}

float getSoftBall(vec2 uv, float r, float baseR) {
  float d = length(uv - .5);
  float sizeRadius = clamp(baseR, 0., 1.);
  sizeRadius = mix(.5 * sizeRadius, 0., r);
  d = 1. - lst(0., sizeRadius, d);
  float powRadius = 1. - lst(0., 2., baseR);
  d = pow(d, 4. + 3. * powRadius);
  return d;
}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.0001;

  float left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  float right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  float bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  float top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);

  return left * right * bottom * top;
}

float sigmoid(float x, float k) {
  return 1.0 / (1.0 + exp(-k * (x - 0.5)));
}

float getLumAtPx(vec2 uv, float contrast) {
  vec4 tex = texture(u_image, uv);
  vec3 color = vec3(
  sigmoid(tex.r, contrast),
  sigmoid(tex.g, contrast),
  sigmoid(tex.b, contrast)
  );
  float lum = dot(vec3(0.2126, 0.7152, 0.0722), color);
  lum = mix(1., lum, tex.a);
  lum = u_inverted ? (1. - lum) : lum;
  return lum;
}

float getLumBall(vec2 p, vec2 pad, vec2 inCellOffset, float contrast, float baseR, float stepSize, out vec4 ballColor) {
  p += inCellOffset;
  vec2 uv_i = floor(p);
  vec2 uv_f = fract(p);
  vec2 samplingUV = (uv_i + .5 - inCellOffset) * pad + vec2(.5);
  float outOfFrame = getUvFrame(samplingUV, pad * stepSize);

  float lum = getLumAtPx(samplingUV, contrast);
  ballColor = texture(u_image, samplingUV);
  ballColor.rgb *= ballColor.a;
  ballColor *= outOfFrame;

  float ball = 0.;
  if (u_type == 0.) {
    // classic
    ball = getCircle(uv_f, lum, baseR);
  } else if (u_type == 1.) {
    // gooey
    ball = getGooeyBall(uv_f, lum, baseR);
  } else if (u_type == 2.) {
    // holes
    ball = getCircleWithHole(uv_f, lum, baseR);
  } else if (u_type == 3.) {
    // soft
    ball = getSoftBall(uv_f, lum, baseR);
  }

  return ball * outOfFrame;
}


void main() {

  float stepMultiplier = 1.;
  if (u_type == 0.) {
    // classic
    stepMultiplier = 2.;
  } else if (u_type == 1. || u_type == 3.) {
    // gooey & soft
    stepMultiplier = 6.;
  }

  float cellsPerSide = mix(300., 7., pow(u_size, .7));
  cellsPerSide /= stepMultiplier;
  float cellSizeY = 1. / cellsPerSide;
  vec2 pad = cellSizeY * vec2(1. / u_imageAspectRatio, 1.);
  if (u_type == 1. && u_grid == 1.) {
    // gooey diagonal grid works differently
    pad *= .7;
  }

  vec2 uv = v_imageUV;
  uv -= vec2(.5);
  uv /= pad;

  float contrast = mix(0., 15., pow(u_contrast, 1.5));
  float baseRadius = u_radius;
  if (u_originalColors == true) {
    contrast = mix(.1, 4., pow(u_contrast, 2.));
    baseRadius = 2. * pow(.5 * u_radius, .3);
  }

  float totalShape = 0.;
  vec3 totalColor = vec3(0.);
  float totalOpacity = 0.;

  vec4 ballColor;
  float shape;
  float stepSize = 1. / stepMultiplier;
  for (float x = -0.5; x < 0.5; x += stepSize) {
    for (float y = -0.5; y < 0.5; y += stepSize) {
      vec2 offset = vec2(x, y);

      if (u_grid == 1.) {
        float rowIndex = floor((y + .5) / stepSize);
        float colIndex = floor((x + .5) / stepSize);
        if (stepSize == 1.) {
          rowIndex = floor(uv.y + y + 1.);
          if (u_type == 1.) {
            colIndex = floor(uv.x + x + 1.);
          }
        }
        if (u_type == 1.) {
          if (mod(rowIndex + colIndex, 2.) == 1.) {
            continue;
          }
        } else {
          if (mod(rowIndex, 2.) == 1.) {
            offset.x += .5 * stepSize;
          }
        }
      }

      shape = getLumBall(uv, pad, offset, contrast, baseRadius, stepSize, ballColor);
      totalColor   += ballColor.rgb * shape;
      totalShape   += shape;
      totalOpacity += shape;
    }
  }

  const float eps = 1e-4;

  totalColor /= max(totalShape, eps);
  totalOpacity /= max(totalShape, eps);

  float finalShape = 0.;
  if (u_type == 0.) {
    finalShape = min(1., totalShape);
  } else if (u_type == 1.) {
    float aa = fwidth(totalShape);
    float th = .5;
    finalShape = smoothstep(th - aa, th + aa, totalShape);
  } else if (u_type == 2.) {
    finalShape = min(1., totalShape);
  } else if (u_type == 3.) {
    finalShape = totalShape;
  }

  vec2 grainSize = mix(2000., 200., u_grainSize) * vec2(1., 1. / u_imageAspectRatio);
  vec2 grainUV = v_imageUV - .5;
  grainUV *= grainSize;
  grainUV += .5;
  if (u_grainMixer > 0.) {
    float grain = valueNoise(grainUV);
    grain = smoothstep(.55, .7 + .2 * u_grainMixer, grain);
    grain *= u_grainMixer;
    finalShape = mix(finalShape, 0., grain);
  }

  vec3 color = vec3(0.);
  float opacity = 0.;

  if (u_originalColors == true) {
    color = totalColor * finalShape;
    opacity = totalOpacity * finalShape;

    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    color = color + bgColor * (1. - opacity);
    opacity = opacity + u_colorBack.a * (1. - opacity);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;

    color = fgColor * finalShape;
    opacity = fgOpacity * finalShape;
    color += bgColor * (1. - opacity);
    opacity += bgOpacity * (1. - opacity);
  }

  if (u_grainOverlay > 0.) {
    float grainOverlay = valueNoise(rotate(grainUV, 1.) + vec2(3.));
    grainOverlay = mix(grainOverlay, valueNoise(rotate(grainUV, 2.) + vec2(-1.)), .5);
    grainOverlay = pow(grainOverlay, 1.3);

    float grainOverlayV = grainOverlay * 2. - 1.;
    vec3 grainOverlayColor = vec3(step(0., grainOverlayV));
    float grainOverlayStrength = u_grainOverlay * abs(grainOverlayV);
    grainOverlayStrength = pow(grainOverlayStrength, .8);
    color = mix(color, grainOverlayColor, .5 * grainOverlayStrength);

    opacity += .5 * grainOverlayStrength;
  }
  opacity = clamp(opacity, 0., 1.);

  fragColor = vec4(color, opacity);
}
`,d={classic:0,gooey:1,holes:2,soft:3},m={square:0,hex:1};function v(e){if(Array.isArray(e))return 4===e.length?e:3===e.length?[...e,1]:_;if("string"!=typeof e)return _;let t,i,r,o=1;if(e.startsWith("#")){var a;(3===(a=(a=e).replace(/^#/,"")).length||4===a.length)&&(a=a.split("").map(e=>e+e).join("")),6===a.length&&(a+="ff"),[t,i,r,o]=/^[0-9a-f]{8}$/i.test(a)?[parseInt(a.slice(0,2),16)/255,parseInt(a.slice(2,4),16)/255,parseInt(a.slice(4,6),16)/255,parseInt(a.slice(6,8),16)/255]:(console.warn("Invalid hex color"),_)}else if(e.startsWith("rgb")){let a,s=(a=e.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(a[1]??"0")/255,parseInt(a[2]??"0")/255,parseInt(a[3]??"0")/255,void 0===a[4]?1:parseFloat(a[4])]:null;if(null===s)return _;[t,i,r,o]=s}else{let a;if(!e.startsWith("hsl"))return console.error("Unsupported color format",e),_;let s=(a=e.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i))?[parseInt(a[1]??"0"),parseInt(a[2]??"0"),parseInt(a[3]??"0"),void 0===a[4]?1:parseFloat(a[4])]:null;if(null===s)return _;[t,i,r,o]=function(e){let t,i,r,[o,a,s,n]=e,l=o/360,u=a/100,c=s/100;if(0===a)t=i=r=c;else{let e=(e,t,i)=>(i<0&&(i+=1),i>1&&(i-=1),i<1/6)?e+(t-e)*6*i:i<.5?t:i<2/3?e+(t-e)*(2/3-i)*6:e,o=c<.5?c*(1+u):c+u-c*u,a=2*c-o;t=e(a,o,l+1/3),i=e(a,o,l),r=e(a,o,l-1/3)}return[t,i,r,n]}(s)}return[x(t,0,1),x(i,0,1),x(r,0,1),x(o,0,1)]}let x=(e,t,i)=>Math.min(Math.max(e,t),i),_=[.5,.5,.5,1],S={fit:"contain",scale:1,rotation:0,offsetX:0,offsetY:0,originX:.5,originY:.5,worldWidth:0,worldHeight:0},b={none:0,contain:1,cover:2},y={name:"Default",params:{...S,fit:"cover",speed:0,frame:0,colorBack:"#f2f1e8",colorFront:"#2b2b2b",size:.5,radius:1.25,contrast:.4,originalColors:!1,inverted:!1,grainMixer:.2,grainOverlay:.2,grainSize:.5,grid:"hex",type:"gooey"}},R=(0,i.memo)(function({speed:e=y.params.speed,frame:i=y.params.frame,colorFront:r=y.params.colorFront,colorBack:o=y.params.colorBack,image:a="",size:s=y.params.size,radius:n=y.params.radius,contrast:l=y.params.contrast,originalColors:u=y.params.originalColors,inverted:h=y.params.inverted,grainMixer:f=y.params.grainMixer,grainOverlay:p=y.params.grainOverlay,grainSize:x=y.params.grainSize,grid:_=y.params.grid,type:S=y.params.type,fit:R=y.params.fit,scale:w=y.params.scale,rotation:U=y.params.rotation,originX:E=y.params.originX,originY:z=y.params.originY,offsetX:B=y.params.offsetX,offsetY:A=y.params.offsetY,worldWidth:O=y.params.worldWidth,worldHeight:V=y.params.worldHeight,...C}){let T={u_image:a,u_colorFront:v(r),u_colorBack:v(o),u_size:s,u_radius:n,u_contrast:l,u_originalColors:u,u_inverted:h,u_grainMixer:f,u_grainOverlay:p,u_grainSize:x,u_grid:m[_],u_type:d[S],u_fit:b[R],u_rotation:U,u_scale:w,u_offsetX:B,u_offsetY:A,u_originX:E,u_originY:z,u_worldWidth:O,u_worldHeight:V};return(0,t.jsx)(c,{...C,speed:e,frame:i,fragmentShader:g,uniforms:T})},function(e,t){if(Object.keys(e).length!==Object.keys(t).length)return!1;for(let i in e){if("colors"===i){let i=Array.isArray(e.colors),r=Array.isArray(t.colors);if(!i||!r){if(!1===Object.is(e.colors,t.colors))return!1;continue}if(e.colors?.length!==t.colors?.length||!e.colors?.every((e,i)=>e===t.colors?.[i]))return!1;continue}if(!1===Object.is(e[i],t[i]))return!1}return!0});e.s(["HalftonePhoto",0,function({src:e,alt:i,front:r="#1f2a44",back:o="#f1ece1"}){return(0,t.jsx)("div",{role:"img","aria-label":i,className:"absolute inset-0",children:(0,t.jsx)(R,{image:e,fit:"cover",colorFront:r,colorBack:o,size:.32,radius:1.2,contrast:.55,grid:"hex",type:"classic",grainMixer:.25,grainOverlay:.15,grainSize:.5,style:{width:"100%",height:"100%"}})})}],89612)},80648,e=>{"use strict";var t=e.i(43476),i=e.i(71645);e.s(["Mark",0,function({children:r,type:o="underline",color:a="var(--color-red)",strokeWidth:s=2,padding:n=3,delay:l=0,duration:u=700,iterations:c=2,multiline:h=!0,lift:f=0,className:p=""}){let g=(0,i.useRef)(null);return(0,i.useEffect)(()=>{let t,i,r=g.current;if(!r)return;let p=!1,d=a.startsWith("var(")?getComputedStyle(r).getPropertyValue(a.slice(4,-1)).trim()||"#b8321f":a,m=window.matchMedia("(prefers-reduced-motion: reduce)").matches,v=new IntersectionObserver(async([a])=>{if(!a.isIntersecting)return;v.disconnect(),await document.fonts.ready;let{annotate:g}=await e.A(33966);if(p)return;let x=parseFloat(getComputedStyle(r).fontSize),_="number"==typeof n?n:void 0;t=g(r,{type:o,color:d,strokeWidth:s,padding:f&&void 0!==_?[_,_,_-f*x,_]:n,iterations:c,multiline:h,animate:!m,animationDuration:u}),i=setTimeout(()=>t?.show(),m?0:l)},{threshold:.8});return v.observe(r),()=>{p=!0,v.disconnect(),clearTimeout(i),t?.remove()}},[o,a,s,n,l,u,c,h,f]),(0,t.jsx)("span",{ref:g,className:p,children:r})}])}]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerpolicy&&(i.referrerPolicy=o.referrerpolicy),o.crossorigin==="use-credentials"?i.credentials="include":o.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();class xt{constructor(e,n,r={}){this.device=e,this.canvas=n,this.items=new Set,this.depthFormat="depth24plus-stencil8",this._pixelRatio=window.devicePixelRatio,this.presentationSize={width:0,height:0},this.presentationSize.width=this.canvas.clientWidth*this.pixelRatio,this.presentationSize.height=this.canvas.clientHeight*this.pixelRatio,this.canvas.width=this.presentationSize.width,this.canvas.height=this.presentationSize.height,this.ctx=this.canvas.getContext("webgpu"),this.presentationFormat=navigator.gpu.getPreferredCanvasFormat(),console.log(this.presentationFormat),this.ctx.configure(Object.assign({device:this.device,format:this.presentationFormat,usage:GPUTextureUsage.RENDER_ATTACHMENT,alphaMode:"premultiplied"},r));const o=e.createTexture({size:{width:this.width,height:this.height,depthOrArrayLayers:1},format:this.depthFormat,usage:GPUTextureUsage.RENDER_ATTACHMENT});this.renderPassDescriptor={colorAttachments:[{view:this.ctx.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}],depthStencilAttachment:{view:o.createView(),depthClearValue:1,depthLoadOp:"clear",depthStoreOp:"store",stencilLoadOp:"clear",stencilStoreOp:"store"}}}get width(){return this.renderTexture?this.renderTexture.width:this.presentationSize.width}get height(){return this.renderTexture?this.renderTexture.height:this.presentationSize.height}get pixelRatio(){return this._pixelRatio}set pixelRatio(e){this._pixelRatio=e,this.resize()}set renderTexture(e){const n=this.width,r=this.height;if(this._renderTexture=e,e&&(this.renderPassDescriptor.colorAttachments[0].view=this.renderTexture.createView()),this.width!==n||this.height!==r){const o=this.device.createTexture({size:{width:this.width,height:this.height,depthOrArrayLayers:1},format:this.depthFormat,usage:GPUTextureUsage.RENDER_ATTACHMENT});this.renderPassDescriptor.depthStencilAttachment.view=o.createView()}}get renderTexture(){return this._renderTexture}resize(e,n){if(this.renderTexture)return;const r=(e||this.canvas.clientWidth)*this.pixelRatio,o=(n||this.canvas.clientHeight)*this.pixelRatio;if(r===this.width&&o===this.height)return;this.presentationSize.width=r,this.presentationSize.height=o,this.canvas.width=this.presentationSize.width,this.canvas.height=this.presentationSize.height;const i=this.device.createTexture({size:{width:this.width,height:this.height,depthOrArrayLayers:1},format:this.depthFormat,usage:GPUTextureUsage.RENDER_ATTACHMENT});this.renderPassDescriptor.depthStencilAttachment.view=i.createView(),this.renderPassDescriptor.colorAttachments[0].view=this.ctx.getCurrentTexture().createView()}add(e){this.items.add(e)}remove(e){this.items.delete(e)}render(e){this.renderTexture||(this.renderPassDescriptor.colorAttachments[0].view=this.ctx.getCurrentTexture().createView());const n=this.device.createCommandEncoder(),r=n.beginRenderPass(this.renderPassDescriptor);Array.isArray(e)?e.forEach(i=>i.getCommands(r)):e.getCommands(r),r.end();const o=n.finish();this.device.queue.submit([o])}renderAll(){this.renderTexture||(this.renderPassDescriptor.colorAttachments[0].view=this.ctx.getCurrentTexture().createView());const e=this.device.createCommandEncoder(),n=e.beginRenderPass(this.renderPassDescriptor);for(const o of this.items)o.getCommands(n);n.end();const r=e.finish();this.device.queue.submit([r])}}class bt{constructor(e){this.device=e,this.items=new Set}add(e){this.items.add(e)}remove(e){this.items.delete(e)}run(e){const n=this.device.createCommandEncoder(),r=n.beginComputePass();Array.isArray(e)?e.forEach(i=>i.getCommands(r)):e.getCommands(r),r.end();const o=n.finish();this.device.queue.submit([o])}runAll(){const e=this.device.createCommandEncoder(),n=e.beginComputePass();for(const o of this.items)o.getCommands(n);n.end();const r=e.finish();this.device.queue.submit([r])}}class We{get inputs(){return this._inputs}getBindGroupLayouts(){return this.inputsKeys.map(e=>this.inputs[e].bindGroupLayout)}setBindGroups(e){this.inputsKeys.forEach((n,r)=>{this.inputs[n].update&&this.inputs[n].update(),e.setBindGroup(r,this.inputs[n].bindGroup)})}getWgslChunk(){return this.inputsKeys.reduce((e,n)=>`${e} ${this.inputs[n].getWgslChunk(this.inputsKeys.indexOf(n),n)}`,"")}}class vt extends We{constructor(e,n,r,o,i={}){super(),this.renderer=e,this.shader=n,this.geometry=r,this._inputs=o,i=Object.assign({wireframe:!1,depthWrite:!0,depthCompare:"less"},i),this.inputsKeys=Object.keys(this.inputs);const s=e.device.createShaderModule({code:this.shader}),c=this.geometry.getVertexState(s),d=this.getFragmentState(s),u=e.device.createPipelineLayout({bindGroupLayouts:this.getBindGroupLayouts()});this.pipeline=e.device.createRenderPipeline({layout:u,vertex:c,fragment:d,primitive:{topology:i.wireframe?"line-list":"triangle-list"},depthStencil:{format:e.depthFormat,depthWriteEnabled:i.depthWrite,depthCompare:i.depthCompare}})}get inputs(){return this._inputs}getFragmentState(e){return{module:e,entryPoint:"fragment_main",targets:[{format:this.renderer.presentationFormat,blend:{color:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"src-alpha",dstFactor:"one-minus-src-alpha",operation:"add"}}}]}}setBindGroups(e){super.setBindGroups(e)}getCommands(e){e.setPipeline(this.pipeline),this.geometry.setVertexBuffers(e),this.setBindGroups(e),e.drawIndexed(this.geometry.vertexCount,this.geometry.instanceCount,0,0)}}class z extends We{constructor(e,n,r,o,i){super(),this.device=e,this.shader=n,this._inputs=r,this.count=o,this.workgroupSize=i,this.inputsKeys=Object.keys(this.inputs);const s=this.device.createShaderModule({code:this.shader}),c=this.device.createPipelineLayout({bindGroupLayouts:this.getBindGroupLayouts()});this.pipeline=this.device.createComputePipeline({layout:c,compute:{module:s,entryPoint:"main"}})}setBindGroups(e){super.setBindGroups(e)}getCommands(e){e.setPipeline(this.pipeline),this.setBindGroups(e),e.dispatchWorkgroups(Math.ceil(this.count/this.workgroupSize))}}class wt{constructor(e,{indices:n,normal:r,position:o,texcoord:i},s=1){this._instanceCount=s,this._vertexCount=n==null?void 0:n.length,this.positionBuffer=e.device.createBuffer({size:o.length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.positionBuffer.getMappedRange()).set(o),this.positionBuffer.unmap(),this.normalBuffer=e.device.createBuffer({size:r.length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.normalBuffer.getMappedRange()).set(r),this.normalBuffer.unmap(),this.texCoordBuffer=e.device.createBuffer({size:i.length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0}),new Float32Array(this.texCoordBuffer.getMappedRange()).set(i),this.texCoordBuffer.unmap(),this.indicesBuffer=e.device.createBuffer({size:n.length*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0}),new Uint16Array(this.indicesBuffer.getMappedRange()).set(n),this.indicesBuffer.unmap()}get vertexCount(){return this._vertexCount}get instanceCount(){return this._instanceCount}getVertexState(e){return{module:e,entryPoint:"vertex_main",buffers:[{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,stepMode:"vertex",attributes:[{format:"float32x3",offset:0,shaderLocation:0}]},{arrayStride:3*Float32Array.BYTES_PER_ELEMENT,stepMode:"vertex",attributes:[{format:"float32x3",offset:0,shaderLocation:1}]},{arrayStride:2*Float32Array.BYTES_PER_ELEMENT,stepMode:"vertex",attributes:[{format:"float32x2",offset:0,shaderLocation:2}]}]}}setVertexBuffers(e){e.setIndexBuffer(this.indicesBuffer,"uint16"),e.setVertexBuffer(0,this.positionBuffer),e.setVertexBuffer(1,this.normalBuffer),e.setVertexBuffer(2,this.texCoordBuffer)}}class J extends Float32Array{static calculatePadding(e,n){const r=4-e%4;if(r===4)return 0;if(n==null)return r;if(Array.isArray(n))switch(r){case 1:return 1;case 2:{if(n.length>2)return 2;break}case 3:return n.length===2?1:3}return 0}constructor(e,n=1){const r=[],o={};let i=0,s=e,c;typeof s!="function"&&(c=[...Object.entries(s)]);for(let d=0;d<n;d++){typeof s=="function"&&(c=[...Object.entries(s(d))]);for(let u=0;u<c.length;u++){const a=c[u],m=a[0];let f=a[1],h=r.length;f=f instanceof Function?f():f,f=f instanceof Float32Array?Array.from(f):f,o[m]={index:h,length:Array.isArray(f)?f.length:1,isArray:Array.isArray(f)},Array.isArray(f)?r.push(...f):r.push(f);let p=c[u+1]?c[u+1][1]:null;p&&(p=p instanceof Function?p():p,p=p instanceof Float32Array?Array.from(p):p);const l=J.calculatePadding(r.length,p);for(let _=0;_<l;_++)r.push(0)}d===0&&(i=r.length)}super(r),this.count=n,this.metadata={},this.stride=0,this.metadata=o,this.stride=i}getValueAt(e,n=0){const{index:r,length:o}=this.metadata[e];return o>1?Array.from(this.slice(r+n*this.stride,o)):this[r+n*this.stride]}setValueAt(e,n,r=0){const{index:o}=this.metadata[e];n instanceof Float32Array&&(n=Array.from(n)),Array.isArray(n)?this.set(n,o+r*this.stride):this.set([n],o+r*this.stride)}getWgslChunk(e="MyStruct"){const n=Object.entries(this.metadata);return`
    struct ${e} {
        ${n.reduce((r,[o,i])=>{const s=i.isArray?`vec${i.length}<f32>`:"f32";return r===""?`${o} : ${s},`:`${r}
        ${o} : ${s},`},"")}
    }`}}class At{constructor(e,n){this.device=e,this.bufferMembers=[],this.textures=[],this.bufferNeedsUpdate=!0,this.autoUpdate=!0;for(let o in n){const i=n[o];i instanceof GPUTexture?this.textures.push({key:o,value:i}):this.bufferMembers.push({key:o,value:i})}this.createArraysAndBuffers(),this.createBindGroup();const r={get:(o,i)=>this.proxyGetHandler(o,i),set:(o,i,s)=>this.proxySetHandler(o,i,s)};this._member=new Proxy({},r)}createArraysAndBuffers(){const e=this.bufferMembers.reduce((n,r)=>(n[r.key]=r.value,n),{});this.uniformsArray=new J(e),this.uniformsBuffer=this.device.createBuffer({size:this.uniformsArray.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),this.update()}createBindGroup(){const e=[];this.bufferMembers.length&&e.push({binding:e.length,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,buffer:{type:"uniform"}}),this.textures.forEach(({value:r})=>{e.push({binding:e.length,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,sampler:{type:"filtering"}}),e.push({binding:e.length,visibility:GPUShaderStage.VERTEX|GPUShaderStage.FRAGMENT|GPUShaderStage.COMPUTE,texture:{sampleType:"float",multisampled:!1,viewDimension:r.dimension}})}),this._bindGroupLayout=this.device.createBindGroupLayout({entries:e});const n=[];this.bufferMembers.length&&n.push({binding:0,resource:{buffer:this.uniformsBuffer}}),this.textures.forEach(({value:r})=>{n.push({binding:n.length,resource:this.device.createSampler({magFilter:"linear",minFilter:"linear"})}),n.push({binding:n.length,resource:r.createView({dimension:r.dimension})})}),this._bindGroup=this.device.createBindGroup({layout:this.bindGroupLayout,entries:n})}proxyGetHandler(e,n){const r=this.textures.find(({key:o})=>o===n);return r?r.value:this.uniformsArray.getValueAt(n)}proxySetHandler(e,n,r){if(r instanceof GPUTexture){const o=this.textures.find(({key:i})=>i===n);o.value=r,this.createBindGroup()}else this.uniformsArray.setValueAt(n,r),this.bufferNeedsUpdate=!0;return this.autoUpdate&&this.update(),!0}get member(){return this._member}get bindGroupLayout(){return this._bindGroupLayout}get bindGroup(){return this._bindGroup}getWgslChunk(e="[REPLACE_WITH_GROUP_INDEX]",n=""){const r=`Uniforms${n.charAt(0).toUpperCase()+n.slice(1)}`;return`
    struct ${r} {
        ${this.bufferMembers.reduce((o,{key:i,value:s})=>{const c=Array.isArray(s)?`vec${s.length}<f32>`:"f32";return o===""?`${i} : ${c},`:`${o}
        ${i} : ${c},`},"")}
    }

    @group(${e}) @binding(0) var<uniform> uniforms${n?"_":""}${n} : ${r};
    `}update(){this.bufferNeedsUpdate&&(this.device.queue.writeBuffer(this.uniformsBuffer,0,this.uniformsArray),this.bufferNeedsUpdate=!1)}}globalThis&&globalThis.__awaiter;var Bt=globalThis&&globalThis.__awaiter||function(t,e,n,r){function o(i){return i instanceof n?i:new n(function(s){s(i)})}return new(n||(n=Promise))(function(i,s){function c(a){try{u(r.next(a))}catch(m){s(m)}}function d(a){try{u(r.throw(a))}catch(m){s(m)}}function u(a){a.done?i(a.value):o(a.value).then(c,d)}u((r=r.apply(t,e||[])).next())})};class Et{constructor(e,n){this.device=e,this.data=n,this.bindGroupSwapIndex=0,this.isReadingStagingBuffer=!1;const r=n.byteLength;this.bufferA=this.device.createBuffer({size:r,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0}),new Float32Array(this.bufferA.getMappedRange()).set([...n]),this.bufferA.unmap(),this.bufferB=this.device.createBuffer({size:r,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0}),new Float32Array(this.bufferB.getMappedRange()).set([...n]),this.bufferB.unmap(),this.stagingBuffer=this.device.createBuffer({size:r,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this._bindGroupLayout=this.device.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.COMPUTE|GPUShaderStage.FRAGMENT|GPUShaderStage.VERTEX,buffer:{type:"read-only-storage"}},{binding:1,visibility:GPUShaderStage.COMPUTE,buffer:{type:"storage"}}]}),this.bindGroupA=this.device.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:{buffer:this.bufferA}},{binding:1,resource:{buffer:this.bufferB}}]}),this.bindGroupB=this.device.createBindGroup({layout:this.bindGroupLayout,entries:[{binding:0,resource:{buffer:this.bufferB}},{binding:1,resource:{buffer:this.bufferA}}]})}get length(){return this.data.length}get byteLength(){return this.data.byteLength}get bindGroupLayout(){return this._bindGroupLayout}get bindGroup(){return this.bindGroupSwapIndex%2===0?this.bindGroupA:this.bindGroupB}get buffer(){return this.bindGroupSwapIndex%2===0?this.bufferA:this.bufferB}get backBuffer(){return this.bindGroupSwapIndex%2===1?this.bufferA:this.bufferB}step(){this.bindGroupSwapIndex++}getWgslChunk(e="[REPLACE_WITH_GROUP_INDEX]",n=""){if(this.data instanceof J){const r=`PingPong${n.charAt(0).toUpperCase()+n.slice(1)}`;return`
      ${this.data.getWgslChunk(r)}
  
      @group(${e}) @binding(0) var<storage, read> input${n?"_":""}${n} : array<${r}>;
      @group(${e}) @binding(1) var<storage, read_write> output${n?"_":""}${n} : array<${r}>;
      `}else return`
      @group(${e}) @binding(0) var<storage, read> input${n?"_":""}${n} : array<[REPLACE_WITH_TYPE]>;
      @group(${e}) @binding(1) var<storage, read_write> output${n?"_":""}${n} : array<[REPLACE_WITH_TYPE]>;
      `}read(){return Bt(this,void 0,void 0,function*(){if(this.isReadingStagingBuffer)return null;this.isReadingStagingBuffer=!0;const e=this.device.createCommandEncoder();e.copyBufferToBuffer(this.buffer,0,this.stagingBuffer,0,this.stagingBuffer.size),this.device.queue.submit([e.finish()]),yield this.stagingBuffer.mapAsync(GPUMapMode.READ,0,this.stagingBuffer.size);const r=this.stagingBuffer.getMappedRange(0,this.stagingBuffer.size).slice(0);return this.stagingBuffer.unmap(),this.isReadingStagingBuffer=!1,new Float32Array(r)})}}class Tt{constructor(){this.then=Date.now(),this.delta=16.666,this.correction=1,this.elapsedTime=0,this.reset=this.reset.bind(this),window.addEventListener("blur",this.reset),window.addEventListener("focus",this.reset)}reset(){this.then=Date.now(),this.elapsedTime=0,this.correction=1,this.delta=16.66}tick(){const e=Date.now();return typeof this.then=="number"&&(this.delta=Math.min(e-this.then,16.666*5)),this.elapsedTime+=this.delta,this.then=e,this.correction=this.delta/16.666,{delta:this.delta,correction:this.correction,elapsedTime:this.elapsedTime}}}globalThis&&globalThis.__awaiter;var Ct=globalThis&&globalThis.__awaiter||function(t,e,n,r){function o(i){return i instanceof n?i:new n(function(s){s(i)})}return new(n||(n=Promise))(function(i,s){function c(a){try{u(r.next(a))}catch(m){s(m)}}function d(a){try{u(r.throw(a))}catch(m){s(m)}}function u(a){a.done?i(a.value):o(a.value).then(c,d)}u((r=r.apply(t,e||[])).next())})};const St=()=>Ct(void 0,void 0,void 0,function*(){if(!navigator.gpu){const e="WebGPU not available! — Use Chrome Canary and enable-unsafe-gpu in flags.";return console.error(e),alert(e),!1}const t=yield navigator.gpu.requestAdapter();return t?yield t.requestDevice():(console.warn("Could not access Adapter"),!1)}),Pt={requestWebGPU:St};/* @license twgl.js 5.3.0 Copyright (c) 2015, Gregg Tavares All Rights Reserved.
Available via the MIT license.
see: http://github.com/greggman/twgl.js for details */let pe=Float32Array;function me(t,e,n){const r=new pe(3);return t&&(r[0]=t),e&&(r[1]=e),n&&(r[2]=n),r}function Ut(t,e,n){return n=n||new pe(3),n[0]=t[0]+e[0],n[1]=t[1]+e[1],n[2]=t[2]+e[2],n}function Gt(t,e,n){return n=n||new pe(3),n[0]=t[0]*e[0],n[1]=t[1]*e[1],n[2]=t[2]*e[2],n}let Xe=Float32Array;function Ft(t){return t=t||new Xe(16),t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}function $t(t,e){e=e||new Xe(16);const n=t[0*4+0],r=t[0*4+1],o=t[0*4+2],i=t[0*4+3],s=t[1*4+0],c=t[1*4+1],d=t[1*4+2],u=t[1*4+3],a=t[2*4+0],m=t[2*4+1],f=t[2*4+2],h=t[2*4+3],p=t[3*4+0],l=t[3*4+1],_=t[3*4+2],x=t[3*4+3],b=f*x,w=_*h,A=d*x,g=_*u,v=d*h,T=f*u,B=o*x,E=_*i,S=o*h,P=f*i,V=o*u,U=d*i,D=a*l,Y=p*m,j=s*l,H=p*c,W=s*m,X=a*c,te=n*l,ne=p*r,re=n*m,oe=a*r,ie=n*c,se=s*r,Re=b*c+g*m+v*l-(w*c+A*m+T*l),Le=w*r+B*m+P*l-(b*r+E*m+S*l),De=A*r+E*c+V*l-(g*r+B*c+U*l),ze=T*r+S*c+U*m-(v*r+P*c+V*m),C=1/(n*Re+s*Le+a*De+p*ze);return e[0]=C*Re,e[1]=C*Le,e[2]=C*De,e[3]=C*ze,e[4]=C*(w*s+A*a+T*p-(b*s+g*a+v*p)),e[5]=C*(b*n+E*a+S*p-(w*n+B*a+P*p)),e[6]=C*(g*n+B*s+U*p-(A*n+E*s+V*p)),e[7]=C*(v*n+P*s+V*a-(T*n+S*s+U*a)),e[8]=C*(D*u+H*h+W*x-(Y*u+j*h+X*x)),e[9]=C*(Y*i+te*h+oe*x-(D*i+ne*h+re*x)),e[10]=C*(j*i+ne*u+ie*x-(H*i+te*u+se*x)),e[11]=C*(X*i+re*u+se*h-(W*i+oe*u+ie*h)),e[12]=C*(j*f+X*_+Y*d-(W*_+D*d+H*f)),e[13]=C*(re*_+D*o+ne*f-(te*f+oe*_+Y*o)),e[14]=C*(te*d+se*_+H*o-(ie*_+j*o+ne*d)),e[15]=C*(ie*f+W*o+oe*d-(re*d+se*f+X*o)),e}function Mt(t,e,n){n=n||me();const r=e[0],o=e[1],i=e[2],s=r*t[0*4+3]+o*t[1*4+3]+i*t[2*4+3]+t[3*4+3];return n[0]=(r*t[0*4+0]+o*t[1*4+0]+i*t[2*4+0]+t[3*4+0])/s,n[1]=(r*t[0*4+1]+o*t[1*4+1]+i*t[2*4+1]+t[3*4+1])/s,n[2]=(r*t[0*4+2]+o*t[1*4+2]+i*t[2*4+2]+t[3*4+2])/s,n}function Vt(t,e,n){n=n||me();const r=e[0],o=e[1],i=e[2];return n[0]=r*t[0*4+0]+o*t[1*4+0]+i*t[2*4+0],n[1]=r*t[0*4+1]+o*t[1*4+1]+i*t[2*4+1],n[2]=r*t[0*4+2]+o*t[1*4+2]+i*t[2*4+2],n}const _e=5120,Z=5121,ge=5122,ye=5123,xe=5124,be=5125,ve=5126,Nt=32819,It=32820,Rt=33635,Lt=5131,Dt=33640,zt=35899,Ot=35902,kt=36269,Yt=34042,qe={};{const t=qe;t[_e]=Int8Array,t[Z]=Uint8Array,t[ge]=Int16Array,t[ye]=Uint16Array,t[xe]=Int32Array,t[be]=Uint32Array,t[ve]=Float32Array,t[Nt]=Uint16Array,t[It]=Uint16Array,t[Rt]=Uint16Array,t[Lt]=Uint16Array,t[Dt]=Uint32Array,t[zt]=Uint32Array,t[Ot]=Uint32Array,t[kt]=Uint32Array,t[Yt]=Uint32Array}function we(t){if(t instanceof Int8Array)return _e;if(t instanceof Uint8Array||t instanceof Uint8ClampedArray)return Z;if(t instanceof Int16Array)return ge;if(t instanceof Uint16Array)return ye;if(t instanceof Int32Array)return xe;if(t instanceof Uint32Array)return be;if(t instanceof Float32Array)return ve;throw new Error("unsupported typed array type")}function Ke(t){if(t===Int8Array)return _e;if(t===Uint8Array||t===Uint8ClampedArray)return Z;if(t===Int16Array)return ge;if(t===Uint16Array)return ye;if(t===Int32Array)return xe;if(t===Uint32Array)return be;if(t===Float32Array)return ve;throw new Error("unsupported typed array type")}function jt(t){const e=qe[t];if(!e)throw new Error("unknown gl type");return e}const ue=typeof SharedArrayBuffer<"u"?function(e){return e&&e.buffer&&(e.buffer instanceof ArrayBuffer||e.buffer instanceof SharedArrayBuffer)}:function(e){return e&&e.buffer&&e.buffer instanceof ArrayBuffer};function Ht(t,e,n){t.forEach(function(r){const o=e[r];o!==void 0&&(n[r]=o)})}const Oe=new Map;function Wt(t,e){if(!t||typeof t!="object")return!1;let n=Oe.get(e);n||(n=new WeakMap,Oe.set(e,n));let r=n.get(t);if(r===void 0){const o=Object.prototype.toString.call(t);r=o.substring(8,o.length-1)===e,n.set(t,r)}return r}function Xt(t,e){return typeof WebGLBuffer<"u"&&Wt(e,"WebGLBuffer")}const Qe=35044,L=34962,Ze=34963,qt=34660,Kt=5120,Qt=5121,Zt=5122,Jt=5123,en=5124,tn=5125,Je=5126,et={attribPrefix:""};function nn(t,e,n,r,o){t.bindBuffer(e,n),t.bufferData(e,r,o||Qe)}function Ae(t,e,n,r){if(Xt(t,e))return e;n=n||L;const o=t.createBuffer();return nn(t,n,o,e,r),o}function tt(t){return t==="indices"}function rn(t){return t===Int8Array||t===Uint8Array}function Be(t){return t.length?t:t.data}const on=/coord|texture/i,sn=/color|colour/i;function cn(t,e){let n;if(on.test(t)?n=2:sn.test(t)?n=4:n=3,e%n>0)throw new Error(`Can not guess numComponents for attribute '${t}'. Tried ${n} but ${e} values is not evenly divisible by ${n}. You should specify it.`);return n}function Ee(t,e,n){return t.numComponents||t.size||cn(e,n||Be(t).length)}function ae(t,e){if(ue(t))return t;if(ue(t.data))return t.data;Array.isArray(t)&&(t={data:t});let n=t.type?Te(t.type):void 0;return n||(tt(e)?n=Uint16Array:n=Float32Array),new n(t.data)}function un(t){return typeof t=="number"?t:t?Ke(t):Je}function Te(t){return typeof t=="number"?jt(t):t||Float32Array}function an(t,e){return{buffer:e.buffer,numValues:2*3*4,type:un(e.type),arrayType:Te(e.type)}}function fn(t,e){const n=e.data||e,r=Te(e.type),o=n*r.BYTES_PER_ELEMENT,i=t.createBuffer();return t.bindBuffer(L,i),t.bufferData(L,o,e.drawType||Qe),{buffer:i,numValues:n,type:Ke(r),arrayType:r}}function ln(t,e,n){const r=ae(e,n);return{arrayType:r.constructor,buffer:Ae(t,r,void 0,e.drawType),type:we(r),numValues:0}}function dn(t,e){const n={};return Object.keys(e).forEach(function(r){if(!tt(r)){const o=e[r],i=o.attrib||o.name||o.attribName||et.attribPrefix+r;if(o.value){if(!Array.isArray(o.value)&&!ue(o.value))throw new Error("array.value is not array or typedarray");n[i]={value:o.value}}else{let s;o.buffer&&o.buffer instanceof WebGLBuffer?s=an:typeof o=="number"||typeof o.data=="number"?s=fn:s=ln;const{buffer:c,type:d,numValues:u,arrayType:a}=s(t,o,r),m=o.normalize!==void 0?o.normalize:rn(a),f=Ee(o,r,u);n[i]={buffer:c,numComponents:f,type:d,normalize:m,stride:o.stride||0,offset:o.offset||0,divisor:o.divisor===void 0?void 0:o.divisor,drawType:o.drawType}}}}),t.bindBuffer(L,null),n}function hn(t,e){return e===Kt||e===Qt?1:e===Zt||e===Jt?2:e===en||e===tn||e===Je?4:0}const q=["position","positions","a_position"];function pn(t){let e,n;for(n=0;n<q.length&&(e=q[n],!(e in t));++n);n===q.length&&(e=Object.keys(t)[0]);const r=t[e],o=Be(r).length;if(o===void 0)return 1;const i=Ee(r,e),s=o/i;if(o%i>0)throw new Error(`numComponents ${i} not correct for length ${o}`);return s}function mn(t,e){let n,r;for(r=0;r<q.length&&(n=q[r],!(n in e||(n=et.attribPrefix+n,n in e)));++r);r===q.length&&(n=Object.keys(e)[0]);const o=e[n];if(!o.buffer)return 1;t.bindBuffer(L,o.buffer);const i=t.getBufferParameter(L,qt);t.bindBuffer(L,null);const s=hn(t,o.type),c=i/s,d=o.numComponents||o.size,u=c/d;if(u%1!==0)throw new Error(`numComponents ${d} not correct for length ${length}`);return u}function _n(t,e,n){const r=dn(t,e),o=Object.assign({},n||{});o.attribs=Object.assign({},n?n.attribs:{},r);const i=e.indices;if(i){const s=ae(i,"indices");o.indices=Ae(t,s,Ze),o.numElements=s.length,o.elementType=we(s)}else o.numElements||(o.numElements=mn(t,o.attribs));return o}function gn(t,e,n){const r=n==="indices"?Ze:L,o=ae(e,n);return Ae(t,o,r)}function yn(t,e){const n={};return Object.keys(e).forEach(function(r){n[r]=gn(t,e[r],r)}),e.indices?(n.numElements=e.indices.length,n.elementType=we(ae(e.indices))):n.numElements=pn(e),n}const k=Be,xn=Ee;function nt(t,e){let n=0;return t.push=function(){for(let r=0;r<arguments.length;++r){const o=arguments[r];if(o instanceof Array||ue(o))for(let i=0;i<o.length;++i)t[n++]=o[i];else t[n++]=o}},t.reset=function(r){n=r||0},t.numComponents=e,Object.defineProperty(t,"numElements",{get:function(){return this.length/this.numComponents|0}}),t}function y(t,e,n){const r=n||Float32Array;return nt(new r(t*e),t)}function bn(t){return t!=="indices"}function vn(t){const e=t.indices,n={},r=e.length;function o(i){const s=t[i],c=s.numComponents,d=y(c,r,s.constructor);for(let u=0;u<r;++u){const m=e[u]*c;for(let f=0;f<c;++f)d.push(s[m+f])}n[i]=d}return Object.keys(t).filter(bn).forEach(o),n}function wn(t){if(t.indices)throw new Error("can not flatten normals of indexed vertices. deindex them first");const e=t.normal,n=e.length;for(let r=0;r<n;r+=9){const o=e[r+0],i=e[r+1],s=e[r+2],c=e[r+3],d=e[r+4],u=e[r+5],a=e[r+6],m=e[r+7],f=e[r+8];let h=o+c+a,p=i+d+m,l=s+u+f;const _=Math.sqrt(h*h+p*p+l*l);h/=_,p/=_,l/=_,e[r+0]=h,e[r+1]=p,e[r+2]=l,e[r+3]=h,e[r+4]=p,e[r+5]=l,e[r+6]=h,e[r+7]=p,e[r+8]=l}return t}function Ce(t,e,n){const r=t.length,o=new Float32Array(3);for(let i=0;i<r;i+=3)n(e,[t[i],t[i+1],t[i+2]],o),t[i]=o[0],t[i+1]=o[1],t[i+2]=o[2]}function An(t,e,n){n=n||me();const r=e[0],o=e[1],i=e[2];return n[0]=r*t[0*4+0]+o*t[0*4+1]+i*t[0*4+2],n[1]=r*t[1*4+0]+o*t[1*4+1]+i*t[1*4+2],n[2]=r*t[2*4+0]+o*t[2*4+1]+i*t[2*4+2],n}function rt(t,e){return Ce(t,e,Vt),t}function ot(t,e){return Ce(t,$t(e),An),t}function it(t,e){return Ce(t,e,Mt),t}function st(t,e){return Object.keys(t).forEach(function(n){const r=t[n];n.indexOf("pos")>=0?it(r,e):n.indexOf("tan")>=0||n.indexOf("binorm")>=0?rt(r,e):n.indexOf("norm")>=0&&ot(r,e)}),t}function Se(t,e,n){return t=t||2,e=e||0,n=n||0,t*=.5,{position:{numComponents:2,data:[e+-1*t,n+-1*t,e+1*t,n+-1*t,e+-1*t,n+1*t,e+1*t,n+1*t]},normal:[0,0,1,0,0,1,0,0,1,0,0,1],texcoord:[0,0,1,0,0,1,1,1],indices:[0,1,2,2,1,3]}}function Pe(t,e,n,r,o){t=t||1,e=e||1,n=n||1,r=r||1,o=o||Ft();const i=(n+1)*(r+1),s=y(3,i),c=y(3,i),d=y(2,i);for(let f=0;f<=r;f++)for(let h=0;h<=n;h++){const p=h/n,l=f/r;s.push(t*p-t*.5,0,e*l-e*.5),c.push(0,1,0),d.push(p,l)}const u=n+1,a=y(3,n*r*2,Uint16Array);for(let f=0;f<r;f++)for(let h=0;h<n;h++)a.push((f+0)*u+h,(f+1)*u+h,(f+0)*u+h+1),a.push((f+1)*u+h,(f+1)*u+h+1,(f+0)*u+h+1);return st({position:s,normal:c,texcoord:d,indices:a},o)}function Ue(t,e,n,r,o,i,s){if(e<=0||n<=0)throw new Error("subdivisionAxis and subdivisionHeight must be > 0");r=r||0,o=o||Math.PI,i=i||0,s=s||Math.PI*2;const c=o-r,d=s-i,u=(e+1)*(n+1),a=y(3,u),m=y(3,u),f=y(2,u);for(let l=0;l<=n;l++)for(let _=0;_<=e;_++){const x=_/e,b=l/n,w=d*x+i,A=c*b+r,g=Math.sin(w),v=Math.cos(w),T=Math.sin(A),B=Math.cos(A),E=v*T,S=B,P=g*T;a.push(t*E,t*S,t*P),m.push(E,S,P),f.push(1-x,b)}const h=e+1,p=y(3,e*n*2,Uint16Array);for(let l=0;l<e;l++)for(let _=0;_<n;_++)p.push((_+0)*h+l,(_+0)*h+l+1,(_+1)*h+l),p.push((_+1)*h+l,(_+0)*h+l+1,(_+1)*h+l+1);return{position:a,normal:m,texcoord:f,indices:p}}const Bn=[[3,7,5,1],[6,2,0,4],[6,7,3,2],[0,1,5,4],[7,6,4,5],[2,3,1,0]];function Ge(t){t=t||1;const e=t/2,n=[[-e,-e,-e],[+e,-e,-e],[-e,+e,-e],[+e,+e,-e],[-e,-e,+e],[+e,-e,+e],[-e,+e,+e],[+e,+e,+e]],r=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],o=[[1,0],[0,0],[0,1],[1,1]],i=6*4,s=y(3,i),c=y(3,i),d=y(2,i),u=y(3,6*2,Uint16Array);for(let a=0;a<6;++a){const m=Bn[a];for(let h=0;h<4;++h){const p=n[m[h]],l=r[a],_=o[h];s.push(p),c.push(l),d.push(_)}const f=4*a;u.push(f+0,f+1,f+2),u.push(f+0,f+2,f+3)}return{position:s,normal:c,texcoord:d,indices:u}}function fe(t,e,n,r,o,i,s){if(r<3)throw new Error("radialSubdivisions must be 3 or greater");if(o<1)throw new Error("verticalSubdivisions must be 1 or greater");const c=i===void 0?!0:i,d=s===void 0?!0:s,u=(c?2:0)+(d?2:0),a=(r+1)*(o+1+u),m=y(3,a),f=y(3,a),h=y(2,a),p=y(3,r*(o+u/2)*2,Uint16Array),l=r+1,_=Math.atan2(t-e,n),x=Math.cos(_),b=Math.sin(_),w=c?-2:0,A=o+(d?2:0);for(let g=w;g<=A;++g){let v=g/o,T=n*v,B;g<0?(T=0,v=1,B=t):g>o?(T=n,v=1,B=e):B=t+(e-t)*(g/o),(g===-2||g===o+2)&&(B=0,v=0),T-=n/2;for(let E=0;E<l;++E){const S=Math.sin(E*Math.PI*2/r),P=Math.cos(E*Math.PI*2/r);m.push(S*B,T,P*B),g<0?f.push(0,-1,0):g>o?f.push(0,1,0):B===0?f.push(0,0,0):f.push(S*x,b,P*x),h.push(E/r,1-v)}}for(let g=0;g<o+u;++g)if(!(g===1&&c||g===o+u-2&&d))for(let v=0;v<r;++v)p.push(l*(g+0)+0+v,l*(g+0)+1+v,l*(g+1)+1+v),p.push(l*(g+0)+0+v,l*(g+1)+1+v,l*(g+1)+0+v);return{position:m,normal:f,texcoord:h,indices:p}}function ke(t,e){e=e||[];const n=[];for(let r=0;r<t.length;r+=4){const o=t[r],i=t.slice(r+1,r+4);i.push.apply(i,e);for(let s=0;s<o;++s)n.push.apply(n,i)}return n}function Fe(){const t=[0,0,0,0,150,0,30,0,0,0,150,0,30,150,0,30,0,0,30,0,0,30,30,0,100,0,0,30,30,0,100,30,0,100,0,0,30,60,0,30,90,0,67,60,0,30,90,0,67,90,0,67,60,0,0,0,30,30,0,30,0,150,30,0,150,30,30,0,30,30,150,30,30,0,30,100,0,30,30,30,30,30,30,30,100,0,30,100,30,30,30,60,30,67,60,30,30,90,30,30,90,30,67,60,30,67,90,30,0,0,0,100,0,0,100,0,30,0,0,0,100,0,30,0,0,30,100,0,0,100,30,0,100,30,30,100,0,0,100,30,30,100,0,30,30,30,0,30,30,30,100,30,30,30,30,0,100,30,30,100,30,0,30,30,0,30,60,30,30,30,30,30,30,0,30,60,0,30,60,30,30,60,0,67,60,30,30,60,30,30,60,0,67,60,0,67,60,30,67,60,0,67,90,30,67,60,30,67,60,0,67,90,0,67,90,30,30,90,0,30,90,30,67,90,30,30,90,0,67,90,30,67,90,0,30,90,0,30,150,30,30,90,30,30,90,0,30,150,0,30,150,30,0,150,0,0,150,30,30,150,30,0,150,0,30,150,30,30,150,0,0,0,0,0,0,30,0,150,30,0,0,0,0,150,30,0,150,0],e=[.22,.19,.22,.79,.34,.19,.22,.79,.34,.79,.34,.19,.34,.19,.34,.31,.62,.19,.34,.31,.62,.31,.62,.19,.34,.43,.34,.55,.49,.43,.34,.55,.49,.55,.49,.43,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,1,1,0,1,0,0,1,0,1,1,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0,1,1,1,0,0,1,1,1,0],n=ke([18,0,0,1,18,0,0,-1,6,0,1,0,6,1,0,0,6,0,-1,0,6,1,0,0,6,0,1,0,6,1,0,0,6,0,-1,0,6,1,0,0,6,0,-1,0,6,-1,0,0]),r=ke([18,200,70,120,18,80,70,200,6,70,200,210,6,200,200,70,6,210,100,70,6,210,160,70,6,70,180,210,6,100,70,210,6,76,210,100,6,140,210,80,6,90,130,110,6,160,160,220],[255]),o=t.length/3,i={position:y(3,o),texcoord:y(2,o),normal:y(3,o),color:y(4,o,Uint8Array),indices:y(3,o/3,Uint16Array)};i.position.push(t),i.texcoord.push(e),i.normal.push(n),i.color.push(r);for(let s=0;s<o;++s)i.indices.push(s);return i}function le(t,e,n,r,o,i,s){if(o<=0)throw new Error("subdivisionDown must be > 0");i=i||0,s=s||1;const c=2,d=s-i,u=(o+1)*2*(2+c),a=y(3,u),m=y(3,u),f=y(2,u);function h(b,w,A){return b+(w-b)*A}function p(b,w,A,g,v,T){for(let B=0;B<=o;B++){const E=w/(c-1),S=B/o,P=(E-.5)*2,V=(i+S*d)*Math.PI,U=Math.sin(V),D=Math.cos(V),Y=h(t,b,U),j=P*r,H=D*t,W=U*Y;a.push(j,H,W);const X=Ut(Gt([0,U,D],A),g);m.push(X),f.push(E*v+T,S)}}for(let b=0;b<c;b++){const w=(b/(c-1)-.5)*2;p(e,b,[1,1,1],[0,0,0],1,0),p(e,b,[0,0,0],[w,0,0],0,0),p(n,b,[1,1,1],[0,0,0],1,0),p(n,b,[0,0,0],[w,0,0],0,1)}const l=y(3,o*2*(2+c),Uint16Array);function _(b,w){for(let A=0;A<o;++A)l.push(b+A+0,b+A+1,w+A+0),l.push(b+A+1,w+A+1,w+A+0)}const x=o+1;return _(x*0,x*4),_(x*5,x*7),_(x*6,x*2),_(x*3,x*1),{position:a,normal:m,texcoord:f,indices:l}}function $e(t,e,n,r,o,i){return fe(t,t,e,n,r,o,i)}function Me(t,e,n,r,o,i){if(n<3)throw new Error("radialSubdivisions must be 3 or greater");if(r<3)throw new Error("verticalSubdivisions must be 3 or greater");o=o||0,i=i||Math.PI*2;const s=i-o,c=n+1,d=r+1,u=c*d,a=y(3,u),m=y(3,u),f=y(2,u),h=y(3,n*r*2,Uint16Array);for(let p=0;p<d;++p){const l=p/r,_=l*Math.PI*2,x=Math.sin(_),b=t+x*e,w=Math.cos(_),A=w*e;for(let g=0;g<c;++g){const v=g/n,T=o+v*s,B=Math.sin(T),E=Math.cos(T),S=B*b,P=E*b,V=B*x,U=E*x;a.push(S,A,P),m.push(V,w,U),f.push(v,1-l)}}for(let p=0;p<r;++p)for(let l=0;l<n;++l){const _=1+l,x=1+p;h.push(c*p+l,c*x+l,c*p+_),h.push(c*x+l,c*x+_,c*p+_)}return{position:a,normal:m,texcoord:f,indices:h}}function Ve(t,e,n,r,o){if(e<3)throw new Error("divisions must be at least 3");n=n||1,o=o||1,r=r||0;const i=(e+1)*(n+1),s=y(3,i),c=y(3,i),d=y(2,i),u=y(3,n*e*2,Uint16Array);let a=0;const m=t-r,f=e+1;for(let h=0;h<=n;++h){const p=r+m*Math.pow(h/n,o);for(let l=0;l<=e;++l){const _=2*Math.PI*l/e,x=p*Math.cos(_),b=p*Math.sin(_);if(s.push(x,0,b),c.push(0,1,0),d.push(1-l/e,h/n),h>0&&l!==e){const w=a+(l+1),A=a+l,g=a+l-f,v=a+(l+1)-f;u.push(w,A,g),u.push(w,g,v)}}a+=e+1}return{position:s,normal:c,texcoord:d,indices:u}}function En(t){return Math.random()*t|0}function Tn(t,e){e=e||{};const n=t.position.numElements,r=y(4,n,Uint8Array),o=e.rand||function(i,s){return s<3?En(256):255};if(t.color=r,t.indices)for(let i=0;i<n;++i)r.push(o(i,0),o(i,1),o(i,2),o(i,3));else{const i=e.vertsPerColor||3,s=n/i;for(let c=0;c<s;++c){const d=[o(c,0),o(c,1),o(c,2),o(c,3)];for(let u=0;u<i;++u)r.push(d)}}return t}function $(t){return function(e){const n=t.apply(this,Array.prototype.slice.call(arguments,1));return yn(e,n)}}function M(t){return function(e){const n=t.apply(null,Array.prototype.slice.call(arguments,1));return _n(e,n)}}const Cn=["numComponents","size","type","normalize","stride","offset","attrib","name","attribName"];function de(t,e,n,r){r=r||0;const o=t.length;for(let i=0;i<o;++i)e[n+i]=t[i]+r}function ct(t,e){const n=k(t),r=new n.constructor(e);let o=r;return n.numComponents&&n.numElements&&nt(r,n.numComponents),t.data&&(o={data:r},Ht(Cn,t,o)),o}function Sn(t){const e={};let n;for(let c=0;c<t.length;++c){const d=t[c];Object.keys(d).forEach(function(u){e[u]||(e[u]=[]),!n&&u!=="indices"&&(n=u);const a=d[u],m=xn(a,u),h=k(a).length/m;e[u].push(h)})}function r(c){let d=0,u;for(let a=0;a<t.length;++a){const f=t[a][c],h=k(f);d+=h.length,(!u||f.data)&&(u=f)}return{length:d,spec:u}}function o(c,d,u){let a=0,m=0;for(let f=0;f<t.length;++f){const p=t[f][c],l=k(p);c==="indices"?(de(l,u,m,a),a+=d[f]):de(l,u,m),m+=l.length}}const i=e[n],s={};return Object.keys(e).forEach(function(c){const d=r(c),u=ct(d.spec,d.length);o(c,i,k(u)),s[c]=u}),s}function Pn(t){const e={};return Object.keys(t).forEach(function(n){const r=t[n],o=k(r),i=ct(r,o.length);de(o,k(i),0),e[n]=i}),e}const Un=M(Fe),Gn=$(Fe),Fn=M(Ge),$n=$(Ge),Mn=M(Pe),Vn=$(Pe),Nn=M(Ue),In=$(Ue),Rn=M(fe),Ln=$(fe),Dn=M(Se),zn=$(Se),ut=M(le),at=$(le),On=M($e),kn=$($e),Yn=M(Me),jn=$(Me),Hn=M(Ve),Wn=$(Ve),Xn=ut,qn=at,Kn=le;var Qn=Object.freeze({__proto__:null,create3DFBufferInfo:Un,create3DFBuffers:Gn,create3DFVertices:Fe,createAugmentedTypedArray:y,createCubeBufferInfo:Fn,createCubeBuffers:$n,createCubeVertices:Ge,createPlaneBufferInfo:Mn,createPlaneBuffers:Vn,createPlaneVertices:Pe,createSphereBufferInfo:Nn,createSphereBuffers:In,createSphereVertices:Ue,createTruncatedConeBufferInfo:Rn,createTruncatedConeBuffers:Ln,createTruncatedConeVertices:fe,createXYQuadBufferInfo:Dn,createXYQuadBuffers:zn,createXYQuadVertices:Se,createCresentBufferInfo:Xn,createCresentBuffers:qn,createCresentVertices:Kn,createCrescentBufferInfo:ut,createCrescentBuffers:at,createCrescentVertices:le,createCylinderBufferInfo:On,createCylinderBuffers:kn,createCylinderVertices:$e,createTorusBufferInfo:Yn,createTorusBuffers:jn,createTorusVertices:Me,createDiscBufferInfo:Hn,createDiscBuffers:Wn,createDiscVertices:Ve,deindexVertices:vn,flattenNormals:wn,makeRandomVertexColors:Tn,reorientDirections:rt,reorientNormals:ot,reorientPositions:it,reorientVertices:st,concatVertices:Sn,duplicateVertices:Pn}),Ye=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)});function ee(){var t=new Ye(2);return Ye!=Float32Array&&(t[0]=0,t[1]=0),t}function he(t,e,n){return t[0]=e,t[1]=n,t}function Zn(t,e,n){return t[0]=e[0]*n,t[1]=e[1]*n,t}(function(){var t=ee();return function(e,n,r,o,i,s){var c,d;for(n||(n=2),r||(r=0),o?d=Math.min(o*n+r,e.length):d=e.length,c=r;c<d;c+=n)t[0]=e[c],t[1]=e[c+1],i(t,t,s),e[c]=t[0],e[c+1]=t[1];return e}})();const N=`struct CellData {
  velocity : vec2<f32>,
  divergence : f32,
  pressure : f32,
}

@group(0) @binding(0) var<storage, read> input : array<CellData>;
@group(0) @binding(1) var<storage, read_write> output : array<CellData>;

struct Uniforms {
  resolution : vec2<f32>,
  simulation_resolution : vec2<f32>,
  delta_time : f32,
  viscosity : f32,
  mouse_position : vec2<f32>,
  mouse_delta : vec2<f32>,
}

@group(1) @binding(0) var<uniform> uniforms : Uniforms;`,I=`fn index_to_coord(index: f32) -> vec2<f32> {
  var x = floor(index % uniforms.simulation_resolution.x);
  var y = floor(index / uniforms.simulation_resolution.x);

  return vec2<f32>(x, y);
}

fn coord_to_index(coord: vec2<f32>) -> f32 {
  return (uniforms.simulation_resolution.x) * coord.y + coord.x;
}

fn coord_to_position(coord: vec2<f32>) -> vec2<f32> {
  let scale = uniforms.simulation_resolution / uniforms.resolution;
  return coord / scale;
}

fn position_to_coord(position: vec2<f32>) -> vec2<f32> {
  let scale = uniforms.simulation_resolution / uniforms.resolution;
  return position * scale;
}

fn get_cell_bilinear(grid_position: vec2<f32>) -> CellData {
  var result: CellData; 


  var coord_a = floor(grid_position);
  var coord_b = vec2<f32>(ceil(grid_position.x), floor(grid_position.y));
  var coord_c = ceil(grid_position);
  var coord_d = vec2<f32>(floor(grid_position.x), ceil(grid_position.y));

  let index_a = u32(coord_to_index(coord_a));
  let index_b = u32(coord_to_index(coord_b));
  let index_c = u32(coord_to_index(coord_c));
  let index_d = u32(coord_to_index(coord_b));

  let cell_a = input[index_a];
  let cell_b = input[index_b];
  let cell_c = input[index_c];
  let cell_d = input[index_d];

  let u = grid_position.x - coord_a.x;
  let v = grid_position.y - coord_a.y;

  result.velocity = mix(mix(cell_a.velocity, cell_b.velocity, u), mix(cell_d.velocity, cell_c.velocity, u), v);
  result.divergence = mix(mix(cell_a.divergence, cell_b.divergence, u), mix(cell_d.divergence, cell_c.divergence, u), v);
  result.pressure = mix(mix(cell_a.pressure, cell_b.pressure, u), mix(cell_d.pressure, cell_c.pressure, u), v);

  return result;
}

fn get_neighboring_position_values(position: vec2<f32>, offset_distance: vec2<f32>) -> array<CellData, 4> {
  var result: array<CellData, 4>;

  let position_up = vec2<f32>(position.x, clamp(position.y - offset_distance.y, 0, uniforms.resolution.y - 1));
  let position_right = vec2<f32>(clamp(position.x + offset_distance.x, 0, uniforms.resolution.x - 1), position.y);
  let position_down = vec2<f32>(position.x, clamp(position.y + offset_distance.y, 0, uniforms.resolution.y - 1));
  let position_left = vec2<f32>(clamp(position.x - offset_distance.x, 0, uniforms.resolution.x - 1), position.y);

  result[0] = get_cell_bilinear(position_to_coord(position_up));
  result[1] = get_cell_bilinear(position_to_coord(position_right));
  result[2] = get_cell_bilinear(position_to_coord(position_down));
  result[3] = get_cell_bilinear(position_to_coord(position_left));

  return result;
}

fn is_boundary(coord: vec2<f32>) -> bool {
  if (coord.x <= 0 || coord.y <= 0 || coord.x >= uniforms.simulation_resolution.x - 1 || coord.y >= uniforms.simulation_resolution.y - 1) {
    return true;
  }
  return false;
}`,Jn=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }
  
  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (!is_boundary(coord)) {
    return;
  }

  if (
    (coord.y == 0 && coord.x == 0) ||
    (coord.x == uniforms.simulation_resolution.x -1 && coord.y == 0) ||
    (coord.x == uniforms.simulation_resolution.x -1 && coord.y ==uniforms.simulation_resolution.y -1) ||
    (coord.x == 0 && coord.y == uniforms.simulation_resolution.y -1)
  ) {
    return;
  }

  var normal: vec2<f32>;

  if (coord.y == 0) {
    normal = vec2<f32>(0, 1);
  } else if (coord.y == uniforms.simulation_resolution.y - 1) {
    normal = vec2<f32>(0, -1);
  } else if (coord.x == 0) {
    normal = vec2<f32>(1, 0);
  } else if (coord.x == uniforms.simulation_resolution.x -1) {
    normal = vec2<f32>(-1, 0);
  }

  var inner_coord = coord + normal;
  var inner_index = coord_to_index(inner_coord);
  var inner_data = input[u32(inner_index)];


  (*next_state).velocity = inner_data.velocity * -1;
  (*next_state).pressure = inner_data.pressure;
  (*next_state).divergence = inner_data.divergence;
}`,er=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }

  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (is_boundary(coord)) {
    return;
  }

  let distance_to_mouse = distance(uniforms.mouse_position, coord_to_position(coord));
  var strength = 1 - distance_to_mouse / uniforms.resolution;

  strength = smoothstep(vec2<f32>(0.95), vec2<f32>(1), strength) * 2.0;
  var velocity = uniforms.mouse_delta * strength * strength;

  (*next_state).velocity = (*next_state).velocity + velocity;
}`,tr=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }
  
  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (is_boundary(coord)) {
    return;
  }

  let position = coord_to_position(coord);
  let previous_grid_position = position - (*next_state).velocity * uniforms.delta_time;
  let interpolated_cell_data = get_cell_bilinear(position_to_coord(previous_grid_position));
  (*next_state).velocity = interpolated_cell_data.velocity;

}`,nr=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }

  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (is_boundary(coord)) {
    return;
  }
  let position = coord_to_position(coord);

  let current_velocity = current_state.velocity;
  let scale = uniforms.simulation_resolution / uniforms.resolution;
  var offset_distance = vec2<f32>(2) / scale;
  
  let neighbors = get_neighboring_position_values(position, offset_distance);
  let up = neighbors[0];
  let right = neighbors[1];
  let down = neighbors[2];
  let left = neighbors[3];

  var velocity = 4.0 * current_velocity + uniforms.viscosity * uniforms.delta_time * (up.velocity + right.velocity + down.velocity + left.velocity);
  velocity = velocity / (4 * (1 + uniforms.viscosity * uniforms.delta_time)); 

  (*next_state).velocity = velocity;
}`,rr=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }

  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (is_boundary(coord)) {
    return;
  }
  let position = coord_to_position(coord);
  
  let scale = uniforms.simulation_resolution / uniforms.resolution;
  var offset_distance = vec2<f32>(1) / scale;

  let neighbors = get_neighboring_position_values(position, offset_distance);
  let up = neighbors[0];
  let right = neighbors[1];
  let down = neighbors[2];
  let left = neighbors[3];
  let divergence = (right.velocity.x - left.velocity.x + down.velocity.y - up.velocity.y) / 2;

  (*next_state).velocity = current_state.velocity;
  (*next_state).divergence = divergence / uniforms.delta_time;
}`,or=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }

  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (is_boundary(coord)) {
    return;
  }

  let position = coord_to_position(coord);
  
  let scale = uniforms.simulation_resolution / uniforms.resolution;
  var offset_distance = vec2<f32>(2) / scale;
  let neighbors = get_neighboring_position_values(position, offset_distance);
  let up = neighbors[0];
  let right = neighbors[1];
  let down = neighbors[2];
  let left = neighbors[3];

  (*next_state).divergence = current_state.divergence;
  (*next_state).pressure = (up.pressure + right.pressure + down.pressure + left.pressure) / 4 - current_state.divergence;
}`,ir=`@compute @workgroup_size(256, 1, 1)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  let count = arrayLength(&output);
  let index = global_id.x * (global_id.y + 1) * (global_id.z + 1);

  if (index >= count) {
    return;
  }

  var current_state = input[index];
  let next_state: ptr<storage, CellData, read_write> = &output[index];
  (*next_state) = current_state;

  let coord = index_to_coord(f32(index));
  if (is_boundary(coord)) {
    return;
  }

  let position = coord_to_position(coord);
  
  let scale = uniforms.simulation_resolution / uniforms.resolution;
  var offset_distance = vec2<f32>(1) / scale;

  let neighbors = get_neighboring_position_values(position, offset_distance);
  let up = neighbors[0];
  let right = neighbors[1];
  let down = neighbors[2];
  let left = neighbors[3];
  let grad_pressure = vec2<f32>(right.pressure - left.pressure, down.pressure - up.pressure) * 0.5;

  (*next_state).velocity = current_state.velocity - grad_pressure * uniforms.delta_time;
}`,sr=`

struct VertexInput {
  @location(0) position : vec4<f32>,
  @location(2) texcoord : vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) texcoord : vec2<f32>,
}
@vertex
fn vertex_main(@builtin(instance_index) instance_index : u32, vert : VertexInput) -> VertexOutput {
  var output : VertexOutput;
  output.position = vec4<f32>(vert.position.x, vert.position.z, 0, 1);
  output.texcoord = vec2<f32>(vert.texcoord.x, 1 - vert.texcoord.y);
  return output;
}

@fragment
fn fragment_main(in: VertexOutput) -> @location(0) vec4<f32> {
  let coord = in.texcoord * uniforms.simulation_resolution;
  let interpolated_cell_data = get_cell_bilinear(coord);

  var scaled_velocity = interpolated_cell_data.velocity * 0.001;
  var velocity_color = vec4<f32>((scaled_velocity.xy + 1) / 2, 1, 1);

  velocity_color = mix(vec4<f32>(0,0,0,1), velocity_color, smoothstep(0, uniforms.resolution.x * 0.2, length(interpolated_cell_data.velocity)));

  // return mix(vec4<f32>(1), color, length(scaled_velocity));
  var scaled_divergence = interpolated_cell_data.divergence * 0.1 * uniforms.delta_time;
  var divergence_color = vec4(scaled_divergence, scaled_divergence,scaled_divergence, 1);

  var scaled_pressure = interpolated_cell_data.divergence * 0.1 * uniforms.delta_time;
  var pressure_color = vec4(scaled_pressure, scaled_pressure, scaled_pressure, 1);
  return velocity_color;
  // return vec4<f32>(uniforms.pose_deltas[0].xy * 0.001, 0, 1);

}
`,O=256,je=.25,cr=2,ur=document.querySelector("canvas"),ar=new Tt;let R,G;const He=ee(),ce=ee();let Ne=!1;const Ie=ee(),K=ee();let Q,F,ft,lt,dt,ht,pt,mt,_t,gt;const yt=()=>{const{delta:t}=ar.tick();Zn(K,K,1-.01*t),Q.member.delta_time=Math.max(Math.min(t,33.33),8)/1e3,Q.member.mouse_position=Ie,Q.member.mouse_delta=K,R.run(ft),F.step(),R.run(lt),F.step(),R.run(dt),F.step();for(let e=0;e<24;e++)R.run(ht),F.step();R.run(pt),F.step();for(let e=0;e<24;e++)R.run(mt),F.step();R.run(_t),F.step(),G.render(gt),requestAnimationFrame(yt)},fr=t=>{if(!Ne)return;const{clientX:e,clientY:n,movementX:r,movementY:o}=t;K[0]+=r,K[1]+=o,he(Ie,e*G.pixelRatio,n*G.pixelRatio)},lr=()=>Ne=!0,dr=()=>Ne=!1,hr=async()=>{const t=await Pt.requestWebGPU();R=new bt(t),G=new xt(t,ur),he(He,G.width,G.height),he(ce,Math.round(G.width*je),Math.round(G.height*je)),Q=new At(t,{resolution:He,simulation_resolution:ce,delta_time:8.33/1e3,viscosity:cr,mouse_position:Ie,mouse_delta:K});const e=ce[0]*ce[1],n=new J({velocity:()=>[0,0],divergence:0,pressure:0},e);F=new Et(t,n);const r={simulationInput:F,uniforms:Q};ft=new z(t,`${N} ${I} ${Jn}`,r,n.count,O),lt=new z(t,`${N} ${I} ${tr}`,r,n.count,O),dt=new z(t,`${N} ${I} ${er}`,r,n.count,O),ht=new z(t,`${N} ${I} ${nr}`,r,n.count,O),pt=new z(t,`${N} ${I} ${rr}`,r,n.count,O),mt=new z(t,`${N} ${I} ${or}`,r,n.count,O),_t=new z(t,`${N} ${I} ${ir}`,r,n.count,O);const o=new wt(G,Qn.createPlaneVertices(2,2),1);gt=new vt(G,`${N} ${I} ${sr}`,o,{simulation:F,uniforms:Q}),window.addEventListener("mousemove",fr),window.addEventListener("mouseup",dr),window.addEventListener("mousedown",lr),requestAnimationFrame(yt)};hr();

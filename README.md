# Stable Fluids in WebGPU

This is the accompanying code for my Blog Post Stable Fluids in WebGPU.

At time of writing, you will need to use Chrome Canary, and enable WebGPU in flags.

## Dependencies

- **MiniGPU:** Takes some pain out of getting WebGPU programs up and running.
- [**glMatrix:**](https://glmatrix.net/) For performing vector and matrix operations on Float32Arrays
- [**twgl.js:**](https://twgljs.org/) A WebGL Library, just used as a convinience to create geometry vertices

### MiniGPU

MiniGPU is my own little library which handles some of the WebGPU boilerplate. In this demo it's mainly used to set up Buffers and BindGroups, and to generate the commands needed to run the shader code.

If you are new to WebGPU, I would recommend you do some background reading to understand what's being obfuscated.

## Getting Started

First, clone the repo and install dependencies

`$ npm install`

or

`$ yarn install`

Then start the development server (using Vite)

`$ npm run dev`

or

`$ yarn run dev`

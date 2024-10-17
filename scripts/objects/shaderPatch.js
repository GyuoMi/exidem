import * as THREE from "three";

export function buildTwistMaterial(amount, speedMultiplier) {
    const material = new THREE.MeshNormalMaterial();
    material.onBeforeCompile = function (shader) {
        shader.uniforms.time = { value: 0 };
        shader.uniforms.speedMultiplier = { value: speedMultiplier };

        shader.vertexShader = `
            uniform float time;
            uniform float speedMultiplier;
            ` + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            float theta = sin(speedMultiplier * (time + position.y)) / ${amount.toFixed(1)};
            float c = cos(theta);
            float s = sin(theta);
            mat3 m = mat3(c, 0, s, 0, 1, 0, -s, 0, c);
            vec3 transformed = vec3(position) * m;
            vNormal = vNormal * m;
            `
        );

        material.userData.shader = shader;
    };

    material.customProgramCacheKey = function () {
        return amount.toFixed(1);
    };

    return material;
}

//THREE.ShaderChunk.project_vertex = `
//  vec2 resolution = vec2(320, 240);
//  vec4 pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//
//  pos.xyz /= pos.w;
//  pos.xy = floor(resolution * pos.xy) / resolution;
//  pos.xyz *= pos.w;
//
//  gl_Position = pos;
//`;
//
//THREE.ShaderChunk.uv_pars_vertex = `
//  varying vec2 vUv;
//  varying float vAffine;
//
//  void main() {
//    vUv = uv;
//    float dist = length(modelViewMatrix * vec4(position, 1.0)).z;
//    float affine = dist + (projectionMatrix[3][3] * 8.0) / dist * 0.5;
//    vUv *= affine;
//    vAffine = affine;
//  }
//`;
//
//THREE.ShaderChunk.map_fragment = `
//  varying vec2 vUv;
//  varying float vAffine;
//
//  uniform sampler2D map;
//
//  void main() {
//    vec2 uv = vUv / vAffine;
//    vec4 color = texture2D(map, uv);
//
//    // Optional dithering or posterization effect
//    float levels = 8.0;
//    color.rgb = floor(color.rgb * levels) / levels;
//
//    gl_FragColor = color;
//  }
//`;
//
//// Modify shaders globally
//const modifyShaders = (material) => {
//  material.onBeforeCompile = (shader) => {
//    // Inject vertex shader changes
//    shader.vertexShader = shader.vertexShader.replace(
//      "#include <project_vertex>",
//      THREE.ShaderChunk.project_vertex,
//    );
//
//    // Inject fragment shader changes
//    shader.fragmentShader = shader.fragmentShader.replace(
//      "#include <map_fragment>",
//      THREE.ShaderChunk.map_fragment,
//    );
//
//    // Ensure UVs are calculated with the affine mapping code
//    shader.vertexShader = shader.vertexShader.replace(
//      "#include <uv_pars_vertex>",
//      THREE.ShaderChunk.uv_pars_vertex,
//    );
//  };
//};
//
//// Apply the custom shader modifications to all existing meshes
//scene.traverse((child) => {
//  if (child.isMesh) {
//    modifyShaders(child.material);
//  }
//});

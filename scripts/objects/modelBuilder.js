const { Asset, Scene, Mesh, Node, Primitive, buildVec3Accessor, buildUIntAccessor } = require('gltf-builder');
const fs = require('fs');

//// Wall Vertices (1)
//const wallPrimitive = new Primitive()
//  .position(
//    buildVec3Accessor([
//      [-2, 0, -2], // vertex 0 (bottom left)
//      [2, 0, -2],  // vertex 1 (bottom right)
//      [2, 0, 2],   // vertex 2 (top right)
//      [-2, 0, 2],  // vertex 3 (top left)
//      [-2, 10, -2], // vertex 4 (top left height)
//      [2, 10, -2],  // vertex 5 (top right height)
//      [2, 10, 2],   // vertex 6 (bottom right height)
//      [-2, 10, 2],  // vertex 7 (bottom left height)
//    ])
//  )
//  .indices(
//    buildUIntAccessor([
//      //0, 1, 4, // Triangle 1
//      //1, 5, 4, // Triangle 1
//      //1, 2, 5, // Triangle 2
//      //2, 6, 5, // Triangle 2
//      //2, 3, 6, // Triangle 3
//      //3, 7, 6, // Triangle 3
//      //3, 0, 7, // Triangle 4
//      //0, 4, 7  // Triangle 4
//      4, 1, 0, // flipped normals for inner wall
//      4, 5, 1,
//      5, 2, 1,
//      5, 6, 2,
//      6, 3, 2,
//      6, 7, 3,
//      7, 0, 3,
//      7, 4, 0
//    ])
//  );
//
//const wallAsset = new Asset().addScene(
//  new Scene().addNode(
//    new Node().mesh(
//      new Mesh().addPrimitive(wallPrimitive)
//    )
//  )
//);
//
//const gltf = wallAsset.build();
//fs.writeFileSync('stairWall.gltf', JSON.stringify(gltf), 'utf8');
//
function buildCube() {
  const cubeVertices = [
    [-0.5, -0.5, 0.5],  [0.5, -0.5, 0.5],   [-0.5, 0.5, 0.5],    [0.5, 0.5, 0.5],    // Front face
    [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5],  [-0.5, 0.5, -0.5],   [0.5, 0.5, -0.5],   // Back face
  ];

  const cubeIndices = [
    0, 1, 2,  2, 1, 3,  // Front face
    4, 6, 5,  5, 6, 7,  // Back face
    0, 2, 4,  4, 2, 6,  // Left face
    1, 5, 3,  3, 5, 7,  // Right face
    2, 3, 6,  6, 3, 7,  // Top face
    0, 4, 1,  1, 4, 5   // Bottom face
  ];

  const cubePrimitive = new Primitive()
    .position(buildVec3Accessor(cubeVertices))
    .indices(buildUIntAccessor(cubeIndices));

  const cubeMesh = new Mesh().addPrimitive(cubePrimitive);

  return cubeMesh;
}

function buildRoom() {
  const roomVertices = [
    [-2, 0, -2], [2, 0, -2], [2, 4, -2], [-2, 4, -2],   // Back wall
    [-2, 0, 2],  [2, 0, 2],  [2, 4, 2],  [-2, 4, 2],    // Front wall
    [-2, 0, -2], [-2, 0, 2], [-2, 4, 2], [-2, 4, -2],   // Left wall
    [2, 0, -2],  [2, 0, 2],  [2, 4, 2],  [2, 4, -2],    // Right wall
    [-2, 4, -2], [2, 4, -2], [2, 4, 2],  [-2, 4, 2],     // Ceiling
    [-2, 0, -2], [2, 0, -2], [2, 0, 2], [-2, 0, 2]      // Floor
  ];

  const roomIndices = [
    0, 1, 2, 2, 3, 0,   // Back wall
    4, 7, 6, 6, 5, 4,   // Front wall
    8, 11, 10, 10, 9, 8,  // Left wall
    12, 13, 14, 14, 15, 12,  // Right wall
    16, 17, 18, 18, 19, 16,   // Ceiling
    20, 23, 22, 22, 21, 20    // Floor
  ];

  const roomPrimitive = new Primitive()
    .position(buildVec3Accessor(roomVertices))
    .indices(buildUIntAccessor(roomIndices));

  const roomMesh = new Mesh().addPrimitive(roomPrimitive);

  return roomMesh;
}

const asset = new Asset()
  .addScene(
    new Scene()
      //.addNode(new Node().mesh(buildCube()))
      .addNode(new Node().mesh(buildRoom()))
  );

const gltf = asset.build();
//fs.writeFileSync('rotating_cube_room.gltf', JSON.stringify(gltf), 'utf8');
fs.writeFileSync('portal_room.gltf', JSON.stringify(gltf), 'utf8');

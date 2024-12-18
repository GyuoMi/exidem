// CREDITS: honestly masssive credits to this, it's amazing Book of shaders https://thebookofshaders.com/10/
in vec2 uvInterpolator;
uniform float u_time;
uniform sampler2D u_texture;

// Generate a random float from a single input and seed.
float Random11(float inputValue, float seed) {
  return fract(sin(inputValue * 345.456) * seed);
}

// Generate a random float from a 2d input and seed.
float Random21(vec2 inputValue, float seed) {
  return fract(sin(dot(inputValue, vec2(123.456, 43.12))) * seed);
}

// Generate drops as distortions, that can be applied to UV coordinates
vec2 Drops(vec2 uv, float seed) {
  // Randomly move everything
  float shiftY = Random11(0.5, seed);
  uv.y += shiftY;

  // Split UV spac into cells. Each cell will contain a drop.
  float cellsResolution = 10.0;
  uv *= cellsResolution;

  // Move each row randomly.
  float rowIndex = floor(uv.y);
  float shiftX = Random11(rowIndex, seed);
  uv.x += shiftX;

  vec2 cellIndex = floor(uv);
  vec2 cellUv = fract(uv);
  
  // Get the center of each cell so they look like drops
  vec2 cellCenter = vec2(0.5);
  float distanceFromCenter = distance(cellUv, cellCenter);

  // We don't want to show every drop. So randomly remove some of them.
  float isDropShown = step(0.8, Random21(cellIndex, seed + 14244.324));

  // Decrease each drop intensity with time. Then make it appear again. (since drops would "evaporate" over time)
  float dropIntensity = 1.0 - fract(u_time * 0.1 + Random21(cellIndex, seed + 32132.432) * 2.0) * 2.0;
  dropIntensity = sign(dropIntensity) * abs(dropIntensity * dropIntensity * dropIntensity * dropIntensity);
  dropIntensity = clamp(dropIntensity, 0.0, 1.0);

  // We only need results from inside a specific radius of a drop.
  float isInsideDrop = 1.0 - step(0.1, distanceFromCenter);

  vec2 vecToCenter = normalize(cellCenter - cellUv);

  // Drop value is a vector to the center that increases with distance form it.
  vec2 dropValue = vecToCenter * distanceFromCenter * distanceFromCenter * 40.0;

  vec2 drop = dropValue * isInsideDrop * isDropShown * dropIntensity;
  return drop;
}

void main() {
  // Set interpolator ourselves since threejs only provides it to the vertex shader
  vec2 uv = uvInterpolator;

  // Run the Drop function 10 times to create seemingly random pattern.
  vec2 drops = vec2(0.0);
  for(int i = 0; i < 10; i++) {
    drops += Drops(uv, 42424.43 + float(i) * 12313.432);
  }

  // Distort UV.
  uv += drops;

  // Sample the texture after distorting the UV space.
  vec4 color = texture2D(u_texture, uv);

  gl_FragColor = color;
}

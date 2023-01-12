fn index_to_coord(index: f32) -> vec2<f32> {
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
}
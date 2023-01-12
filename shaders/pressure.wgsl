@compute @workgroup_size(256, 1, 1)
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
}
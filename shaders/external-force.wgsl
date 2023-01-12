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

  let distance_to_mouse = distance(uniforms.mouse_position, coord_to_position(coord));
  var strength = 1 - distance_to_mouse / uniforms.resolution;

  strength = smoothstep(vec2<f32>(0.95), vec2<f32>(1), strength) * 2.0;
  var velocity = uniforms.mouse_delta * strength * strength;

  (*next_state).velocity = (*next_state).velocity + velocity;
}
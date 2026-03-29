# Penpot MCP Tool Flows

## Default Session Recovery

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `inspect_canvas`

## New Screen

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `plan_ui_build`
5. confirm with the user
6. `confirm_structural_setup`
7. `ensure_frame_scaffolding`
8. build or reuse components in `_Components`
9. `create_main_component_from_shape`
10. `instantiate_local_component_into_slot`
11. `apply_instance_text_overrides`
12. `apply_design_tokens_to_shape`

## Update Existing Screen

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `inspect_canvas`
5. `find_local_components`
6. `inspect_design_tokens`
7. `inspect_design_token_usage`
8. mutate the smallest safe surface possible

## Diagnose Unsafe Work

1. `inspect_unsafe_construction_patterns`
2. `inspect_design_token_usage`
3. `diagnose_export_shape`

High-risk signals:

- screen with zero component instances
- many raw boards and texts
- hardcoded styling everywhere
- multiple unrelated top-level elements on a screen
- `_Components` duplicated by content

## Icon Flow

1. `find_library_components` with exact matching when possible
2. `instantiate_library_component_into_slot`
3. confirm `parentId == targetShapeId`
4. export only after confirming the icon instance is in the correct slot

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
7. `create_screen_page`
8. `create_screen_shell`
9. build or reuse components in `_Components`
10. `create_component_shell`
11. `organize_component_in_components_page`
12. `validate_components_page_layout`
13. `publish_components_from_components_page`
14. `place_component_on_screen`
15. `apply_instance_text_overrides`
16. `apply_component_variant_overrides` when the target instance must switch variant
17. `apply_design_tokens_to_shape`

## Update Existing Screen

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `inspect_canvas`
5. `list_screen_pages`
6. `find_local_components`
7. `inspect_design_tokens`
8. `inspect_design_token_usage`
9. `create_text_block` for new text inside layout-safe containers
10. `apply_instance_text_overrides` for content-only changes
11. mutate the smallest safe surface possible

## Component Library Work

1. `first_tool_recommended_flow`
2. `plugin_connection_status`
3. `inspect_project_setup`
4. `find_local_components`
5. `create_component_shell`
6. `organize_component_in_components_page`
7. `validate_components_page_layout`
8. `publish_components_from_components_page`
9. `create_component_variant` if the component needs a real variant family
10. `apply_component_variant_overrides` only after the variant family already exists

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

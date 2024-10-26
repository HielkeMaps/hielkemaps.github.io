---
layout: wiki
title: Integration Guide
permalink: /wiki/veinminer/integration
---

##### Hi there!

This guide explains how to integrate your custom Add-On with VeinMiner using Minecraft's scriptevent system. By following these instructions, you can register your custom trees and axes, allowing them to work seamlessly with VeinMiner's tree-cutting functionality!

Really nothing too complicated, but make sure you read everything! ^^

___
#### Registering Your Add-On

To register your Add-On with VeinMiner, you need to send a scriptevent with the ID `veinminer:register_addon`. The event message should contain a JSON string with your Add-On's configuration.

Here's an example of how to register your Add-On:

```typescript
world.getDimension("overworld").runCommand("scriptevent veinminer:register_addon " + JSON.stringify({
  name: "My Custom Add-On",
  trees: [
    // Your custom trees here
  ],
  axes: [
    // Your custom axes here
  ]
}));
```
___
#### Tree Configuration

When defining custom trees, you need to provide a Tree object with the following structure:

```typescript
interface Tree {
  id: string;
  lang?: string;
  nether?: boolean;
  variants?: Set<string>;

  leaves: {
    types: Set<string>;
    persistent_state?: string;
    range: number;
    sides_required: number;
  };

  shape: {
    stem?: boolean;
    leaf_diagonal?: boolean;
    log_up_diagonal?: boolean;
    log_up_diagonal_side?: boolean;
    max_branch?: number;
  };

  on_load: string;
}
```

Here's what each field means:

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| id | string | The unique identifier for the tree log | ✔️ |
| lang | string | The language key for the tree name (defaults to `tile.${id}.name`). Can also be a normal string. | ❌ |
| nether | boolean | Whether this is a Nether tree. Nether trees have a custom leaf decay option. | ❌ |
| variants | Set<string> | Alternative log types (e.g. a mossy log variant) | ❌ |
| leaves.types | Set<string> | Block IDs for leaves associated with this tree | ✔️ |
| leaves.persistent_state | string | Block state to check for leaf persistence | ❌ |
| leaves.range | number | Maximum distance to search for leaves from the trunk. Works similarly to how vanilla tree distance works. | ✔️ |
| leaves.sides_required | number | Minimum number of sides with leaves to be considered a valid tree. This is NOT leaf count. Range from 1-5, as VeinMiner will check leaves in north, east, west, south and up direction) | ✔️ |
| shape.stem | boolean | Whether this tree has a 2x2 stem (like giant jungle trees) | ❌ |
| shape.leaf_diagonal | boolean | Whether leaves connect diagonally | ❌ |
| shape.log_up_diagonal | boolean | Whether tree logs connect diagonally upwards | ❌ |
| shape.log_up_diagonal_side | boolean | Whether logs connect diagonally upwards AND sideways | ❌ |
| shape.max_branch | number | Maximum horizontal branch length. Set this if you have tree branches going sideways.  | ❌ |
| on_load | string| Minecraft command that will be run when Add-On has been registered. | ❌ |

___

#### Axe Configuration

When defining custom axes, you can specify the following properties:

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| id | string | The unique identifier for the axe | ✔️ |
| lang | string | The language key for the axe name (defaults to `item.${id}.name`). You can also pass a normal string here. | ❌ |

___
#### Complete Example

Here's a complete example of registering an Add-On with both custom trees and axes:

```typescript
// Define your addon configuration
const myAddon = {
  name: "My Nature Add-On",
  trees: [
    {
      id: "mynature:rainbow_log",
      nether: false,
      variants: new Set(["mynature:rainbow_wood"]),
      leaves: {
        types: new Set(["mynature:red_leaves","mynature:yellow_leaves","mynature:green_leaves","mynature:blue_leaves","mynature:purple_leaves"]),
        range: 7,
        sides_required: 4,
      },
      shape: {
        leaf_diagonal: true,
        log_up_diagonal: true,
        log_up_diagonal_side: true,
        max_branch: 3,
      },
    },
  ],
  axes: [
    { id: "mynature:stone_axe" },
    { id: "mynature:iron_axe" },
    { id: "mynature:diamond_axe", lang: "My super cool diamond axe" },
  ],
  on_load: "say VeinMiner Compatibility Added!",
};

// Register the addon after the world initializes
world.afterEvents.worldInitialize.subscribe(() => {
  world.getDimension("overworld").runCommand(
    "scriptevent veinminer:register_addon " + JSON.stringify(myAddon)
  );
});
```

In this example, we're registering an Add-On called "My Nature Add-On" with a custom rainbow tree, and three custom axes. Note that for the diamond axe, we've specified a custom lang key.

Your axes and logs will now show up in VeinMiner! 🎉

<img src="{{site.baseurl}}/media{{page.url}}/custom_axes.jpg" width="400">
<img src="{{site.baseurl}}/media{{page.url}}/custom_logs.jpg" width="400">

___
#### Best Practices

1. Use unique identifiers for your trees and axes to avoid conflicts with other Add-Ons.
2. Optimize your trees as much as possible. For example: if your trees don't have any horizontal branches, don't set `max_branch`.
3. Test your integration thoroughly to ensure all trees and axes work as expected with VeinMiner.
4. In VeinMiner, enable Trunk Outline to easily test integration.

By following this guide, you can seamlessly integrate your custom Add-On with VeinMiner, allowing players to enjoy your custom trees and axes with the tree-cutting functionality provided by VeinMiner.
---
type: project
id: obsidian-metatable
status: ongoing
start_date: 2021-03-07
end_date: 2023-09-04
source_url: https://github.com/arnau/obsidian-metatable
---
# Obsidian Metatable

An [Obsidian](https://obsidian.md/) plugin to display the full frontmatter block instead of just the list of tags.

<!-- body -->

[Obsidian](https://obsidian.md/) is a tool to organise interlinked notes but relies too little on metadata. This plugin brings metadata forward a bit more within the constraints Obsidian itself imposes.

I stopped working on this plugin after Obsidian relesed version 1.4 which added overlapping functionality as well as breaking the interface I was using. 

The project is built using [TypeScript] and [Web Components], in particular it uses the Shadow DOM to minimise the potential conflicts with other plugins that are fiddling with the Obsidian views.

[TypeScript]: https://www.typescriptlang.org/
[Web Components]: https://developer.mozilla.org/en-US/docs/Web/Web_Components


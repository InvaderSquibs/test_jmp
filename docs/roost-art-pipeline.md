# Art Constraints + Sprite Pipeline (Checkpoint 2)

## Visual Constraints
- **Tile base**: 16x16 map cells.
- **Character base**: allow 16x32 for NPC/player sprites (occupy one logical tile footprint, draw upward).
- **Pixel scale**: integer-only scaling (2x/3x/4x), nearest-neighbor.
- **Palette mindset**:
  - Keep per-sprite palettes small (4-16 colors preferred).
  - Keep scene palette curation constrained to retro-style limits; target <= 256 colors visible.
  - Reserve shared ramps for skin, foliage, wood, stone to improve coherence.
- **Shading style**:
  - 1-2 shade steps per material region.
  - Avoid over-dithering in tiny 16x16 assets.
  - Prefer clear silhouette readability over internal detail noise.

## Placeholder Atlas
`assets/atlas/placeholder_atlas.json` maps named sprites to atlas regions.
`assets/atlas/placeholder_atlas.svg` is a simple color-block placeholder for prototype rendering.

## Sprite Production Pipeline
1. **Blockout**
   - Sketch in 16x16 or 16x32 canvas.
   - Validate silhouette at 1x zoom.
2. **Palette assignment**
   - Pick from shared swatches first.
   - Track palette index usage in metadata.
3. **Export**
   - Save source (`.aseprite` or layered source file).
   - Export indexed `.png` frame(s).
4. **Packing**
   - Pack frames into atlas with deterministic names.
   - Emit JSON metadata (x/y/w/h, pivot, animation tags).
5. **Integration**
   - Update atlas manifest in repo.
   - Verify map/entity preview in replay UI.
6. **QA**
   - Check aliasing at scale factors 2x and 4x.
   - Validate legibility against all terrain tiles.

## Atlas Metadata Contract
```json
{
  "image": "placeholder_atlas.svg",
  "tileSize": 16,
  "sprites": {
    "tile.grass": { "x": 0, "y": 0, "w": 16, "h": 16 },
    "tile.path": { "x": 16, "y": 0, "w": 16, "h": 16 },
    "npc.farmer.idle": { "x": 0, "y": 16, "w": 16, "h": 32, "pivot": { "x": 8, "y": 31 } }
  }
}
```

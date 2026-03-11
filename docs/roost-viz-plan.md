# Roost Viz Layer Plan (Checkpoint 1)

## Scope
Build a lightweight SNES/Stardew-inspired pixel-art visualization layer with three primary panes:
- **Map**: 16x16 tile base grid with support for 16x32 NPC sprites.
- **StoryPanel**: replay timeline and narrative events.
- **Inspector**: details for selected tile/entity/event.

## UI Layout
- Left: **Map viewport** (fixed aspect, nearest-neighbor scale)
- Right-top: **StoryPanel** (event log + replay controls)
- Right-bottom: **Inspector** (context pane)

## Event JSON Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://roost.dev/schemas/replay-event.json",
  "title": "RoostReplayEvent",
  "type": "object",
  "required": ["id", "t", "type", "actorId", "payload"],
  "properties": {
    "id": { "type": "string", "description": "Unique event id" },
    "t": { "type": "integer", "minimum": 0, "description": "Timeline tick" },
    "type": {
      "type": "string",
      "enum": [
        "narration",
        "move",
        "emote",
        "inspect",
        "state_change",
        "dialogue",
        "spawn",
        "despawn"
      ]
    },
    "actorId": { "type": "string", "description": "Entity producing or receiving the event" },
    "targetId": { "type": "string" },
    "pos": {
      "type": "object",
      "required": ["x", "y"],
      "properties": {
        "x": { "type": "integer", "minimum": 0 },
        "y": { "type": "integer", "minimum": 0 }
      },
      "additionalProperties": false
    },
    "payload": {
      "type": "object",
      "description": "Type-specific payload",
      "properties": {
        "text": { "type": "string" },
        "from": {
          "type": "object",
          "properties": {
            "x": { "type": "integer" },
            "y": { "type": "integer" }
          },
          "required": ["x", "y"],
          "additionalProperties": false
        },
        "to": {
          "type": "object",
          "properties": {
            "x": { "type": "integer" },
            "y": { "type": "integer" }
          },
          "required": ["x", "y"],
          "additionalProperties": false
        },
        "emotion": { "type": "string" },
        "value": {}
      },
      "additionalProperties": true
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    }
  },
  "additionalProperties": false
}
```

## Replay File Schema (container)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["meta", "map", "entities", "events"],
  "properties": {
    "meta": {
      "type": "object",
      "required": ["id", "title", "tileSize", "palette", "ticksPerSecond"],
      "properties": {
        "id": { "type": "string" },
        "title": { "type": "string" },
        "tileSize": { "type": "integer", "const": 16 },
        "palette": { "type": "string" },
        "ticksPerSecond": { "type": "number", "minimum": 1 }
      },
      "additionalProperties": false
    },
    "map": {
      "type": "object",
      "required": ["width", "height", "tiles"],
      "properties": {
        "width": { "type": "integer", "minimum": 1 },
        "height": { "type": "integer", "minimum": 1 },
        "tiles": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Row-major tile IDs"
        }
      },
      "additionalProperties": false
    },
    "entities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "kind", "name", "x", "y", "sprite", "size"],
        "properties": {
          "id": { "type": "string" },
          "kind": { "type": "string", "enum": ["npc", "object", "player"] },
          "name": { "type": "string" },
          "x": { "type": "integer", "minimum": 0 },
          "y": { "type": "integer", "minimum": 0 },
          "sprite": { "type": "string" },
          "size": {
            "type": "object",
            "required": ["w", "h"],
            "properties": {
              "w": { "type": "integer" },
              "h": { "type": "integer" }
            },
            "additionalProperties": false
          }
        },
        "additionalProperties": false
      }
    },
    "events": {
      "type": "array",
      "items": { "$ref": "https://roost.dev/schemas/replay-event.json" }
    }
  },
  "additionalProperties": false
}
```

const TILE = 16;
const GRID_W = 16;
const GRID_H = 16;
const SCALE = 2;

const palette = {
  grass: '#4CAF50',
  path: '#C2A878',
  water: '#4A90E2',
  house: '#7B5E57',
  field: '#7EA34F',
  soil: '#8B5A3C'
};

const demoSelect = document.getElementById('demoSelect');
const loadBtn = document.getElementById('loadBtn');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stepBtn = document.getElementById('stepBtn');
const tickLabel = document.getElementById('tickLabel');
const storyList = document.getElementById('storyList');
const inspector = document.getElementById('inspector');
const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
canvas.width = GRID_W * TILE;
canvas.height = GRID_H * TILE;

let replay = null;
let tick = 0;
let timer = null;
let state = { entities: [] };

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function tileAt(x, y) {
  return replay.map.tiles[y * replay.map.width + x];
}

function resetState() {
  state.entities = deepCopy(replay.entities);
  tick = 0;
  render();
}

function drawMap() {
  for (let y = 0; y < GRID_H; y += 1) {
    for (let x = 0; x < GRID_W; x += 1) {
      const tileId = tileAt(x, y);
      ctx.fillStyle = palette[tileId] || '#2f2f2f';
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.strokeRect(x * TILE, y * TILE, TILE, TILE);
    }
  }
}

function drawEntity(entity) {
  const px = entity.x * TILE;
  const py = entity.y * TILE - (entity.size.h - TILE);
  ctx.fillStyle = entity.kind === 'npc' ? '#D98C5F' : '#EEE';
  ctx.fillRect(px, py, entity.size.w, entity.size.h);
  ctx.fillStyle = '#1f1d2e';
  ctx.fillRect(px + 5, py + 4, 6, 4);
}

function applyEvent(event) {
  if (event.type === 'move') {
    const ent = state.entities.find((e) => e.id === event.actorId);
    if (ent) {
      ent.x = event.payload.to.x;
      ent.y = event.payload.to.y;
    }
  }
  if (event.type === 'state_change') {
    const ent = state.entities.find((e) => e.id === event.actorId);
    if (ent && event.payload.value?.mood) {
      ent.mood = event.payload.value.mood;
    }
  }
}

function rebuildToTick(targetTick) {
  state.entities = deepCopy(replay.entities);
  for (const event of replay.events) {
    if (event.t <= targetTick) applyEvent(event);
  }
}

function renderStory() {
  storyList.innerHTML = '';
  replay.events.forEach((event) => {
    const item = document.createElement('li');
    item.textContent = `[${event.t}] ${event.type} :: ${event.payload.text || event.actorId}`;
    if (event.t <= tick) item.classList.add('active');
    item.addEventListener('click', () => {
      inspector.textContent = JSON.stringify(event, null, 2);
    });
    storyList.appendChild(item);
  });
}

function render() {
  rebuildToTick(tick);
  ctx.save();
  ctx.scale(SCALE, SCALE);
  drawMap();
  state.entities.forEach(drawEntity);
  ctx.restore();
  tickLabel.textContent = `Tick: ${tick}`;
  renderStory();
}

function maxTick() {
  return replay.events[replay.events.length - 1]?.t || 0;
}

function step() {
  tick = Math.min(maxTick(), tick + 1);
  render();
}

function play() {
  if (timer) return;
  timer = setInterval(() => {
    if (tick >= maxTick()) {
      pause();
      return;
    }
    step();
  }, 400);
}

function pause() {
  clearInterval(timer);
  timer = null;
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / (TILE * SCALE));
  const y = Math.floor((event.clientY - rect.top) / (TILE * SCALE));
  const tile = tileAt(x, y);
  const occupant = state.entities.find((e) => e.x === x && e.y === y);
  inspector.textContent = JSON.stringify({ x, y, tile, occupant }, null, 2);
});

async function loadDemo(name) {
  const res = await fetch(`demos/${name}`);
  replay = await res.json();
  resetState();
}

loadBtn.addEventListener('click', async () => {
  pause();
  await loadDemo(demoSelect.value);
});
playBtn.addEventListener('click', play);
pauseBtn.addEventListener('click', pause);
stepBtn.addEventListener('click', step);

loadDemo(demoSelect.value);

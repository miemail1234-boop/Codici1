const $ = id => document.getElementById(id);
const fileInput = $('fileInput');
const canvas = $('imageCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const stage = $('canvasStage');
const viewport = $('viewport');
const emptyState = $('emptyState');
const rectPreview = $('rectPreview');
const brushSize = $('brushSize');
const zoomRange = $('zoomRange');
const brushLabel = $('brushLabel');
const zoomLabel = $('zoomLabel');
const exportBtn = $('exportBtn');
const resetBtn = $('resetBtn');
const undoBtn = $('undoBtn');
const redoBtn = $('redoBtn');
const toolButtons = [...document.querySelectorAll('[data-tool]')];

let image = null;
let objectUrl = '';
let fileName = 'image.png';
let tool = 'brush';
let zoom = 1;
let drawing = false;
let startPoint = null;
let lastPoint = null;
let originalImageData = null;
let undoStack = [];
let redoStack = [];

function setEnabled(enabled) {
  [exportBtn, resetBtn, brushSize, zoomRange, ...toolButtons].forEach(el => el.disabled = !enabled);
  updateHistoryButtons();
}

function updateHistoryButtons() {
  undoBtn.disabled = !image || undoStack.length === 0;
  redoBtn.disabled = !image || redoStack.length === 0;
}

function snapshot() {
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function restore(imageData) {
  ctx.putImageData(imageData, 0, 0);
}

function pushUndo() {
  undoStack.push(snapshot());
  if (undoStack.length > 30) undoStack.shift();
  redoStack = [];
  updateHistoryButtons();
}

function pointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height
  };
}

function drawWhiteLine(a, b) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = Number(brushSize.value);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.restore();
}

function drawWhiteDot(p) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, Number(brushSize.value) / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function showRectPreview(a, b) {
  const left = Math.min(a.x, b.x) * zoom;
  const top = Math.min(a.y, b.y) * zoom;
  const width = Math.abs(b.x - a.x) * zoom;
  const height = Math.abs(b.y - a.y) * zoom;
  rectPreview.hidden = false;
  rectPreview.style.left = `${left}px`;
  rectPreview.style.top = `${top}px`;
  rectPreview.style.width = `${width}px`;
  rectPreview.style.height = `${height}px`;
}

function hideRectPreview() {
  rectPreview.hidden = true;
}

function applyWhiteRect(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.abs(b.x - a.x);
  const h = Math.abs(b.y - a.y);
  if (w < 1 || h < 1) return;
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

function setZoom() {
  if (!image) return;
  stage.style.width = `${Math.round(canvas.width * zoom)}px`;
  stage.style.height = `${Math.round(canvas.height * zoom)}px`;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
}

function loadPng(file) {
  if (!file || file.type !== 'image/png') {
    $('fileStatus').textContent = 'Seleziona un PNG valido.';
    return;
  }
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    image = img;
    fileName = file.name;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    originalImageData = snapshot();
    undoStack = [];
    redoStack = [];
    zoom = 1;
    zoomRange.value = 100;
    brushSize.value = Math.max(5, Math.min(500, Math.round(Math.min(img.naturalWidth, img.naturalHeight) * 0.02)));
    brushLabel.textContent = `${brushSize.value} px`;
    $('fileStatus').textContent = fileName;
    $('resolutionStatus').textContent = `${img.naturalWidth} × ${img.naturalHeight} px · output invariato`;
    emptyState.hidden = true;
    viewport.hidden = false;
    setEnabled(true);
    setZoom();
  };
  img.onerror = () => $('fileStatus').textContent = 'Impossibile leggere il PNG.';
  img.src = objectUrl;
}

fileInput.addEventListener('change', event => loadPng(event.target.files?.[0]));

toolButtons.forEach(button => button.addEventListener('click', () => {
  tool = button.dataset.tool;
  toolButtons.forEach(item => item.classList.toggle('active', item === button));
}));

brushSize.addEventListener('input', () => {
  brushLabel.textContent = `${brushSize.value} px`;
});

zoomRange.addEventListener('input', () => {
  zoom = Number(zoomRange.value) / 100;
  setZoom();
});

canvas.addEventListener('pointerdown', event => {
  if (!image) return;
  event.preventDefault();
  drawing = true;
  canvas.setPointerCapture(event.pointerId);
  startPoint = pointFromEvent(event);
  lastPoint = startPoint;
  pushUndo();
  if (tool === 'brush') drawWhiteDot(startPoint);
  else showRectPreview(startPoint, startPoint);
});

canvas.addEventListener('pointermove', event => {
  if (!drawing || !image) return;
  const point = pointFromEvent(event);
  if (tool === 'brush') {
    drawWhiteLine(lastPoint, point);
    lastPoint = point;
  } else {
    showRectPreview(startPoint, point);
  }
});

function finishDrawing(event) {
  if (!drawing || !image) return;
  drawing = false;
  try { canvas.releasePointerCapture(event.pointerId); } catch (_) {}
  const endPoint = pointFromEvent(event);
  if (tool === 'rect') {
    applyWhiteRect(startPoint, endPoint);
    hideRectPreview();
  }
  startPoint = null;
  lastPoint = null;
  updateHistoryButtons();
}

canvas.addEventListener('pointerup', finishDrawing);
canvas.addEventListener('pointercancel', event => {
  if (!drawing) return;
  drawing = false;
  hideRectPreview();
  if (undoStack.length) restore(undoStack.pop());
  startPoint = null;
  lastPoint = null;
  updateHistoryButtons();
});

undoBtn.addEventListener('click', () => {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
  updateHistoryButtons();
});

redoBtn.addEventListener('click', () => {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
  updateHistoryButtons();
});

resetBtn.addEventListener('click', () => {
  if (!image || !originalImageData) return;
  pushUndo();
  restore(originalImageData);
  hideRectPreview();
  updateHistoryButtons();
});

exportBtn.addEventListener('click', () => {
  if (!image) return;
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.png$/i, '') + '-white.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
});

window.addEventListener('keydown', event => {
  if (!(event.metaKey || event.ctrlKey)) return;
  if (event.key.toLowerCase() === 'z' && !event.shiftKey) {
    event.preventDefault();
    undoBtn.click();
  } else if ((event.key.toLowerCase() === 'z' && event.shiftKey) || event.key.toLowerCase() === 'y') {
    event.preventDefault();
    redoBtn.click();
  }
});

setEnabled(false);

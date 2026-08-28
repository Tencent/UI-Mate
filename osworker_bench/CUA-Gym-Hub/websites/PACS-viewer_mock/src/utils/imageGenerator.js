/**
 * Procedural medical image generators for XACS Viewer mock.
 * Each function renders to a canvas at the given resolution.
 */

const imageCache = new Map();

function getCacheKey(type, instanceNumber, totalInstances) {
  return `${type}_${instanceNumber}_${totalInstances}`;
}

// Seeded random for reproducible noise
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function addNoise(ctx, width, height, intensity, seed) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const rng = seededRandom(seed);
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng() - 0.5) * intensity;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

function fillEllipse(ctx, cx, cy, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function strokeEllipse(ctx, cx, cy, rx, ry, color, lw) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function gray(v) {
  const c = Math.round(Math.max(0, Math.min(255, v)));
  return `rgb(${c},${c},${c})`;
}

export function generateCtAxialHead(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances; // 0 to 1 (top to bottom of head)

  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Skull outer (bone - bright)
  const skullRx = w * 0.38 * (0.7 + 0.3 * Math.sin(t * Math.PI));
  const skullRy = h * 0.42 * (0.7 + 0.3 * Math.sin(t * Math.PI));

  if (t > 0.15 && t < 0.85) {
    // Skull bone ring
    fillEllipse(ctx, cx, cy, skullRx, skullRy, gray(180));
    // Inner skull (CSF/brain area)
    fillEllipse(ctx, cx, cy, skullRx * 0.92, skullRy * 0.92, gray(30));

    // Brain tissue
    const brainRx = skullRx * 0.88;
    const brainRy = skullRy * 0.88;
    fillEllipse(ctx, cx, cy, brainRx, brainRy, gray(45));

    // Gray matter (cortex) - slightly brighter
    fillEllipse(ctx, cx, cy, brainRx * 0.95, brainRy * 0.95, gray(40));

    // Falx cerebri (midline)
    ctx.beginPath();
    ctx.moveTo(cx, cy - brainRy);
    ctx.lineTo(cx, cy + brainRy * 0.6);
    ctx.strokeStyle = gray(60);
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ventricles - vary by slice position
    if (t > 0.35 && t < 0.65) {
      const ventSize = 0.15 + 0.1 * Math.sin((t - 0.35) / 0.3 * Math.PI);
      // Left ventricle
      fillEllipse(ctx, cx - w * 0.06, cy - h * 0.02, w * ventSize * 0.3, h * ventSize * 0.15, gray(10));
      // Right ventricle
      fillEllipse(ctx, cx + w * 0.06, cy - h * 0.02, w * ventSize * 0.3, h * ventSize * 0.15, gray(10));
    }

    // White matter tracts
    if (t > 0.3 && t < 0.7) {
      fillEllipse(ctx, cx - w * 0.15, cy + h * 0.05, w * 0.08, h * 0.12, gray(50));
      fillEllipse(ctx, cx + w * 0.15, cy + h * 0.05, w * 0.08, h * 0.12, gray(50));
    }

    // Cerebellum (lower slices)
    if (t > 0.6) {
      const cerebFactor = (t - 0.6) / 0.25;
      fillEllipse(ctx, cx, cy + h * 0.2, w * 0.2 * cerebFactor, h * 0.12 * cerebFactor, gray(48));
    }
  }

  addNoise(ctx, w, h, 8, instanceNumber * 1000 + 1);
}

export function generateCtAxialChest(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Body outline
  const bodyRx = w * 0.4;
  const bodyRy = h * 0.35;
  fillEllipse(ctx, cx, cy, bodyRx, bodyRy, gray(60));

  // Lung fields (dark)
  const lungSize = 0.6 + 0.4 * Math.sin(t * Math.PI);
  const lungRx = w * 0.13 * lungSize;
  const lungRy = h * 0.22 * lungSize;
  // Left lung
  fillEllipse(ctx, cx - w * 0.15, cy - h * 0.02, lungRx, lungRy, gray(5));
  // Right lung
  fillEllipse(ctx, cx + w * 0.15, cy - h * 0.02, lungRx * 1.05, lungRy, gray(5));

  // Mediastinum (central bright area)
  fillEllipse(ctx, cx, cy, w * 0.07, h * 0.15, gray(80));

  // Aorta
  if (t > 0.2 && t < 0.8) {
    fillEllipse(ctx, cx - w * 0.02, cy - h * 0.05, w * 0.025, h * 0.025, gray(120));
  }

  // Spine (posterior bright circle)
  fillEllipse(ctx, cx, cy + h * 0.2, w * 0.035, h * 0.035, gray(200));

  // Ribs (bright arcs)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const angle = -0.3 + i * 0.25;
      const ribX = cx + side * w * (0.25 + i * 0.05);
      const ribY = cy - h * 0.1 + i * h * 0.08;
      ctx.beginPath();
      ctx.arc(ribX, ribY, w * 0.15, angle, angle + 0.5);
      ctx.strokeStyle = gray(180);
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // Skin line
  strokeEllipse(ctx, cx, cy, bodyRx, bodyRy, gray(100), 2);

  addNoise(ctx, w, h, 10, instanceNumber * 1000 + 2);
}

export function generateCtAxialAbdomen(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Body outline (larger than chest)
  const bodyRx = w * 0.42;
  const bodyRy = h * 0.38;
  fillEllipse(ctx, cx, cy, bodyRx, bodyRy, gray(50));

  // Liver (upper right, bright)
  if (t < 0.6) {
    const liverFactor = 1 - t * 0.5;
    fillEllipse(ctx, cx + w * 0.12, cy - h * 0.08, w * 0.18 * liverFactor, h * 0.12 * liverFactor, gray(70));
  }

  // Spleen (upper left)
  if (t < 0.5) {
    fillEllipse(ctx, cx - w * 0.22, cy - h * 0.05, w * 0.06, h * 0.08, gray(65));
  }

  // Kidneys
  if (t > 0.3 && t < 0.7) {
    const kidneyFactor = Math.sin((t - 0.3) / 0.4 * Math.PI);
    fillEllipse(ctx, cx - w * 0.2, cy + h * 0.05, w * 0.04 * kidneyFactor, h * 0.08 * kidneyFactor, gray(75));
    fillEllipse(ctx, cx + w * 0.2, cy + h * 0.05, w * 0.04 * kidneyFactor, h * 0.08 * kidneyFactor, gray(75));
  }

  // Aorta
  fillEllipse(ctx, cx - w * 0.01, cy + h * 0.02, w * 0.02, h * 0.02, gray(100));

  // Spine
  fillEllipse(ctx, cx, cy + h * 0.22, w * 0.04, h * 0.04, gray(200));

  // Bowel loops (various density circles)
  const rng = seededRandom(instanceNumber * 100 + 3);
  for (let i = 0; i < 8; i++) {
    const bx = cx + (rng() - 0.5) * w * 0.3;
    const by = cy + (rng() - 0.5) * h * 0.15;
    const br = w * (0.015 + rng() * 0.025);
    fillEllipse(ctx, bx, by, br, br * 0.8, gray(35 + rng() * 30));
  }

  // Subcutaneous fat layer
  strokeEllipse(ctx, cx, cy, bodyRx * 0.95, bodyRy * 0.95, gray(70), 4);

  // Skin outline
  strokeEllipse(ctx, cx, cy, bodyRx, bodyRy, gray(90), 2);

  addNoise(ctx, w, h, 8, instanceNumber * 1000 + 3);
}

export function generateMrAxialBrain(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  if (t < 0.1 || t > 0.9) return;

  const sizeFactor = 0.6 + 0.4 * Math.sin(t * Math.PI);

  // Skull (dark on MR)
  const skullRx = w * 0.4 * sizeFactor;
  const skullRy = h * 0.42 * sizeFactor;
  fillEllipse(ctx, cx, cy, skullRx, skullRy, gray(20));

  // Brain parenchyma (brighter on MR T1)
  const brainRx = skullRx * 0.9;
  const brainRy = skullRy * 0.9;
  fillEllipse(ctx, cx, cy, brainRx, brainRy, gray(120));

  // Gray matter cortex (brighter on T1)
  for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
    const gx = cx + Math.cos(angle) * brainRx * 0.85;
    const gy = cy + Math.sin(angle) * brainRy * 0.85;
    fillEllipse(ctx, gx, gy, w * 0.03, h * 0.03, gray(140));
  }

  // White matter (slightly less bright)
  fillEllipse(ctx, cx, cy, brainRx * 0.7, brainRy * 0.7, gray(160));

  // Ventricles (CSF - dark on T1, bright on T2)
  if (t > 0.3 && t < 0.65) {
    const ventSize = Math.sin((t - 0.3) / 0.35 * Math.PI);
    fillEllipse(ctx, cx - w * 0.05, cy - h * 0.01, w * 0.04 * ventSize, h * 0.025 * ventSize, gray(30));
    fillEllipse(ctx, cx + w * 0.05, cy - h * 0.01, w * 0.04 * ventSize, h * 0.025 * ventSize, gray(30));
  }

  // Falx
  ctx.beginPath();
  ctx.moveTo(cx, cy - brainRy);
  ctx.lineTo(cx, cy + brainRy * 0.5);
  ctx.strokeStyle = gray(60);
  ctx.lineWidth = 1;
  ctx.stroke();

  // Scalp fat (bright ring)
  strokeEllipse(ctx, cx, cy, skullRx * 1.05, skullRy * 1.05, gray(200), 3);

  addNoise(ctx, w, h, 12, instanceNumber * 1000 + 4);
}

export function generateXrChestPa(canvas, instanceNumber, _totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');

  // X-ray has overall gray background (penetrated radiation)
  ctx.fillStyle = gray(200);
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Body outline (darker than background)
  fillEllipse(ctx, cx, cy + h * 0.05, w * 0.4, h * 0.45, gray(160));

  // Lung fields (dark/lucent)
  fillEllipse(ctx, cx - w * 0.15, cy - h * 0.05, w * 0.14, h * 0.25, gray(40));
  fillEllipse(ctx, cx + w * 0.15, cy - h * 0.05, w * 0.14, h * 0.25, gray(40));

  // Mediastinum (bright/dense)
  fillEllipse(ctx, cx, cy, w * 0.08, h * 0.2, gray(180));

  // Heart shadow
  fillEllipse(ctx, cx - w * 0.03, cy + h * 0.08, w * 0.1, h * 0.12, gray(180));

  // Spine (bright vertical line)
  ctx.fillStyle = gray(190);
  ctx.fillRect(cx - w * 0.015, cy - h * 0.3, w * 0.03, h * 0.6);

  // Ribs
  for (let i = 0; i < 6; i++) {
    const ribY = cy - h * 0.2 + i * h * 0.07;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(cx + side * w * 0.02, ribY);
      ctx.quadraticCurveTo(cx + side * w * 0.18, ribY + h * 0.02, cx + side * w * 0.3, ribY + h * 0.04);
      ctx.strokeStyle = gray(180);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  // Clavicles
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(cx + side * w * 0.02, cy - h * 0.28);
    ctx.quadraticCurveTo(cx + side * w * 0.15, cy - h * 0.3, cx + side * w * 0.28, cy - h * 0.26);
    ctx.strokeStyle = gray(200);
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Diaphragm
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + h * 0.15);
    ctx.quadraticCurveTo(cx + side * w * 0.15, cy + h * 0.12, cx + side * w * 0.3, cy + h * 0.2);
    ctx.strokeStyle = gray(150);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  addNoise(ctx, w, h, 6, (instanceNumber || 1) * 1000 + 5);
}

export function generateXrChestLateral(canvas, instanceNumber, _totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = gray(200);
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Body outline (lateral view)
  fillEllipse(ctx, cx, cy + h * 0.05, w * 0.3, h * 0.45, gray(150));

  // Lung field overlap (darker)
  fillEllipse(ctx, cx - w * 0.03, cy - h * 0.05, w * 0.18, h * 0.25, gray(50));

  // Spine (posterior, bright column)
  ctx.fillStyle = gray(190);
  ctx.fillRect(cx + w * 0.08, cy - h * 0.3, w * 0.06, h * 0.6);

  // Sternum (anterior)
  ctx.fillStyle = gray(180);
  ctx.fillRect(cx - w * 0.2, cy - h * 0.25, w * 0.03, h * 0.35);

  // Heart shadow
  fillEllipse(ctx, cx - w * 0.05, cy + h * 0.08, w * 0.12, h * 0.12, gray(170));

  addNoise(ctx, w, h, 6, (instanceNumber || 1) * 1000 + 6);
}

export function generateUsAbdomen(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = (instanceNumber || 1) / (totalInstances || 1);

  // Black background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;

  // Fan/sector shape
  const fanTop = h * 0.05;
  const fanBottom = h * 0.85;
  const fanWidth = w * 0.7;

  ctx.beginPath();
  ctx.moveTo(cx, fanTop);
  ctx.lineTo(cx - fanWidth / 2, fanBottom);
  ctx.lineTo(cx + fanWidth / 2, fanBottom);
  ctx.closePath();
  ctx.fillStyle = gray(30);
  ctx.fill();

  // Speckle texture (characteristic of ultrasound)
  const rng = seededRandom(instanceNumber * 100 + 7);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (data[idx] > 0 || data[idx+1] > 0 || data[idx+2] > 0) {
        // Inside fan - add speckle
        const baseVal = data[idx];
        const speckle = (rng() - 0.3) * 60 + baseVal;
        const depth = (y - fanTop) / (fanBottom - fanTop);
        const attenuation = 1 - depth * 0.3;
        const val = Math.max(0, Math.min(255, speckle * attenuation));
        data[idx] = val;
        data[idx+1] = val;
        data[idx+2] = val;
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Some organ-like bright structures
  const organY = h * (0.3 + t * 0.2);
  fillEllipse(ctx, cx + w * 0.05, organY, w * 0.12, h * 0.08, gray(70 + t * 30));

  // Vessel (dark circle)
  fillEllipse(ctx, cx - w * 0.08, h * 0.45, w * 0.03, h * 0.03, gray(5));

  // Depth scale markers on right
  ctx.fillStyle = gray(100);
  for (let i = 0; i < 5; i++) {
    const my = fanTop + (fanBottom - fanTop) * i / 4;
    ctx.fillRect(w - 20, my - 1, 15, 2);
    ctx.font = '10px monospace';
    ctx.fillText(`${i * 4}`, w - 38, my + 4);
  }

  addNoise(ctx, w, h, 15, instanceNumber * 1000 + 7);
}

export function generateMrSagittalBrain(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.45;

  // Show midline structures more in middle slices
  const midFactor = 1 - Math.abs(t - 0.5) * 2;

  // Skull
  fillEllipse(ctx, cx, cy, w * 0.38, h * 0.4, gray(20));

  // Brain
  fillEllipse(ctx, cx, cy, w * 0.34, h * 0.36, gray(130));

  // Cerebellum (posterior inferior)
  fillEllipse(ctx, cx + w * 0.05, cy + h * 0.2, w * 0.12, h * 0.1, gray(140));

  // Corpus callosum (bright arc in midline)
  if (midFactor > 0.5) {
    ctx.beginPath();
    ctx.arc(cx, cy - h * 0.05, w * 0.15, Math.PI * 1.1, Math.PI * 1.9);
    ctx.strokeStyle = gray(200);
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Brainstem
  fillEllipse(ctx, cx + w * 0.02, cy + h * 0.15, w * 0.04, h * 0.1, gray(110));

  // Ventricle (dark, in midline)
  if (midFactor > 0.6) {
    fillEllipse(ctx, cx, cy - h * 0.02, w * 0.1, h * 0.04, gray(30));
  }

  // Scalp
  strokeEllipse(ctx, cx, cy, w * 0.4, h * 0.42, gray(200), 3);

  addNoise(ctx, w, h, 10, instanceNumber * 1000 + 8);
}

export function generateMrCoronalBrain(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.4;

  const sizeFactor = 0.7 + 0.3 * Math.sin(t * Math.PI);

  // Skull
  fillEllipse(ctx, cx, cy, w * 0.38 * sizeFactor, h * 0.35 * sizeFactor, gray(20));

  // Brain
  const brainRx = w * 0.34 * sizeFactor;
  const brainRy = h * 0.31 * sizeFactor;
  fillEllipse(ctx, cx, cy, brainRx, brainRy, gray(130));

  // Midline fissure
  ctx.beginPath();
  ctx.moveTo(cx, cy - brainRy);
  ctx.lineTo(cx, cy + brainRy * 0.3);
  ctx.strokeStyle = gray(50);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Ventricles (coronal view - butterfly shape)
  if (t > 0.3 && t < 0.7) {
    const vf = Math.sin((t - 0.3) / 0.4 * Math.PI);
    fillEllipse(ctx, cx - w * 0.06, cy, w * 0.04 * vf, h * 0.06 * vf, gray(30));
    fillEllipse(ctx, cx + w * 0.06, cy, w * 0.04 * vf, h * 0.06 * vf, gray(30));
  }

  // Gray matter cortical ribbon
  strokeEllipse(ctx, cx, cy, brainRx * 0.92, brainRy * 0.92, gray(150), 6);

  // Scalp
  strokeEllipse(ctx, cx, cy, w * 0.4 * sizeFactor, h * 0.37 * sizeFactor, gray(200), 3);

  addNoise(ctx, w, h, 10, instanceNumber * 1000 + 9);
}

export function generateCtCoronalChest(canvas, instanceNumber, totalInstances) {
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  const t = instanceNumber / totalInstances;

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;

  // Body outline
  fillEllipse(ctx, cx, cy, w * 0.4, h * 0.45, gray(55));

  // Lungs from coronal
  const lungH = h * 0.3;
  const lungW = w * 0.12;
  fillEllipse(ctx, cx - w * 0.17, cy - h * 0.05, lungW, lungH, gray(5));
  fillEllipse(ctx, cx + w * 0.17, cy - h * 0.05, lungW, lungH, gray(5));

  // Mediastinum
  fillEllipse(ctx, cx, cy - h * 0.05, w * 0.06, h * 0.2, gray(80));

  // Diaphragm line
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.35, cy + h * 0.2);
  ctx.quadraticCurveTo(cx, cy + h * 0.15, cx + w * 0.35, cy + h * 0.2);
  ctx.strokeStyle = gray(100);
  ctx.lineWidth = 2;
  ctx.stroke();

  // Spine
  ctx.fillStyle = gray(200);
  ctx.fillRect(cx - w * 0.02, cy - h * 0.3, w * 0.04, h * 0.6);

  addNoise(ctx, w, h, 8, instanceNumber * 1000 + 10);
}

const generators = {
  ct_axial_head: generateCtAxialHead,
  ct_axial_chest: generateCtAxialChest,
  ct_axial_abdomen: generateCtAxialAbdomen,
  ct_coronal_chest: generateCtCoronalChest,
  mr_axial_brain: generateMrAxialBrain,
  mr_sagittal_brain: generateMrSagittalBrain,
  mr_coronal_brain: generateMrCoronalBrain,
  xr_chest_pa: generateXrChestPa,
  xr_chest_lateral: generateXrChestLateral,
  us_abdomen: generateUsAbdomen,
};

/**
 * Generate a medical image on the given canvas.
 * Returns the canvas for chaining.
 */
export function generateImage(canvas, thumbnailType, instanceNumber, totalInstances) {
  const gen = generators[thumbnailType];
  if (gen) {
    gen(canvas, instanceNumber, totalInstances);
  } else {
    // Fallback: gray noise
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = gray(30);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    addNoise(ctx, canvas.width, canvas.height, 20, instanceNumber * 1000);
  }
  return canvas;
}

/**
 * Get or generate a cached raw image as ImageData.
 * The raw image is before windowing - stored as grayscale 0-255.
 */
export function getRawImage(thumbnailType, instanceNumber, totalInstances, width, height) {
  const key = `${thumbnailType}_${instanceNumber}_${totalInstances}_${width}_${height}`;
  if (imageCache.has(key)) {
    return imageCache.get(key);
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  generateImage(offscreen, thumbnailType, instanceNumber, totalInstances);
  const imageData = offscreen.getContext('2d').getImageData(0, 0, width, height);

  // Limit cache size
  if (imageCache.size > 100) {
    const firstKey = imageCache.keys().next().value;
    imageCache.delete(firstKey);
  }

  imageCache.set(key, imageData);
  return imageData;
}

/**
 * Apply window/level, invert, and render to display canvas.
 */
export function applyWindowLevel(sourceImageData, destCtx, windowCenter, windowWidth, invert) {
  const w = sourceImageData.width;
  const h = sourceImageData.height;
  const src = sourceImageData.data;
  const destImageData = destCtx.createImageData(w, h);
  const dest = destImageData.data;

  const lower = windowCenter - windowWidth / 2;

  for (let i = 0; i < src.length; i += 4) {
    let val = ((src[i] - lower) / windowWidth) * 255;
    val = Math.max(0, Math.min(255, val));
    if (invert) val = 255 - val;
    dest[i] = val;
    dest[i+1] = val;
    dest[i+2] = val;
    dest[i+3] = 255;
  }

  destCtx.putImageData(destImageData, 0, 0);
}

export function clearImageCache() {
  imageCache.clear();
}

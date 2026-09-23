const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const JSON_CHUNK_TYPE = 0x4e4f534a;
const CALIBRATION_NODE_NAME = 'IDEALTECH_REAL_SIZE_CALIBRATION';

type GlbChunk = {
  type: number;
  bytes: Uint8Array;
};

function paddedLength(length: number) {
  return (length + 3) & ~3;
}

/**
 * Bakes a uniform real-size correction into the GLB scene graph without
 * touching mesh buffers, materials or textures. This is important because
 * native AR viewers (Scene Viewer / Quick Look) receive the GLB itself.
 *
 * `scaleFactor` is relative to the dimensions currently reported by the GLB.
 * Example: GLB reports 56 m but real machine is 5.6 m -> factor 0.1.
 */
export async function scaleGlbToRealSize(
  file: File,
  scaleFactor: number,
  realDimensionsMm?: [number, number, number],
): Promise<File> {
  if (!Number.isFinite(scaleFactor) || scaleFactor <= 0) {
    throw new Error('Fattore di scala non valido.');
  }

  // No rewrite necessary if the model is already correctly scaled.
  if (Math.abs(scaleFactor - 1) < 0.000001) return file;

  const source = await file.arrayBuffer();
  const view = new DataView(source);

  if (source.byteLength < 20 || view.getUint32(0, true) !== GLB_MAGIC) {
    throw new Error('Il file selezionato non è un GLB valido.');
  }
  if (view.getUint32(4, true) !== GLB_VERSION) {
    throw new Error('Versione GLB non supportata: è richiesto glTF/GLB 2.0.');
  }

  const declaredLength = view.getUint32(8, true);
  if (declaredLength > source.byteLength) {
    throw new Error('GLB incompleto o danneggiato.');
  }

  const chunks: GlbChunk[] = [];
  let offset = 12;
  while (offset + 8 <= declaredLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    const start = offset + 8;
    const end = start + length;
    if (end > declaredLength) throw new Error('Struttura GLB non valida.');
    chunks.push({ type, bytes: new Uint8Array(source.slice(start, end)) });
    offset = end;
  }

  const jsonIndex = chunks.findIndex(chunk => chunk.type === JSON_CHUNK_TYPE);
  if (jsonIndex < 0) throw new Error('Chunk JSON non trovato nel GLB.');

  const decoder = new TextDecoder();
  const rawJson = decoder.decode(chunks[jsonIndex].bytes).replace(/[\u0000\u0020]+$/g, '');
  const gltf = JSON.parse(rawJson) as {
    nodes?: Array<Record<string, unknown>>;
    scenes?: Array<{ nodes?: number[]; [key: string]: unknown }>;
    extras?: Record<string, unknown>;
  };

  gltf.nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  gltf.scenes = Array.isArray(gltf.scenes) ? gltf.scenes : [];

  for (const scene of gltf.scenes) {
    const roots = Array.isArray(scene.nodes) ? [...scene.nodes] : [];
    if (!roots.length) continue;
    const wrapperIndex = gltf.nodes.length;
    gltf.nodes.push({
      name: CALIBRATION_NODE_NAME,
      scale: [scaleFactor, scaleFactor, scaleFactor],
      children: roots,
    });
    scene.nodes = [wrapperIndex];
  }

  gltf.extras = {
    ...(gltf.extras || {}),
    idealtechRealSizeCalibrated: true,
    idealtechAppliedScaleFactor: scaleFactor,
    ...(realDimensionsMm ? { idealtechRealDimensionsMm: realDimensionsMm } : {}),
  };

  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(JSON.stringify(gltf));
  const jsonPaddedLength = paddedLength(jsonBytes.length);
  const normalizedJson = new Uint8Array(jsonPaddedLength);
  normalizedJson.fill(0x20);
  normalizedJson.set(jsonBytes);
  chunks[jsonIndex] = { type: JSON_CHUNK_TYPE, bytes: normalizedJson };

  const totalLength = 12 + chunks.reduce((sum, chunk) => sum + 8 + paddedLength(chunk.bytes.length), 0);
  const result = new ArrayBuffer(totalLength);
  const out = new DataView(result);
  out.setUint32(0, GLB_MAGIC, true);
  out.setUint32(4, GLB_VERSION, true);
  out.setUint32(8, totalLength, true);

  let writeOffset = 12;
  for (const chunk of chunks) {
    const length = paddedLength(chunk.bytes.length);
    out.setUint32(writeOffset, length, true);
    out.setUint32(writeOffset + 4, chunk.type, true);
    const target = new Uint8Array(result, writeOffset + 8, length);
    target.set(chunk.bytes);
    writeOffset += 8 + length;
  }

  return new File([result], file.name, { type: 'model/gltf-binary', lastModified: Date.now() });
}

// Kept for compatibility with any older imports.
export async function normalizeGlbMillimetersToMeters(file: File): Promise<File> {
  return scaleGlbToRealSize(file, 0.001);
}

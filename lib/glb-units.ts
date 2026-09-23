const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const JSON_CHUNK_TYPE = 0x4e4f534a;
const MM_TO_M = 0.001;
const NORMALIZER_NODE_NAME = 'IDEALTECH_MM_TO_M_NORMALIZER';

type GlbChunk = {
  type: number;
  bytes: Uint8Array;
};

function paddedLength(length: number) {
  return (length + 3) & ~3;
}

/**
 * glTF uses metres. CAD/STL workflows commonly keep vertex coordinates in mm.
 * This function wraps every glTF scene in a 0.001 root transform without
 * touching meshes, textures or binary buffers. The resulting GLB is therefore
 * natively correct for Scene Viewer / Quick Look as well as the web viewer.
 */
export async function normalizeGlbMillimetersToMeters(file: File): Promise<File> {
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
    asset?: Record<string, unknown>;
    nodes?: Array<Record<string, unknown>>;
    scenes?: Array<{ nodes?: number[]; [key: string]: unknown }>;
    extras?: Record<string, unknown>;
  };

  gltf.nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  gltf.scenes = Array.isArray(gltf.scenes) ? gltf.scenes : [];

  // Avoid multiplying the scale if a previously-normalized GLB is uploaded again.
  const alreadyNormalized = gltf.nodes.some(node => node?.name === NORMALIZER_NODE_NAME);
  if (!alreadyNormalized) {
    for (const scene of gltf.scenes) {
      const roots = Array.isArray(scene.nodes) ? [...scene.nodes] : [];
      if (!roots.length) continue;
      const wrapperIndex = gltf.nodes.length;
      gltf.nodes.push({
        name: NORMALIZER_NODE_NAME,
        scale: [MM_TO_M, MM_TO_M, MM_TO_M],
        children: roots,
      });
      scene.nodes = [wrapperIndex];
    }
  }

  gltf.extras = {
    ...(gltf.extras || {}),
    idealtechSourceUnits: 'mm',
    idealtechGlbUnits: 'm',
    idealtechUnitScale: MM_TO_M,
  };

  const encoder = new TextEncoder();
  const jsonBytes = encoder.encode(JSON.stringify(gltf));
  const jsonPaddedLength = paddedLength(jsonBytes.length);
  const normalizedJson = new Uint8Array(jsonPaddedLength);
  normalizedJson.fill(0x20); // JSON GLB padding must be spaces.
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
    // BIN chunks conventionally use zero padding, JSON was already padded with spaces.
    writeOffset += 8 + length;
  }

  const outputName = file.name.replace(/\.glb$/i, '') + '.glb';
  return new File([result], outputName, { type: 'model/gltf-binary', lastModified: Date.now() });
}

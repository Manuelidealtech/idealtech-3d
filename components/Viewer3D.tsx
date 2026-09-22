'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export default function Viewer3D({ modelUrl, productName }: { modelUrl: string | null; productName: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(Boolean(modelUrl));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelUrl || !mountRef.current) return;
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f14);

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.01, 5000);
    camera.position.set(3, 2, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x344050, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8ab4ff, 2.5);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    const grid = new THREE.GridHelper(20, 20, 0x263241, 0x18202a);
    grid.position.y = -0.001;
    scene.add(grid);

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const root = gltf.scene;
        scene.add(root);
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        root.position.sub(center);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const dist = maxDim * 1.8;
        camera.position.set(dist, dist * 0.65, dist);
        camera.near = Math.max(maxDim / 1000, 0.01);
        camera.far = maxDim * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.update();
        grid.position.y = -size.y / 2;
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error(err);
        setError('Impossibile caricare il modello 3D. Verifica che il file sia un GLB valido.');
        setLoading(false);
      }
    );

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, [modelUrl]);

  if (!modelUrl) {
    return (
      <div className="viewerPlaceholder">
        <div className="placeholderMachine"><span></span><span></span><span></span></div>
        <div>
          <strong>{productName}</strong>
          <p>Viewer pronto. Carica un file .GLB dal portale admin per visualizzare il modello reale.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="viewerShell">
      <div ref={mountRef} className="viewerCanvas" />
      {loading && <div className="viewerOverlay"><div className="spinner" />Caricamento modello 3D…</div>}
      {error && <div className="viewerOverlay errorBox">{error}</div>}
      <div className="viewerHint">Trascina per ruotare · rotella per zoom · tasto destro per spostare</div>
    </div>
  );
}

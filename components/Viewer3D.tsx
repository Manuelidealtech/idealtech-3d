'use client';

import React, { useEffect, useRef, useState } from 'react';

type Dimensions = { x: number; y: number; z: number };
type ModelViewerLike = HTMLElement & {
  getDimensions?: () => Dimensions;
  canActivateAR?: boolean;
  activateAR?: () => Promise<void>;
  loaded?: boolean;
};

function formatDimensions(dims: Dimensions) {
  const max = Math.max(dims.x, dims.y, dims.z);
  if (max < 1) {
    return `${Math.round(dims.x * 100)} × ${Math.round(dims.y * 100)} × ${Math.round(dims.z * 100)} cm`;
  }
  return `${dims.x.toFixed(2)} × ${dims.y.toFixed(2)} × ${dims.z.toFixed(2)} m`;
}

export default function Viewer3D({ modelUrl, productName }: { modelUrl: string | null; productName: string }) {
  const viewerRef = useRef<ModelViewerLike | null>(null);
  const [libraryReady, setLibraryReady] = useState(false);
  const [loading, setLoading] = useState(Boolean(modelUrl));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [arSupported, setArSupported] = useState<boolean | null>(null);
  const [arMessage, setArMessage] = useState<string | null>(null);
  const [scaleWarning, setScaleWarning] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    import('@google/model-viewer')
      .then(() => { if (active) setLibraryReady(true); })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError('Impossibile inizializzare il visualizzatore 3D.');
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!modelUrl) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    setLoading(true);
    setProgress(0);
    setError(null);
    setDimensions(null);
    setArMessage(null);
    setScaleWarning(null);

    const updateModelInfo = () => {
      try {
        const dims = viewer.getDimensions?.();
        if (dims && Number.isFinite(dims.x) && Number.isFinite(dims.y) && Number.isFinite(dims.z)) {
          const measured = { x: dims.x, y: dims.y, z: dims.z };
          setDimensions(measured);
          const maxDimension = Math.max(measured.x, measured.y, measured.z);
          if (maxDimension > 100) {
            setScaleWarning('Scala GLB anomala per la realtà aumentata. Ricarica il file dall’admin selezionando “Millimetri (CAD/STL)”.');
          } else if (maxDimension > 0 && maxDimension < 0.02) {
            setScaleWarning('Il modello risulta molto piccolo. Controlla che il GLB sia espresso in metri.');
          } else {
            setScaleWarning(null);
          }
        }
      } catch (err) {
        console.warn('Dimensioni modello non disponibili', err);
      }
      setArSupported(Boolean(viewer.canActivateAR));
      setLoading(false);
      setProgress(100);
    };

    const onProgress = (event: Event) => {
      const detail = (event as CustomEvent<{ totalProgress?: number }>).detail;
      const total = detail?.totalProgress;
      if (typeof total === 'number') setProgress(Math.max(0, Math.min(100, Math.round(total * 100))));
    };

    const onError = (event: Event) => {
      console.error('model-viewer error', event);
      setError('Impossibile caricare il modello 3D. Verifica che il GLB sia valido e raggiungibile.');
      setLoading(false);
    };

    const onArStatus = (event: Event) => {
      const status = (event as CustomEvent<{ status?: string }>).detail?.status;
      if (status === 'failed') setArMessage('La realtà aumentata non è disponibile su questo dispositivo.');
      if (status === 'session-started') setArMessage(null);
    };

    viewer.addEventListener('load', updateModelInfo);
    viewer.addEventListener('progress', onProgress);
    viewer.addEventListener('error', onError);
    viewer.addEventListener('ar-status', onArStatus);

    if (libraryReady && viewer.loaded) updateModelInfo();

    return () => {
      viewer.removeEventListener('load', updateModelInfo);
      viewer.removeEventListener('progress', onProgress);
      viewer.removeEventListener('error', onError);
      viewer.removeEventListener('ar-status', onArStatus);
    };
  }, [modelUrl, libraryReady]);

  async function openAR() {
    const viewer = viewerRef.current;
    if (!viewer?.activateAR) {
      setArMessage('Apri questa pagina da uno smartphone compatibile per usare la realtà aumentata.');
      return;
    }
    try {
      setArMessage(null);
      await viewer.activateAR();
    } catch (err) {
      console.error(err);
      setArMessage('Non è stato possibile avviare la realtà aumentata su questo dispositivo.');
    }
  }

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

  const modelViewer = React.createElement('model-viewer', {
    ref: viewerRef,
    src: modelUrl,
    alt: `Modello 3D ${productName}`,
    ar: true,
    // Native AR first: Scene Viewer / Quick Look give a more stable product-placement UX.
    // WebXR remains as fallback for compatible devices.
    'ar-modes': 'scene-viewer quick-look webxr',
    'ar-scale': 'fixed',
    'ar-placement': 'floor',
    'camera-controls': true,
    'touch-action': 'pan-y',
    'interaction-prompt': 'auto',
    'shadow-intensity': '1.2',
    'shadow-softness': '0.85',
    'tone-mapping': 'neutral',
    'xr-environment': true,
    'max-camera-orbit': 'auto 90deg auto',
    className: 'idealModelViewer',
  });

  return (
    <div className="viewerShell arViewerShell">
      {modelViewer}

      {loading && (
        <div className="viewerOverlay">
          <div className="spinner" />
          <div className="viewerLoadingText">
            <strong>Caricamento modello 3D…</strong>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {error && <div className="viewerOverlay errorBox">{error}</div>}

      {!loading && !error && (
        <>
          <div className="viewerTopBadges">
            <span className="viewerBadge liveBadge"><i />3D LIVE</span>
            {dimensions && <span className="viewerBadge">Ingombro: {formatDimensions(dimensions)}</span>}
            <span className="viewerBadge">Scala AR 1:1</span>
          </div>

          <div className="viewerBottomBar">
            <div className="viewerHint">Trascina per ruotare · pizzica/rotella per zoom</div>
            {arSupported && !scaleWarning ? (
              <button type="button" className="arLaunchButton" onClick={openAR}>
                <span className="arCameraIcon" aria-hidden="true">◎</span>
                <span><small>REALTÀ AUMENTATA</small>Visualizza nel tuo spazio</span>
              </button>
            ) : (
              <div className="arUnavailableHint">
                <strong>AR</strong>
                <span>{scaleWarning ? 'Scala non valida per AR' : 'Apri da smartphone compatibile'}</span>
              </div>
            )}
          </div>

          {(arMessage || scaleWarning) && <div className="arMessage">{arMessage || scaleWarning}</div>}
        </>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Asset } from '../data/domains';

maplibregl.setWorkerUrl(workerUrl);

const KEY = import.meta.env.VITE_CARTO_KEY as string | undefined;
const STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json' + (KEY ? `?api_key=${KEY}` : '');
const COLORS = { ok: '#22c55e', aviso: '#f59e0b', critico: '#ef4444' };
const LABEL = { ok: 'Operacional', aviso: 'Aviso', critico: 'Crítico' };

export default function MapView({ assets, height = 460 }: { assets: Asset[]; height?: number }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const map = new maplibregl.Map({ container: el.current!, style: STYLE, center: [-8.6, 41.2], zoom: 4, attributionControl: { compact: true } });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    const bounds = new maplibregl.LngLatBounds();
    assets.forEach(a => {
      bounds.extend([a.lng, a.lat]);
      const m = document.createElement('div');
      const c = COLORS[a.status];
      m.style.cssText = `width:16px;height:16px;border-radius:50%;background:${c};border:2px solid rgba(255,255,255,.85);box-shadow:0 0 0 6px ${c}33,0 0 18px ${c};cursor:pointer`;
      if (a.status === 'critico') m.style.animation = 'pulse 1.4s infinite';
      new maplibregl.Marker({ element: m }).setLngLat([a.lng, a.lat])
        .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(
          `<div style="font-size:13px;min-width:180px"><div style="font-weight:600;margin-bottom:4px">${a.name}</div><div style="color:#9aa3b5;font-size:12px">${a.type}</div><div style="margin-top:8px;display:flex;gap:6px;align-items:center"><span style="width:8px;height:8px;border-radius:50%;background:${c}"></span>${LABEL[a.status]}</div><div style="margin-top:4px;font-size:12px">${a.detail}</div></div>`))
        .addTo(map);
    });
    map.on('load', () => { if (assets.length > 1) map.fitBounds(bounds, { padding: 70, maxZoom: 7, duration: 1800 }); });
    return () => map.remove();
  }, [assets]);
  return <div ref={el} style={{ height, borderRadius: 16, overflow: 'hidden' }} />;
}

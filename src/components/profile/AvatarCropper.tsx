"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./AvatarCropper.module.css";

const PREVIEW_SIZE = 340;
const OUTPUT_SIZE = 512;

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
};

type DragState = {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  pointerScale: number;
};

export default function AvatarCropper({ file, onCancel, onConfirm }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      imageRef.current = img;
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setReady(true);
    };

    img.src = objectUrl;

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function getGeometry(targetSize: number) {
    const img = imageRef.current;
    if (!img) return null;

    const baseScale = Math.max(targetSize / img.naturalWidth, targetSize / img.naturalHeight);
    const scale = baseScale * zoom;
    const width = img.naturalWidth * scale;
    const height = img.naturalHeight * scale;

    const factor = targetSize / PREVIEW_SIZE;
    const xOffset = offset.x * factor;
    const yOffset = offset.y * factor;

    return {
      width,
      height,
      x: (targetSize - width) / 2 + xOffset,
      y: (targetSize - height) / 2 + yOffset,
    };
  }

  function clampOffset(next: { x: number; y: number }, nextZoom = zoom) {
    const img = imageRef.current;
    if (!img) return next;

    const baseScale = Math.max(PREVIEW_SIZE / img.naturalWidth, PREVIEW_SIZE / img.naturalHeight);
    const width = img.naturalWidth * baseScale * nextZoom;
    const height = img.naturalHeight * baseScale * nextZoom;
    const maxX = Math.max(0, (width - PREVIEW_SIZE) / 2);
    const maxY = Math.max(0, (height - PREVIEW_SIZE) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !ready) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const geometry = getGeometry(PREVIEW_SIZE);
    if (!geometry) return;

    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    ctx.fillStyle = "#dce6ee";
    ctx.fillRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);
    ctx.drawImage(img, geometry.x, geometry.y, geometry.width, geometry.height);
  }, [zoom, offset, ready]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.getBoundingClientRect();

    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
      pointerScale: PREVIEW_SIZE / rect.width,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    const next = clampOffset({
      x: drag.offsetX + (event.clientX - drag.x) * drag.pointerScale,
      y: drag.offsetY + (event.clientY - drag.y) * drag.pointerScale,
    });

    setOffset(next);
  }

  function endDrag() {
    dragRef.current = null;
  }

  function handleZoom(nextZoom: number) {
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextZoom));
  }

  async function confirmCrop() {
    const img = imageRef.current;
    if (!img) return;

    setSaving(true);

    try {
      const output = document.createElement("canvas");
      output.width = OUTPUT_SIZE;
      output.height = OUTPUT_SIZE;
      const ctx = output.getContext("2d");
      if (!ctx) throw new Error("No se pudo preparar el recorte.");

      const geometry = getGeometry(OUTPUT_SIZE);
      if (!geometry) throw new Error("No se pudo calcular el recorte.");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, geometry.x, geometry.y, geometry.width, geometry.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        output.toBlob(
          (result) => (result ? resolve(result) : reject(new Error("No se pudo generar la imagen."))),
          "image/webp",
          0.92,
        );
      });

      const cropped = new File([blob], "avatar.webp", { type: "image/webp" });
      await onConfirm(cropped);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Ajustar foto de perfil">
      <div className={styles.modal}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Foto de perfil</p>
          <h2 className={styles.title}>Ajustá el encuadre</h2>
          <p className={styles.description}>
            Arrastrá la imagen para centrarla y usá el zoom. Este mismo recorte se va a ver en todo Liga.
          </p>
        </div>

        <div className={styles.body}>
          <div
            className={styles.cropStage}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <canvas ref={canvasRef} className={styles.canvas} width={PREVIEW_SIZE} height={PREVIEW_SIZE} />
            <div className={styles.guide} />
          </div>

          <div className={styles.controls}>
            <div className={styles.controlHeader}>
              <strong>Zoom</strong>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              className={styles.range}
              type="range"
              min="1"
              max="3"
              step="0.01"
              value={zoom}
              onChange={(event) => handleZoom(Number(event.target.value))}
              aria-label="Zoom de la foto"
            />
            <p className={styles.hint}>
              Tip: dejá un poco de aire alrededor de la cara para que funcione bien también en el avatar chico del navbar.
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.cancel} type="button" onClick={onCancel} disabled={saving}>
            Cancelar
          </button>
          <button className={styles.confirm} type="button" onClick={confirmCrop} disabled={!ready || saving}>
            {saving ? "Guardando..." : "Usar esta foto"}
          </button>
        </div>
      </div>
    </div>
  );
}

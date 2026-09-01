"use client";

import { useEffect, useState } from "react";
import { X, RotateCcw, Upload, Bold, Italic, Underline, Crop } from "lucide-react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { FONT_OPTIONS } from "@/lib/fonts";
import { PALETTE_TEMPLATES, type ThemeColors } from "./palettes";

export type TextEditor = {
  kind: "text";
  id: string;
  label: string;
  multiline: boolean;
  styleable: boolean;
  de: string;
  en: string;
  fontRem: number;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontFamily: string;
  defaultRem: number;
  defaultColor: string;
  hasOverride: boolean;
};

export type ImageEditor = {
  kind: "image";
  id: string;
  label: string;
  hint: string;
  currentSrc: string;
  isDefault: boolean;
  /** z. B. "aspect-square" für Logo — steuert nur den Vorschau-Rahmen im Popup. */
  previewAspectClassName?: string;
  /** Rundes Vorschau-Overlay + runder Zuschnitt (z. B. für das Logo). */
  round?: boolean;
  /** Breite/Höhe-Verhältnis für den Zuschnitt-Schritt, z. B. 16/9. */
  aspectRatio: number;
};

export type PaletteEditor = {
  kind: "palette";
  colors: ThemeColors;
  hasOverride: boolean;
};

export type ActiveEditor = TextEditor | ImageEditor | PaletteEditor | null;

const inputClass =
  "w-full px-3 py-[11px] border border-line rounded-[2px] font-sans text-[0.92rem] bg-bg text-ink focus:outline-2 focus:outline-gold focus:outline-offset-1";
const labelClass = "block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5";
const saveButtonClass =
  "inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const resetButtonClass =
  "inline-flex items-center gap-1.5 px-3.5 py-2 border border-line text-ink-soft font-sans text-[0.7rem] tracking-[0.06em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors";

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-[3px] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)] w-full max-w-[520px] max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-white">
      <h3 className="text-[1.05rem] m-0">{title}</h3>
      <button
        type="button"
        onClick={onClose}
        className="text-ink-soft hover:text-forest transition-colors cursor-pointer"
        aria-label="Schließen"
      >
        <X className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function TextEditPopup({
  editor,
  saving,
  onClose,
  onSave,
}: {
  editor: TextEditor;
  saving: boolean;
  onClose: () => void;
  onSave: (values: {
    de: string;
    en: string;
    fontRem: number | null;
    color: string | null;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    fontFamily: string | null;
  }) => void;
}) {
  const [de, setDe] = useState(editor.de);
  const [en, setEn] = useState(editor.en);
  const [fontRem, setFontRem] = useState(editor.fontRem);
  const [color, setColor] = useState(editor.color);
  const [bold, setBold] = useState(editor.bold);
  const [italic, setItalic] = useState(editor.italic);
  const [underline, setUnderline] = useState(editor.underline);
  const [fontFamily, setFontFamily] = useState(editor.fontFamily);
  const [styleTouched, setStyleTouched] = useState(editor.hasOverride);

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={editor.label} onClose={onClose} />
      <div className="p-6">
        <div className="grid grid-cols-2 max-[480px]:grid-cols-1 gap-3 mb-5">
          <div>
            <span className="block text-[0.65rem] text-ink-soft mb-1">Deutsch</span>
            {editor.multiline ? (
              <textarea value={de} onChange={(e) => setDe(e.target.value)} rows={3} className={inputClass} autoFocus />
            ) : (
              <input value={de} onChange={(e) => setDe(e.target.value)} className={inputClass} autoFocus />
            )}
          </div>
          <div>
            <span className="block text-[0.65rem] text-ink-soft mb-1">Englisch</span>
            {editor.multiline ? (
              <textarea value={en} onChange={(e) => setEn(e.target.value)} rows={3} className={inputClass} />
            ) : (
              <input value={en} onChange={(e) => setEn(e.target.value)} className={inputClass} />
            )}
          </div>
        </div>

        {editor.styleable && (
          <div className="border-t border-line pt-4 mt-1">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass + " mb-0"}>Schriftgröße</label>
                <span className="text-[0.75rem] text-ink-soft">{fontRem.toFixed(2)}rem</span>
              </div>
              <input
                type="range"
                min={0.65}
                max={4.5}
                step={0.01}
                value={fontRem}
                onChange={(e) => {
                  setFontRem(Number(e.target.value));
                  setStyleTouched(true);
                }}
                className="w-full accent-gold cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-between mb-4">
              <div className="flex items-center gap-3">
                <label className={labelClass + " mb-0"}>Textfarbe</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setStyleTouched(true);
                  }}
                  className="w-10 h-9 border border-line rounded-[2px] cursor-pointer"
                />
              </div>
              {styleTouched && (
                <button
                  type="button"
                  onClick={() => {
                    setFontRem(editor.defaultRem);
                    setColor(editor.defaultColor);
                    setBold(false);
                    setItalic(false);
                    setUnderline(false);
                    setFontFamily("");
                    setStyleTouched(false);
                  }}
                  className={resetButtonClass}
                >
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                  Stil zurücksetzen
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <label className={labelClass + " mb-0 mr-1"}>Schriftschnitt</label>
              {[
                { key: "bold" as const, Icon: Bold, active: bold, set: setBold, title: "Fett" },
                { key: "italic" as const, Icon: Italic, active: italic, set: setItalic, title: "Kursiv" },
                { key: "underline" as const, Icon: Underline, active: underline, set: setUnderline, title: "Unterstrichen" },
              ].map(({ key, Icon, active, set, title }) => (
                <button
                  key={key}
                  type="button"
                  title={title}
                  aria-pressed={active}
                  onClick={() => {
                    set(!active);
                    setStyleTouched(true);
                  }}
                  className={`inline-flex items-center justify-center w-9 h-9 border rounded-[2px] cursor-pointer transition-colors ${
                    active ? "bg-forest text-white border-forest" : "border-line text-ink-soft hover:text-forest hover:border-forest"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </button>
              ))}
            </div>
            <div>
              <label className={labelClass}>Schriftart</label>
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  setStyleTouched(true);
                }}
                className={inputClass}
              >
                <option value="">Standard (Website-Schrift)</option>
                {FONT_OPTIONS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onSave({
                de,
                en,
                fontRem: editor.styleable && styleTouched ? fontRem : null,
                color: editor.styleable && styleTouched ? color : null,
                bold: editor.styleable && bold,
                italic: editor.styleable && italic,
                underline: editor.styleable && underline,
                fontFamily: editor.styleable && styleTouched && fontFamily ? fontFamily : null,
              })
            }
            className={saveButtonClass}
          >
            {saving ? "Speichert…" : "Übernehmen"}
          </button>
          <button type="button" onClick={onClose} className={resetButtonClass}>
            Abbrechen
          </button>
        </div>
      </div>
    </Modal>
  );
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Bild konnte nicht geladen werden."));
    img.src = src;
  });
}

async function cropImageToFile(objectUrl: string, area: Area, fileName: string, mimeType: string): Promise<File> {
  const image = await loadImageElement(objectUrl);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Zuschnitt wird von diesem Browser nicht unterstützt.");
  ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.92));
  if (!blob) throw new Error("Zuschnitt fehlgeschlagen.");
  return new File([blob], fileName, { type: blob.type });
}

export function ImageEditPopup({
  editor,
  saving,
  onClose,
  onUpload,
  onReset,
}: {
  editor: ImageEditor;
  saving: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onReset: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropping, setCropping] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function selectFile(next: File | null) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setFile(next);
    setObjectUrl(next ? URL.createObjectURL(next) : null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropError(null);
  }

  async function applyCrop() {
    if (!file || !objectUrl || !croppedAreaPixels) return;
    setCropping(true);
    setCropError(null);
    try {
      const cropped = await cropImageToFile(objectUrl, croppedAreaPixels, file.name, file.type || "image/jpeg");
      onUpload(cropped);
    } catch {
      setCropError("Zuschnitt fehlgeschlagen. Bitte andere Datei versuchen.");
    } finally {
      setCropping(false);
    }
  }

  const busy = saving || cropping;

  return (
    <Modal onClose={onClose}>
      <ModalHeader title={editor.label} onClose={onClose} />
      <div className="p-6">
        <p className="text-[0.85rem] text-ink-soft mb-4">{editor.hint}</p>

        {!objectUrl ? (
          <>
            <div
              className={`relative w-full ${editor.previewAspectClassName ?? "aspect-video"} bg-bg-soft border border-line rounded-[2px] overflow-hidden mb-4 ${editor.round ? "max-w-[160px] mx-auto rounded-full" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editor.currentSrc} alt="" className="w-full h-full object-cover" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
              className="text-[0.85rem] file:mr-3 file:px-4 file:py-2 file:border-0 file:rounded-[2px] file:bg-bg-soft file:text-ink file:text-[0.78rem] file:uppercase file:tracking-[0.05em] file:cursor-pointer mb-5 block"
            />
            <div className="flex items-center gap-3 flex-wrap">
              {!editor.isDefault && (
                <button type="button" disabled={saving} onClick={onReset} className={resetButtonClass}>
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                  Auf Standardbild zurücksetzen
                </button>
              )}
              <button type="button" onClick={onClose} className={resetButtonClass}>
                Schließen
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-full h-72 bg-ink/90 rounded-[2px] overflow-hidden mb-4">
              <Cropper
                image={objectUrl}
                crop={crop}
                zoom={zoom}
                aspect={editor.aspectRatio}
                cropShape={editor.round ? "round" : "rect"}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-gold cursor-pointer"
              />
            </div>
            {cropError && <p className="text-[0.8rem] text-red-600 mb-3">{cropError}</p>}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                disabled={!croppedAreaPixels || busy}
                onClick={applyCrop}
                className={saveButtonClass}
              >
                <Crop className="w-3.5 h-3.5" strokeWidth={2} />
                {busy ? "Lädt hoch…" : "Zuschnitt anwenden & hochladen"}
              </button>
              <button type="button" disabled={busy} onClick={() => selectFile(null)} className={resetButtonClass}>
                <Upload className="w-3.5 h-3.5" strokeWidth={2} />
                Andere Datei wählen
              </button>
              <button type="button" disabled={busy} onClick={onClose} className={resetButtonClass}>
                Abbrechen
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

const colorInputClass = "w-full h-11 border border-line rounded-[2px] cursor-pointer";

export function PaletteEditPopup({
  editor,
  saving,
  onClose,
  onApply,
  onReset,
}: {
  editor: PaletteEditor;
  saving: boolean;
  onClose: () => void;
  onApply: (colors: ThemeColors) => void;
  onReset: () => void;
}) {
  const [colors, setColors] = useState<ThemeColors>(editor.colors);
  const [showCustom, setShowCustom] = useState(false);

  return (
    <Modal onClose={onClose}>
      <ModalHeader title="Farbpalette" onClose={onClose} />
      <div className="p-6">
        <p className="text-[0.85rem] text-ink-soft mb-4">
          Steuert das Erscheinungsbild der <strong>gesamten Website</strong>. Ein Klick auf ein Template übernimmt
          es sofort in der Vorschau — sichtbar auf der Website erst nach „Veröffentlichen&rdquo;.
        </p>
        <div className="grid grid-cols-3 max-[420px]:grid-cols-2 gap-3 mb-5">
          {PALETTE_TEMPLATES.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={saving}
              onClick={() => {
                setColors(p);
                onApply(p);
              }}
              className="group text-left border border-line rounded-[2px] overflow-hidden hover:border-gold transition-colors cursor-pointer"
            >
              <div className="flex h-9">
                <span style={{ background: p.primary }} className="flex-1" />
                <span style={{ background: p.accent }} className="flex-1" />
                <span style={{ background: p.background }} className="flex-1 border-l border-line/40" />
              </div>
              <span className="block px-2 py-1.5 text-[0.7rem] text-ink-soft group-hover:text-forest transition-colors">
                {p.name}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="text-[0.78rem] tracking-[0.06em] uppercase text-ink-soft hover:text-forest transition-colors select-none cursor-pointer"
        >
          Eigene Farben (erweitert)
        </button>
        {showCustom && (
          <div className="grid grid-cols-2 gap-4 mt-4 mb-5">
            <div>
              <span className={labelClass}>Primärfarbe</span>
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors((c) => ({ ...c, primary: e.target.value }))}
                className={colorInputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Primär (dunkel/Hover)</span>
              <input
                type="color"
                value={colors.primaryDark}
                onChange={(e) => setColors((c) => ({ ...c, primaryDark: e.target.value }))}
                className={colorInputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Akzentfarbe</span>
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => setColors((c) => ({ ...c, accent: e.target.value }))}
                className={colorInputClass}
              />
            </div>
            <div>
              <span className={labelClass}>Hintergrund</span>
              <input
                type="color"
                value={colors.background}
                onChange={(e) => setColors((c) => ({ ...c, background: e.target.value }))}
                className={colorInputClass}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-6 flex-wrap">
          {showCustom && (
            <button type="button" disabled={saving} onClick={() => onApply(colors)} className={saveButtonClass}>
              {saving ? "Speichert…" : "Eigene Farben übernehmen"}
            </button>
          )}
          {editor.hasOverride && (
            <button type="button" disabled={saving} onClick={onReset} className={resetButtonClass}>
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
              Auf Standardfarben zurücksetzen
            </button>
          )}
          <button type="button" onClick={onClose} className={resetButtonClass}>
            Schließen
          </button>
        </div>
      </div>
    </Modal>
  );
}

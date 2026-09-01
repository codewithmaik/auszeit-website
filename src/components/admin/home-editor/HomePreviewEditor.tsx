"use client";

import { useState, useTransition, type CSSProperties, type ElementType, type ReactNode } from "react";
import Image from "next/image";
import { Check, ArrowRight, CalendarCheck2, RotateCcw, Pencil, Undo2, UploadCloud, X } from "lucide-react";
import type { HomeContent, HomeTextStyles, DesignDraft } from "@/db/home-content";
import { ICONS as BRAND_ICON_SRC } from "@/components/BrandIcon";
import { FEATURE_ICONS, FEATURE_ICON_FRAME, TRUST_ICONS, STEP_ICONS } from "@/lib/home-icons";
import { fontFamilyFor } from "@/lib/fonts";
import {
  saveHomeTextAndStyles,
  resetHomeContent,
  resetHomeTextStyles,
  uploadHomeHeroImage,
  resetHomeHeroImage,
  uploadHomeWohlfuehlImage,
  resetHomeWohlfuehlImage,
  uploadLogoImage,
  resetLogoImage,
  uploadLogoTextImage,
  resetLogoTextImage,
  saveThemeColors,
  resetThemeColors,
  publishDesign,
  discardDesignDraft,
  undoDesignDraft,
} from "@/app/admin/(dashboard)/design/actions";
import { FIELDS, buildHomeContentFormData, type TextRole } from "./fields";
import { PALETTE_TEMPLATES, DEFAULT_COLORS, type ThemeColors } from "./palettes";
import { TextEditPopup, ImageEditPopup, type ActiveEditor } from "./EditPopup";

const resetButtonClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors";
const saveButtonClass =
  "inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors";

type ImageId = "hero" | "wohlfuehl" | "logo" | "logoText";

function roleColor(role: TextRole | undefined, colors: ThemeColors): string {
  if (role === "forest") return colors.primary;
  if (role === "gold") return colors.accent;
  if (role === "white") return "#ffffff";
  return "#5c6355";
}

const editableClass =
  "cursor-pointer outline-2 outline-offset-[3px] outline-transparent hover:outline-dashed hover:outline-gold rounded-[2px] transition-[outline-color] duration-150";

function Editable({
  id,
  styles,
  onEdit,
  as: Tag = "span",
  className = "",
  children,
}: {
  id: string;
  styles: HomeTextStyles;
  onEdit: (id: string) => void;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const field = FIELDS[id];
  const override = styles[id];
  const style: CSSProperties = {};
  if (field?.styleable) {
    if (override?.fontSize) style.fontSize = override.fontSize;
    if (override?.color) style.color = override.color;
    if (override?.bold) style.fontWeight = 700;
    if (override?.italic) style.fontStyle = "italic";
    if (override?.underline) style.textDecoration = "underline";
    const family = fontFamilyFor(override?.fontFamily);
    if (family) style.fontFamily = family;
  }
  return (
    <Tag className={`${className} ${editableClass}`} style={style} onClick={() => onEdit(id)}>
      {children}
    </Tag>
  );
}

type Props = {
  initialContentDe: HomeContent;
  initialContentEn: HomeContent;
  defaultContentDe: HomeContent;
  defaultContentEn: HomeContent;
  hasHomeOverride: boolean;
  initialStyles: HomeTextStyles;
  initialHeroImage: string;
  defaultHeroImage: string;
  isHeroDefault: boolean;
  initialWohlfuehlImage: string;
  defaultWohlfuehlImage: string;
  isWohlfuehlDefault: boolean;
  initialLogoImage: string;
  isLogoDefault: boolean;
  initialLogoTextImage: string;
  isLogoTextDefault: boolean;
  initialColors: ThemeColors;
  hasThemeOverride: boolean;
  hasDraft: boolean;
  draftHistoryCount: number;
};

const DEFAULT_LOGO_IMAGE = "/images/logo.png";

export default function HomePreviewEditor({
  initialContentDe,
  initialContentEn,
  defaultContentDe,
  defaultContentEn,
  hasHomeOverride,
  initialStyles,
  initialHeroImage,
  defaultHeroImage,
  isHeroDefault,
  initialWohlfuehlImage,
  defaultWohlfuehlImage,
  isWohlfuehlDefault,
  initialLogoImage,
  isLogoDefault,
  initialLogoTextImage,
  isLogoTextDefault,
  initialColors,
  hasThemeOverride,
  hasDraft,
  draftHistoryCount,
}: Props) {
  const [contentDe, setContentDe] = useState(initialContentDe);
  const [contentEn, setContentEn] = useState(initialContentEn);
  const [homeOverride, setHomeOverride] = useState(hasHomeOverride);
  const [styles, setStyles] = useState<HomeTextStyles>(initialStyles);
  const [heroImage, setHeroImage] = useState(initialHeroImage);
  const [heroIsDefault, setHeroIsDefault] = useState(isHeroDefault);
  const [wohlfuehlImage, setWohlfuehlImage] = useState(initialWohlfuehlImage);
  const [wohlfuehlIsDefault, setWohlfuehlIsDefault] = useState(isWohlfuehlDefault);
  const [logoImage, setLogoImage] = useState(initialLogoImage);
  const [logoIsDefault, setLogoIsDefault] = useState(isLogoDefault);
  const [logoTextImage, setLogoTextImage] = useState(initialLogoTextImage);
  const [logoTextIsDefault, setLogoTextIsDefault] = useState(isLogoTextDefault);
  const [colors, setColors] = useState<ThemeColors>(initialColors);
  const [themeOverride, setThemeOverride] = useState(hasThemeOverride);
  const [previewLocale, setPreviewLocale] = useState<"de" | "en">("de");
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null);
  const [draftExists, setDraftExists] = useState(hasDraft);
  const [historyCount, setHistoryCount] = useState(draftHistoryCount);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [isPending, startTransition] = useTransition();

  const content = previewLocale === "de" ? contentDe : contentEn;
  const hasStyleOverride = Object.keys(styles).length > 0;

  const previewThemeStyle = {
    "--color-forest": colors.primary,
    "--color-forest-dark": colors.primaryDark,
    "--color-gold": colors.accent,
    "--color-bg": colors.background,
  } as CSSProperties;

  function markDraftChanged() {
    setDraftExists(true);
    setHistoryCount((c) => c + 1);
  }

  function applyDraftState(next: DesignDraft) {
    setContentDe(next.homeContentDe ?? defaultContentDe);
    setContentEn(next.homeContentEn ?? defaultContentEn);
    setStyles(next.homeTextStyles ?? {});
    setHomeOverride(Boolean(next.homeContentDe || next.homeContentEn));
    setHeroImage(next.homeHeroImageUrl || defaultHeroImage);
    setHeroIsDefault(!next.homeHeroImageUrl);
    setWohlfuehlImage(next.homeWohlfuehlImageUrl || defaultWohlfuehlImage);
    setWohlfuehlIsDefault(!next.homeWohlfuehlImageUrl);
    setLogoImage(next.logoImageUrl || DEFAULT_LOGO_IMAGE);
    setLogoIsDefault(!next.logoImageUrl);
    setLogoTextImage(next.logoTextImageUrl || DEFAULT_LOGO_IMAGE);
    setLogoTextIsDefault(!next.logoTextImageUrl);
    setColors({
      primary: next.themePrimary ?? DEFAULT_COLORS.primary,
      primaryDark: next.themePrimaryDark ?? DEFAULT_COLORS.primaryDark,
      accent: next.themeAccent ?? DEFAULT_COLORS.accent,
      background: next.themeBackground ?? DEFAULT_COLORS.background,
    });
    setThemeOverride(Boolean(next.themePrimary || next.themePrimaryDark || next.themeAccent || next.themeBackground));
  }

  function openTextEditor(id: string) {
    const field = FIELDS[id];
    if (!field) return;
    const override = styles[id];
    const defaultColor = roleColor(field.role, colors);
    setActiveEditor({
      kind: "text",
      id,
      label: field.label,
      multiline: Boolean(field.multiline),
      styleable: Boolean(field.styleable),
      de: field.get(contentDe),
      en: field.get(contentEn),
      fontRem: override?.fontSize ? parseFloat(override.fontSize) : (field.defaultRem ?? 1),
      color: override?.color ?? defaultColor,
      bold: Boolean(override?.bold),
      italic: Boolean(override?.italic),
      underline: Boolean(override?.underline),
      fontFamily: override?.fontFamily ?? "",
      defaultRem: field.defaultRem ?? 1,
      defaultColor,
      hasOverride: Boolean(
        override?.fontSize ||
          override?.color ||
          override?.bold ||
          override?.italic ||
          override?.underline ||
          override?.fontFamily,
      ),
    });
  }

  function handleSaveText(values: {
    de: string;
    en: string;
    fontRem: number | null;
    color: string | null;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    fontFamily: string | null;
  }) {
    if (!activeEditor || activeEditor.kind !== "text") return;
    const id = activeEditor.id;
    const field = FIELDS[id];
    const newDe = field.set(contentDe, values.de);
    const newEn = field.set(contentEn, values.en);
    const newStyles = { ...styles };
    const hasAnyOverride =
      values.fontRem !== null || values.color !== null || values.bold || values.italic || values.underline || values.fontFamily;
    if (hasAnyOverride) {
      newStyles[id] = {
        ...(values.fontRem !== null ? { fontSize: `${values.fontRem}rem` } : {}),
        ...(values.color !== null ? { color: values.color } : {}),
        ...(values.bold ? { bold: true } : {}),
        ...(values.italic ? { italic: true } : {}),
        ...(values.underline ? { underline: true } : {}),
        ...(values.fontFamily ? { fontFamily: values.fontFamily } : {}),
      };
    } else {
      delete newStyles[id];
    }

    setContentDe(newDe);
    setContentEn(newEn);
    setStyles(newStyles);
    setHomeOverride(true);
    setActiveEditor(null);
    markDraftChanged();

    startTransition(async () => {
      await saveHomeTextAndStyles(buildHomeContentFormData(newDe, newEn), newStyles);
    });
  }

  function openImageEditor(id: ImageId) {
    const config: Record<ImageId, { label: string; hint: string; currentSrc: string; isDefault: boolean }> = {
      hero: {
        label: "Hero-Bild",
        hint: "Großes Titelbild ganz oben auf der Startseite. Breitformat-Fotos wirken am besten.",
        currentSrc: heroImage,
        isDefault: heroIsDefault,
      },
      wohlfuehl: {
        label: 'Bild "Wohlfühloase"',
        hint: "Bild in der Karte neben dem Buchungsformular.",
        currentSrc: wohlfuehlImage,
        isDefault: wohlfuehlIsDefault,
      },
      logo: {
        label: "Logo",
        hint: "Rundes Logo links in der Navigationsleiste. Quadratische Bilder passen am besten.",
        currentSrc: logoImage,
        isDefault: logoIsDefault,
      },
      logoText: {
        label: "Logo-Schriftzug",
        hint:
          'Ersetzt den Text "AUSZEIT" samt Zeile darunter in der Navbar durch ein eigenes Bild. Ohne Upload bleibt der Standardtext sichtbar.',
        currentSrc: logoTextImage,
        isDefault: logoTextIsDefault,
      },
    };
    const c = config[id];
    setActiveEditor({
      kind: "image",
      id,
      label: c.label,
      hint: c.hint,
      currentSrc: c.currentSrc,
      isDefault: c.isDefault,
      previewAspectClassName: id === "logo" ? "aspect-square" : id === "logoText" ? "aspect-[3/1]" : undefined,
      round: id === "logo",
      aspectRatio: id === "hero" ? 16 / 9 : id === "wohlfuehl" ? 4 / 3 : id === "logo" ? 1 : 3 / 1,
    });
  }

  function handleUploadImage(file: File) {
    if (!activeEditor || activeEditor.kind !== "image") return;
    const id = activeEditor.id as ImageId;
    const fd = new FormData();
    fd.set("file", file);
    setActiveEditor(null);
    startTransition(async () => {
      const uploaders: Record<ImageId, (fd: FormData) => Promise<{ url: string } | undefined>> = {
        hero: uploadHomeHeroImage,
        wohlfuehl: uploadHomeWohlfuehlImage,
        logo: uploadLogoImage,
        logoText: uploadLogoTextImage,
      };
      const result = await uploaders[id](fd);
      if (result?.url) {
        if (id === "hero") {
          setHeroImage(result.url);
          setHeroIsDefault(false);
        } else if (id === "wohlfuehl") {
          setWohlfuehlImage(result.url);
          setWohlfuehlIsDefault(false);
        } else if (id === "logo") {
          setLogoImage(result.url);
          setLogoIsDefault(false);
        } else {
          setLogoTextImage(result.url);
          setLogoTextIsDefault(false);
        }
        markDraftChanged();
      }
    });
  }

  function handleResetImage() {
    if (!activeEditor || activeEditor.kind !== "image") return;
    const id = activeEditor.id as ImageId;
    setActiveEditor(null);
    startTransition(async () => {
      const resetters: Record<ImageId, () => Promise<void>> = {
        hero: resetHomeHeroImage,
        wohlfuehl: resetHomeWohlfuehlImage,
        logo: resetLogoImage,
        logoText: resetLogoTextImage,
      };
      await resetters[id]();
      if (id === "hero") {
        setHeroImage(defaultHeroImage);
        setHeroIsDefault(true);
      } else if (id === "wohlfuehl") {
        setWohlfuehlImage(defaultWohlfuehlImage);
        setWohlfuehlIsDefault(true);
      } else if (id === "logo") {
        setLogoImage(DEFAULT_LOGO_IMAGE);
        setLogoIsDefault(true);
      } else {
        setLogoTextImage(DEFAULT_LOGO_IMAGE);
        setLogoTextIsDefault(true);
      }
      markDraftChanged();
    });
  }

  function applyPalette(p: ThemeColors) {
    setColors(p);
    setThemeOverride(true);
    markDraftChanged();
    startTransition(async () => {
      const fd = new FormData();
      fd.set("themePrimary", p.primary);
      fd.set("themePrimaryDark", p.primaryDark);
      fd.set("themeAccent", p.accent);
      fd.set("themeBackground", p.background);
      await saveThemeColors(fd);
    });
  }

  function resetColors() {
    setColors(DEFAULT_COLORS);
    setThemeOverride(false);
    markDraftChanged();
    startTransition(async () => {
      await resetThemeColors();
    });
  }

  function resetTexts() {
    setContentDe(defaultContentDe);
    setContentEn(defaultContentEn);
    setHomeOverride(false);
    markDraftChanged();
    startTransition(async () => {
      await resetHomeContent();
    });
  }

  function resetStyles() {
    setStyles({});
    markDraftChanged();
    startTransition(async () => {
      await resetHomeTextStyles();
    });
  }

  function handlePublish() {
    startTransition(async () => {
      await publishDesign();
      setDraftExists(false);
      setHistoryCount(0);
      setConfirmingPublish(false);
    });
  }

  function handleDiscard() {
    startTransition(async () => {
      const published = await discardDesignDraft();
      applyDraftState(published);
      setDraftExists(false);
      setHistoryCount(0);
    });
  }

  function handleUndo() {
    startTransition(async () => {
      const restored = await undoDesignDraft();
      if (restored) {
        applyDraftState(restored);
        setHistoryCount((c) => Math.max(0, c - 1));
      }
    });
  }

  return (
    <div>
      {/* Entwurf/Veröffentlichen-Toolbar */}
      <div className="sticky top-0 z-40 -mx-1 mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-line bg-white/95 backdrop-blur px-5 py-3.5 shadow-[0_4px_16px_-8px_rgba(44,50,38,0.25)]">
        <div className="text-[0.85rem]">
          {draftExists ? (
            <span className="inline-flex items-center gap-1.5 text-gold font-medium">
              <span className="w-2 h-2 rounded-full bg-gold inline-block" />
              Unveröffentlichter Entwurf — Änderungen sind nur hier sichtbar, nicht auf der Website.
            </span>
          ) : (
            <span className="text-ink-soft">Keine offenen Änderungen — Website zeigt den veröffentlichten Stand.</span>
          )}
          {isPending && <span className="ml-2 text-ink-soft">Speichert…</span>}
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            disabled={historyCount === 0 || isPending}
            onClick={handleUndo}
            className={resetButtonClass + " disabled:opacity-40 disabled:cursor-not-allowed"}
          >
            <Undo2 className="w-3.5 h-3.5" strokeWidth={2} />
            Zurück
          </button>
          <button
            type="button"
            disabled={!draftExists || isPending}
            onClick={handleDiscard}
            className={resetButtonClass + " disabled:opacity-40 disabled:cursor-not-allowed"}
          >
            <X className="w-3.5 h-3.5" strokeWidth={2} />
            Entwurf verwerfen
          </button>
          {confirmingPublish ? (
            <div className="flex items-center gap-2">
              <span className="text-[0.78rem] text-ink-soft">Jetzt live schalten?</span>
              <button type="button" onClick={handlePublish} disabled={isPending} className={saveButtonClass}>
                <UploadCloud className="w-3.5 h-3.5" strokeWidth={2} />
                Ja, veröffentlichen
              </button>
              <button type="button" onClick={() => setConfirmingPublish(false)} className={resetButtonClass}>
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!draftExists || isPending}
              onClick={() => setConfirmingPublish(true)}
              className={saveButtonClass + " disabled:opacity-40 disabled:cursor-not-allowed"}
            >
              <UploadCloud className="w-3.5 h-3.5" strokeWidth={2} />
              Veröffentlichen
            </button>
          )}
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <h2 className="text-[1.15rem] mb-4">Branding (Navbar)</h2>
        <div className="flex flex-wrap gap-8">
          <button type="button" onClick={() => openImageEditor("logo")} className="group text-left cursor-pointer">
            <span className="relative block w-[72px] h-[72px] rounded-full overflow-hidden border border-line bg-bg-soft">
              <Image src={logoImage} alt="" fill sizes="72px" className="object-cover" />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
            </span>
            <span className="block mt-2 text-[0.72rem] tracking-[0.06em] uppercase text-ink-soft group-hover:text-forest transition-colors">
              Logo ändern
            </span>
          </button>
          <button type="button" onClick={() => openImageEditor("logoText")} className="group text-left cursor-pointer">
            <span className="relative block w-[220px] h-[68px] rounded-[2px] overflow-hidden border border-line bg-bg-soft">
              <Image
                src={logoTextImage}
                alt=""
                fill
                sizes="220px"
                className={logoTextIsDefault ? "object-cover opacity-30" : "object-contain"}
              />
              <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
            </span>
            <span className="block mt-2 text-[0.72rem] tracking-[0.06em] uppercase text-ink-soft group-hover:text-forest transition-colors">
              Logo-Schriftzug ändern
            </span>
          </button>
        </div>
      </div>

      {/* Farbpalette */}
      <div className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <h2 className="text-[1.15rem] mb-1">Farbpalette</h2>
        <p className="text-[0.85rem] text-ink-soft mb-4">
          Steuert das Erscheinungsbild der <strong>gesamten Website</strong>. Ein Klick auf ein Template übernimmt
          es sofort in der Vorschau — sichtbar auf der Website erst nach „Veröffentlichen&rdquo;.
        </p>
        <div className="grid grid-cols-5 max-[760px]:grid-cols-3 max-[480px]:grid-cols-2 gap-3 mb-6">
          {PALETTE_TEMPLATES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPalette(p)}
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

        <details className="group">
          <summary className="cursor-pointer text-[0.78rem] tracking-[0.06em] uppercase text-ink-soft hover:text-forest transition-colors select-none">
            Eigene Farben (erweitert)
          </summary>
          <div className="grid grid-cols-4 max-[640px]:grid-cols-2 gap-4 mt-4 mb-5">
            <div>
              <span className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Primärfarbe</span>
              <input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors((c) => ({ ...c, primary: e.target.value }))}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
            <div>
              <span className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                Primär (dunkel/Hover)
              </span>
              <input
                type="color"
                value={colors.primaryDark}
                onChange={(e) => setColors((c) => ({ ...c, primaryDark: e.target.value }))}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
            <div>
              <span className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Akzentfarbe</span>
              <input
                type="color"
                value={colors.accent}
                onChange={(e) => setColors((c) => ({ ...c, accent: e.target.value }))}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
            <div>
              <span className="block text-[0.7rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Hintergrund</span>
              <input
                type="color"
                value={colors.background}
                onChange={(e) => setColors((c) => ({ ...c, background: e.target.value }))}
                className="w-full h-11 border border-line rounded-[2px] cursor-pointer"
              />
            </div>
          </div>
          <button type="button" onClick={() => applyPalette(colors)} className={saveButtonClass}>
            Eigene Farben übernehmen
          </button>
        </details>

        {themeOverride && (
          <button type="button" onClick={resetColors} className={resetButtonClass + " mt-5"}>
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            Auf Standardfarben zurücksetzen
          </button>
        )}
      </div>

      {/* Live-Vorschau */}
      <div className="bg-white border border-line rounded-[2px] overflow-hidden mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-3.5 border-b border-line bg-bg-soft">
          <div>
            <h2 className="text-[1.05rem] m-0">Live-Vorschau Startseite</h2>
            <p className="text-[0.78rem] text-ink-soft m-0 mt-0.5 flex items-center gap-1.5">
              <Pencil className="w-3 h-3" strokeWidth={2} /> Klicken Sie auf Text oder Bild, um es zu bearbeiten.
              {isPending && <span className="text-gold">Speichert…</span>}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex border border-line rounded-[2px] overflow-hidden">
              {(["de", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPreviewLocale(l)}
                  className={`px-3.5 py-1.5 text-[0.72rem] uppercase tracking-[0.08em] cursor-pointer transition-colors ${
                    previewLocale === l ? "bg-forest text-white" : "bg-white text-ink-soft hover:text-forest"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {hasStyleOverride && (
              <button type="button" onClick={resetStyles} className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Textstile zurücksetzen
              </button>
            )}
            {homeOverride && (
              <button type="button" onClick={resetTexts} className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Texte zurücksetzen
              </button>
            )}
          </div>
        </div>

        <div style={previewThemeStyle} className="bg-bg">
          {/* Hero */}
          <section className="relative min-h-[64vh] flex items-end overflow-hidden">
            <div className="absolute inset-0 cursor-pointer group" onClick={() => openImageEditor("hero")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="" className="w-full h-full object-cover scale-[1.18] origin-bottom" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[0.7rem] uppercase tracking-[0.08em] bg-black/60 px-3 py-1.5 rounded-[2px]">
                  Bild ändern
                </span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-[1180px] mx-auto w-full px-8 py-[70px]">
              <h1 className="text-white text-[clamp(2.4rem,4.4vw,3.8rem)] leading-[1.05] mb-7">
                <Editable styles={styles} onEdit={openTextEditor} id="hero.title1">{content.hero.title1}</Editable>
                <br />
                <Editable styles={styles} onEdit={openTextEditor} id="hero.title2">{content.hero.title2}</Editable>
              </h1>
              <Editable styles={styles} onEdit={openTextEditor} id="hero.lead1" as="p" className="text-white/90 text-[1.1rem] max-w-[460px]">
                {content.hero.lead1}
              </Editable>
              <Editable styles={styles} onEdit={openTextEditor} id="hero.lead2" as="p" className="text-white/80 max-w-[460px]">
                {content.hero.lead2}
              </Editable>
              <div className="flex gap-3.5 mt-6 flex-wrap">
                <button
                  type="button"
                  onClick={() => openTextEditor("hero.ctaWohnungen")}
                  className={`${editableClass} inline-flex items-center gap-2 px-[30px] py-[14px] font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] border transition-colors duration-200 bg-forest text-white border-transparent hover:bg-forest-dark`}
                >
                  {content.hero.ctaWohnungen}
                </button>
                <button
                  type="button"
                  onClick={() => openTextEditor("hero.ctaBuchen")}
                  className={`${editableClass} inline-flex items-center gap-2 px-[30px] py-[14px] font-sans text-[0.78rem] tracking-[0.14em] uppercase rounded-[2px] border transition-colors duration-200 bg-transparent text-white border-white/80 hover:bg-white hover:text-forest`}
                >
                  {content.hero.ctaBuchen}
                </button>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="py-[60px] border-b border-line">
            <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[30px]">
              {content.features.map((f, i) => (
                <div key={f.key} className="flex gap-3.5 items-start">
                  <span className="relative block w-12 h-12 rounded-full overflow-hidden border-2 border-khaki flex-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={BRAND_ICON_SRC[FEATURE_ICONS[f.key]]}
                      alt=""
                      style={{
                        position: "absolute",
                        maxWidth: "none",
                        width: FEATURE_ICON_FRAME[f.key].size,
                        height: FEATURE_ICON_FRAME[f.key].size,
                        left: FEATURE_ICON_FRAME[f.key].left,
                        top: FEATURE_ICON_FRAME[f.key].top,
                      }}
                    />
                  </span>
                  <div>
                    <Editable styles={styles} onEdit={openTextEditor}
                      id={`features.${i}.title`}
                      as="h3"
                      className="text-[0.95rem] font-sans uppercase tracking-[0.06em] mb-1"
                    >
                      {f.title}
                    </Editable>
                    <Editable styles={styles} onEdit={openTextEditor} id={`features.${i}.text`} as="p" className="text-[0.88rem] m-0">
                      {f.text}
                    </Editable>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section className="py-20">
            <div className="max-w-[1180px] mx-auto px-8">
              <div className="max-w-[640px] mx-auto mb-[46px] text-center">
                <Editable styles={styles} onEdit={openTextEditor}
                  id="stepsEyebrow"
                  as="span"
                  className="block font-sans text-[calc(0.72rem+3px)] tracking-[0.22em] uppercase underline underline-offset-4 mb-[0.9em] text-gold"
                >
                  {content.stepsEyebrow}
                </Editable>
                <Editable styles={styles} onEdit={openTextEditor} id="stepsTitle" as="h2" className="mt-0">
                  {content.stepsTitle}
                </Editable>
                <hr className="w-[46px] h-px bg-gold border-none my-[18px] mx-auto" />
              </div>
              <div className="grid grid-cols-3 max-[860px]:grid-cols-1 gap-8">
                {content.steps.map((s, i) => {
                  const Icon = STEP_ICONS[i];
                  return (
                    <div key={i} className="text-center px-4">
                      <span className="inline-flex w-14 h-14 rounded-full bg-bg-soft border border-line items-center justify-center text-forest mb-4">
                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                      </span>
                      <Editable styles={styles} onEdit={openTextEditor} id={`steps.${i}.title`} as="h3" className="text-[1.05rem]">
                        {s.title}
                      </Editable>
                      <Editable styles={styles} onEdit={openTextEditor} id={`steps.${i}.text`} as="p" className="text-[0.92rem]">
                        {s.text}
                      </Editable>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Buchen */}
          <section className="py-20 bg-bg-soft">
            <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-3 max-[980px]:grid-cols-1 gap-10 items-center">
              <div>
                <Editable styles={styles} onEdit={openTextEditor}
                  id="bookEyebrow"
                  as="span"
                  className="block font-sans text-[calc(0.72rem+3px)] tracking-[0.22em] uppercase underline underline-offset-4 mb-[0.9em] text-gold"
                >
                  {content.bookEyebrow}
                </Editable>
                <Editable styles={styles} onEdit={openTextEditor} id="bookTitle" as="h2" className="mt-0">
                  {content.bookTitle}
                </Editable>
                <hr className="w-[46px] h-px bg-gold border-none my-[18px]" />
                <Editable styles={styles} onEdit={openTextEditor} id="bookText" as="p">
                  {content.bookText}
                </Editable>
                <Editable styles={styles} onEdit={openTextEditor} id="bookBullets" as="ul" className="list-none m-0 mt-5 p-0 text-[0.92rem] text-ink-soft">
                  {content.bookBullets.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 py-1.5">
                      <Check className="w-4 h-4 text-gold flex-none" strokeWidth={2} /> {item}
                    </li>
                  ))}
                </Editable>
              </div>

              <div className="bg-white border border-line rounded-[2px] p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
                <CalendarCheck2 className="w-8 h-8 text-gold mb-3" strokeWidth={1.5} />
                <p className="text-[0.85rem] text-ink-soft m-0">
                  Buchungsformular
                  <br />
                  (Live-Vorschau nicht interaktiv)
                </p>
              </div>

              <div className="rounded-[2px] overflow-hidden shadow-[0_18px_40px_-20px_rgba(44,50,38,0.35)]">
                <div
                  className="relative aspect-4/3 cursor-pointer group"
                  onClick={() => openImageEditor("wohlfuehl")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={wohlfuehlImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[0.7rem] uppercase tracking-[0.08em] bg-black/60 px-3 py-1.5 rounded-[2px]">
                      Bild ändern
                    </span>
                  </div>
                </div>
                <div className="bg-white p-5">
                  <Editable styles={styles} onEdit={openTextEditor} id="wohlfuehl.title" as="h3">
                    {content.wohlfuehl.title}
                  </Editable>
                  <Editable styles={styles} onEdit={openTextEditor} id="wohlfuehl.text" as="p" className="text-[0.9rem] m-0">
                    {content.wohlfuehl.text}
                  </Editable>
                  <p className="mt-2.5">
                    <Editable styles={styles} onEdit={openTextEditor}
                      id="wohlfuehl.more"
                      as="span"
                      className="inline-flex items-center gap-1.5 text-gold text-[calc(0.85rem+2px)] tracking-[0.05em] uppercase"
                    >
                      {content.wohlfuehl.more} <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                    </Editable>
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Vertrauensleiste */}
          <section className="py-[46px] bg-forest">
            <div className="max-w-[1180px] mx-auto px-8 grid grid-cols-4 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 gap-[30px]">
              {content.trust.map((item, i) => {
                const Icon = TRUST_ICONS[i];
                return (
                  <div key={i} className="flex gap-3 items-start text-white">
                    <Icon className="w-5 h-5 text-gold flex-none mt-0.5" strokeWidth={1.5} />
                    <div>
                      <Editable styles={styles} onEdit={openTextEditor}
                        id={`trust.${i}.title`}
                        as="h3"
                        className="text-white font-sans text-[0.82rem] tracking-[0.08em] uppercase mb-1"
                      >
                        {item.title}
                      </Editable>
                      <Editable styles={styles} onEdit={openTextEditor} id={`trust.${i}.text`} as="p" className="text-white/90 text-[0.85rem] m-0">
                        {item.text}
                      </Editable>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {activeEditor?.kind === "text" && (
        <TextEditPopup
          editor={activeEditor}
          saving={isPending}
          onClose={() => setActiveEditor(null)}
          onSave={handleSaveText}
        />
      )}
      {activeEditor?.kind === "image" && (
        <ImageEditPopup
          editor={activeEditor}
          saving={isPending}
          onClose={() => setActiveEditor(null)}
          onUpload={handleUploadImage}
          onReset={handleResetImage}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useTransition, type CSSProperties, type ElementType, type ReactNode } from "react";
import { Check, ArrowRight, CalendarCheck2, RotateCcw, Pencil } from "lucide-react";
import type { HomeContent, HomeTextStyles } from "@/db/home-content";
import { ICONS as BRAND_ICON_SRC } from "@/components/BrandIcon";
import { FEATURE_ICONS, FEATURE_ICON_FRAME, TRUST_ICONS, STEP_ICONS } from "@/lib/home-icons";
import {
  saveHomeContent,
  resetHomeContent,
  saveHomeTextStyles,
  resetHomeTextStyles,
  uploadHomeHeroImage,
  resetHomeHeroImage,
  uploadHomeWohlfuehlImage,
  resetHomeWohlfuehlImage,
  saveThemeColors,
  resetThemeColors,
} from "@/app/admin/(dashboard)/design/actions";
import { FIELDS, buildHomeContentFormData, type TextRole } from "./fields";
import { PALETTE_TEMPLATES, DEFAULT_COLORS, type ThemeColors } from "./palettes";
import { TextEditPopup, ImageEditPopup, type ActiveEditor } from "./EditPopup";

const resetButtonClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 border border-line text-ink-soft font-sans text-[0.72rem] tracking-[0.08em] uppercase rounded-[2px] hover:text-forest hover:border-forest transition-colors";
const saveButtonClass =
  "inline-flex items-center gap-2 px-6 py-3 bg-forest text-white font-sans text-[0.78rem] tracking-[0.1em] uppercase rounded-[2px] hover:bg-forest-dark transition-colors";

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
  initialColors: ThemeColors;
  hasThemeOverride: boolean;
};

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
  initialColors,
  hasThemeOverride,
}: Props) {
  const [contentDe, setContentDe] = useState(initialContentDe);
  const [contentEn, setContentEn] = useState(initialContentEn);
  const [homeOverride, setHomeOverride] = useState(hasHomeOverride);
  const [styles, setStyles] = useState<HomeTextStyles>(initialStyles);
  const [heroImage, setHeroImage] = useState(initialHeroImage);
  const [heroIsDefault, setHeroIsDefault] = useState(isHeroDefault);
  const [wohlfuehlImage, setWohlfuehlImage] = useState(initialWohlfuehlImage);
  const [wohlfuehlIsDefault, setWohlfuehlIsDefault] = useState(isWohlfuehlDefault);
  const [colors, setColors] = useState<ThemeColors>(initialColors);
  const [themeOverride, setThemeOverride] = useState(hasThemeOverride);
  const [previewLocale, setPreviewLocale] = useState<"de" | "en">("de");
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null);
  const [isPending, startTransition] = useTransition();

  const content = previewLocale === "de" ? contentDe : contentEn;
  const hasStyleOverride = Object.keys(styles).length > 0;

  const previewThemeStyle = {
    "--color-forest": colors.primary,
    "--color-forest-dark": colors.primaryDark,
    "--color-gold": colors.accent,
    "--color-bg": colors.background,
  } as CSSProperties;

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
      defaultRem: field.defaultRem ?? 1,
      defaultColor,
      hasOverride: Boolean(override?.fontSize || override?.color),
    });
  }

  function handleSaveText(values: { de: string; en: string; fontRem: number | null; color: string | null }) {
    if (!activeEditor || activeEditor.kind !== "text") return;
    const id = activeEditor.id;
    const field = FIELDS[id];
    const newDe = field.set(contentDe, values.de);
    const newEn = field.set(contentEn, values.en);
    const newStyles = { ...styles };
    if (values.fontRem !== null || values.color !== null) {
      newStyles[id] = {
        ...(values.fontRem !== null ? { fontSize: `${values.fontRem}rem` } : {}),
        ...(values.color !== null ? { color: values.color } : {}),
      };
    } else {
      delete newStyles[id];
    }

    setContentDe(newDe);
    setContentEn(newEn);
    setStyles(newStyles);
    setHomeOverride(true);
    setActiveEditor(null);

    startTransition(async () => {
      await saveHomeContent(buildHomeContentFormData(newDe, newEn));
      await saveHomeTextStyles(newStyles);
    });
  }

  function openImageEditor(id: "hero" | "wohlfuehl") {
    if (id === "hero") {
      setActiveEditor({
        kind: "image",
        id,
        label: "Hero-Bild",
        hint: "Großes Titelbild ganz oben auf der Startseite. Breitformat-Fotos wirken am besten.",
        currentSrc: heroImage,
        isDefault: heroIsDefault,
      });
    } else {
      setActiveEditor({
        kind: "image",
        id,
        label: 'Bild "Wohlfühloase"',
        hint: "Bild in der Karte neben dem Buchungsformular.",
        currentSrc: wohlfuehlImage,
        isDefault: wohlfuehlIsDefault,
      });
    }
  }

  function handleUploadImage(file: File) {
    if (!activeEditor || activeEditor.kind !== "image") return;
    const id = activeEditor.id;
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const result = id === "hero" ? await uploadHomeHeroImage(fd) : await uploadHomeWohlfuehlImage(fd);
      if (result?.url) {
        if (id === "hero") {
          setHeroImage(result.url);
          setHeroIsDefault(false);
        } else {
          setWohlfuehlImage(result.url);
          setWohlfuehlIsDefault(false);
        }
      }
      setActiveEditor(null);
    });
  }

  function handleResetImage() {
    if (!activeEditor || activeEditor.kind !== "image") return;
    const id = activeEditor.id;
    startTransition(async () => {
      if (id === "hero") {
        await resetHomeHeroImage();
        setHeroImage(defaultHeroImage);
        setHeroIsDefault(true);
      } else {
        await resetHomeWohlfuehlImage();
        setWohlfuehlImage(defaultWohlfuehlImage);
        setWohlfuehlIsDefault(true);
      }
      setActiveEditor(null);
    });
  }

  function applyPalette(p: ThemeColors) {
    setColors(p);
    setThemeOverride(true);
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
    startTransition(async () => {
      await resetThemeColors();
    });
  }

  function resetTexts() {
    setContentDe(defaultContentDe);
    setContentEn(defaultContentEn);
    setHomeOverride(false);
    startTransition(async () => {
      await resetHomeContent();
    });
  }

  function resetStyles() {
    setStyles({});
    startTransition(async () => {
      await resetHomeTextStyles();
    });
  }

  return (
    <div>
      {/* Farbpalette */}
      <div className="bg-white border border-line rounded-[2px] p-6 mb-8">
        <h2 className="text-[1.15rem] mb-1">Farbpalette</h2>
        <p className="text-[0.85rem] text-ink-soft mb-4">
          Steuert das Erscheinungsbild der <strong>gesamten Website</strong>. Ein Klick auf ein Template übernimmt
          es sofort — auch in der Vorschau unten.
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

"use client";

import { useState, useTransition, type CSSProperties, type ElementType, type ReactNode } from "react";
import Image from "next/image";
import { Check, ArrowRight, CalendarCheck2, RotateCcw, Pencil, Undo2, UploadCloud, X } from "lucide-react";
import type {
  HomeContent,
  HomeTextStyles,
  FooterContent,
  NavLabels,
  ButtonStyleOverride,
  ButtonStyles,
  ButtonId,
  DesignDraft,
} from "@/db/home-content";
import { BUTTON_IDS } from "@/db/home-content";
import { ICONS as BRAND_ICON_SRC } from "@/components/BrandIcon";
import { FEATURE_ICONS, FEATURE_ICON_FRAME, TRUST_ICONS, STEP_ICONS } from "@/lib/home-icons";
import { fontFamilyFor } from "@/lib/fonts";
import { BUTTON_BASE_CLASS, BUTTON_VARIANT_CLASS, BUTTON_SHAPE_STYLE } from "@/components/Button";
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
  saveButtonEdit,
  resetButtonStyleForId,
  saveFooterContent,
  resetFooterContent,
  saveNavLabels,
  resetNavLabels,
  publishDesign,
  discardDesignDraft,
  undoDesignDraft,
} from "@/app/admin/(dashboard)/design/actions";
import {
  FIELDS,
  FOOTER_FIELDS,
  NAV_FIELDS,
  buildHomeContentFormData,
  buildFooterContentFormData,
  buildNavLabelsFormData,
  type TextRole,
} from "./fields";
import { DEFAULT_COLORS, type ThemeColors } from "./palettes";
import { TextEditPopup, ImageEditPopup, PaletteEditPopup, ButtonEditPopup, type ActiveEditor } from "./EditPopup";

// Nav-CTA-Button-Label bleibt sitewide/dictionary-basiert und bewusst nicht
// editierbar (siehe navbar.cta-Button-Popup, das ohne Textfeld öffnet) — nur
// die fünf Navbar-LINKS (NAV_FIELDS) sind editierbar.
const PREVIEW_NAV_CTA: Record<"de" | "en", string> = { de: "Anfragen", en: "Enquire" };

// Reihenfolge der fünf Navbar-Links (Ziel-Routen fest, nur Labels editierbar,
// s. NAV_FIELDS in fields.ts) — geteilt zwischen Navbar- und Footer-Rendering.
const NAV_LINK_ORDER: { id: string; key: keyof NavLabels }[] = [
  { id: "nav.home", key: "home" },
  { id: "nav.wohnung", key: "wohnung" },
  { id: "nav.region", key: "region" },
  { id: "nav.bewertungen", key: "bewertungen" },
  { id: "nav.kontakt", key: "kontakt" },
];

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
  initialFooterContentDe: FooterContent;
  initialFooterContentEn: FooterContent;
  defaultFooterContentDe: FooterContent;
  defaultFooterContentEn: FooterContent;
  hasFooterOverride: boolean;
  initialNavLabelsDe: NavLabels;
  initialNavLabelsEn: NavLabels;
  defaultNavLabelsDe: NavLabels;
  defaultNavLabelsEn: NavLabels;
  hasNavOverride: boolean;
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
  initialButtonStyle: ButtonStyleOverride;
  initialButtonStyles: ButtonStyles;
  initialButtonsLinked: boolean;
  hasDraft: boolean;
  draftHistoryCount: number;
};

// Anzeige-Labels für die drei individuell gestaltbaren Buttons (Popup-Titel).
const BUTTON_LABELS: Record<ButtonId, string> = {
  "hero.ctaWohnungen": 'Button „Zu den Wohnungen" (Hero)',
  "hero.ctaBuchen": 'Button „Buchen & Anfragen" (Hero)',
  "navbar.cta": 'Button „Anfragen" (Navbar)',
};

const DEFAULT_LOGO_IMAGE = "/images/logo.png";

export default function HomePreviewEditor({
  initialContentDe,
  initialContentEn,
  defaultContentDe,
  defaultContentEn,
  hasHomeOverride,
  initialStyles,
  initialFooterContentDe,
  initialFooterContentEn,
  defaultFooterContentDe,
  defaultFooterContentEn,
  hasFooterOverride,
  initialNavLabelsDe,
  initialNavLabelsEn,
  defaultNavLabelsDe,
  defaultNavLabelsEn,
  hasNavOverride,
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
  initialButtonStyle,
  initialButtonStyles,
  initialButtonsLinked,
  hasDraft,
  draftHistoryCount,
}: Props) {
  const [contentDe, setContentDe] = useState(initialContentDe);
  const [contentEn, setContentEn] = useState(initialContentEn);
  const [homeOverride, setHomeOverride] = useState(hasHomeOverride);
  const [styles, setStyles] = useState<HomeTextStyles>(initialStyles);
  const [footerContentDe, setFooterContentDe] = useState(initialFooterContentDe);
  const [footerContentEn, setFooterContentEn] = useState(initialFooterContentEn);
  const [footerOverride, setFooterOverride] = useState(hasFooterOverride);
  const [navLabelsDe, setNavLabelsDe] = useState(initialNavLabelsDe);
  const [navLabelsEn, setNavLabelsEn] = useState(initialNavLabelsEn);
  const [navOverride, setNavOverride] = useState(hasNavOverride);
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
  const [buttonStyle, setButtonStyle] = useState<ButtonStyleOverride>(initialButtonStyle);
  const [buttonStyles, setButtonStyles] = useState<ButtonStyles>(initialButtonStyles);
  const [buttonsLinked, setButtonsLinked] = useState(initialButtonsLinked);
  const [previewLocale, setPreviewLocale] = useState<"de" | "en">("de");
  const [activeEditor, setActiveEditor] = useState<ActiveEditor>(null);
  const [draftExists, setDraftExists] = useState(hasDraft);
  const [historyCount, setHistoryCount] = useState(draftHistoryCount);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const [isPending, startTransition] = useTransition();

  const content = previewLocale === "de" ? contentDe : contentEn;
  const footerContent = previewLocale === "de" ? footerContentDe : footerContentEn;
  const navLabels = previewLocale === "de" ? navLabelsDe : navLabelsEn;
  const hasStyleOverride = Object.keys(styles).length > 0;

  // Individueller Override eines Buttons, mit Fallback auf den Default-Stil
  // (buttonStyle) — angewendet als Inline-CSS-Vars direkt auf dem jeweiligen
  // Button-Element (höhere Spezifität als die Container-Vars unten).
  function buttonInlineStyle(id: ButtonId): CSSProperties {
    const override = buttonStyles[id];
    const borderWidth = override?.borderWidth ?? buttonStyle.borderWidth;
    const color = override?.color ?? buttonStyle.color;
    const borderColor = override?.borderColor ?? buttonStyle.borderColor;
    const borderRadius = override?.borderRadius ?? buttonStyle.borderRadius;
    return {
      ...(borderWidth && { "--button-border-width": borderWidth }),
      ...(color && { "--button-bg": color }),
      ...(borderColor && { "--button-border-color": borderColor }),
      ...(borderRadius && { "--button-radius": borderRadius }),
    } as CSSProperties;
  }
  function buttonAnimationAttr(id: ButtonId): string | undefined {
    return buttonStyles[id]?.animation ?? buttonStyle.animation ?? undefined;
  }

  const previewThemeStyle = {
    "--color-forest": colors.primary,
    "--color-forest-dark": colors.primaryDark,
    "--color-gold": colors.accent,
    "--color-bg": colors.background,
    ...(buttonStyle.borderWidth && { "--button-border-width": buttonStyle.borderWidth }),
    ...(buttonStyle.color && { "--button-bg": buttonStyle.color }),
    ...(buttonStyle.borderColor && { "--button-border-color": buttonStyle.borderColor }),
    ...(buttonStyle.borderRadius && { "--button-radius": buttonStyle.borderRadius }),
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
    setFooterContentDe(next.footerContentDe ?? defaultFooterContentDe);
    setFooterContentEn(next.footerContentEn ?? defaultFooterContentEn);
    setFooterOverride(Boolean(next.footerContentDe || next.footerContentEn));
    setNavLabelsDe(next.navLabelsDe ?? defaultNavLabelsDe);
    setNavLabelsEn(next.navLabelsEn ?? defaultNavLabelsEn);
    setNavOverride(Boolean(next.navLabelsDe || next.navLabelsEn));
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
    setButtonStyle({
      borderWidth: next.buttonBorderWidth,
      color: next.buttonColor,
      borderColor: next.buttonBorderColor,
      borderRadius: next.buttonBorderRadius,
      animation: next.buttonAnimation,
    });
    setButtonStyles(next.buttonStyles ?? {});
    setButtonsLinked(next.buttonsLinked);
  }

  function openTextEditor(id: string) {
    const navField = NAV_FIELDS[id];
    if (navField) {
      setActiveEditor({
        kind: "text",
        id,
        label: navField.label,
        multiline: false,
        styleable: false,
        de: navField.get(navLabelsDe),
        en: navField.get(navLabelsEn),
        fontRem: 1,
        color: "#000000",
        bold: false,
        italic: false,
        underline: false,
        fontFamily: "",
        defaultRem: 1,
        defaultColor: "#000000",
        hasOverride: false,
      });
      return;
    }
    const footerField = FOOTER_FIELDS[id];
    if (footerField) {
      setActiveEditor({
        kind: "text",
        id,
        label: footerField.label,
        multiline: false,
        styleable: false,
        de: footerField.get(footerContentDe),
        en: footerField.get(footerContentEn),
        fontRem: 1,
        color: "#ffffff",
        bold: false,
        italic: false,
        underline: false,
        fontFamily: "",
        defaultRem: 1,
        defaultColor: "#ffffff",
        hasOverride: false,
      });
      return;
    }
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
    const navField = NAV_FIELDS[id];
    if (navField) {
      const newNavDe = navField.set(navLabelsDe, values.de);
      const newNavEn = navField.set(navLabelsEn, values.en);
      setNavLabelsDe(newNavDe);
      setNavLabelsEn(newNavEn);
      setNavOverride(true);
      setActiveEditor(null);
      markDraftChanged();
      startTransition(async () => {
        await saveNavLabels(buildNavLabelsFormData(newNavDe, newNavEn));
      });
      return;
    }
    const footerField = FOOTER_FIELDS[id];
    if (footerField) {
      const newFooterDe = footerField.set(footerContentDe, values.de);
      const newFooterEn = footerField.set(footerContentEn, values.en);
      setFooterContentDe(newFooterDe);
      setFooterContentEn(newFooterEn);
      setFooterOverride(true);
      setActiveEditor(null);
      markDraftChanged();
      startTransition(async () => {
        await saveFooterContent(buildFooterContentFormData(newFooterDe, newFooterEn));
      });
      return;
    }
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

  function openPaletteEditor() {
    setActiveEditor({ kind: "palette", colors, hasOverride: themeOverride });
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

  function openButtonEditor(id: ButtonId) {
    const field = FIELDS[id];
    const override = buttonStyles[id];
    setActiveEditor({
      kind: "button",
      id,
      label: BUTTON_LABELS[id],
      text: field ? { de: field.get(contentDe), en: field.get(contentEn) } : null,
      style: override ?? buttonStyle,
      linked: buttonsLinked,
      hasOverride: Boolean(override),
    });
  }

  function handleSaveButton(values: { de: string; en: string; style: ButtonStyleOverride; linked: boolean }) {
    if (!activeEditor || activeEditor.kind !== "button") return;
    const id = activeEditor.id as ButtonId;
    const field = FIELDS[id];
    let newDe = contentDe;
    let newEn = contentEn;
    if (field) {
      newDe = field.set(contentDe, values.de);
      newEn = field.set(contentEn, values.en);
      setContentDe(newDe);
      setContentEn(newEn);
      setHomeOverride(true);
    }

    if (values.linked) {
      const linkedStyles: ButtonStyles = {};
      for (const bid of BUTTON_IDS) linkedStyles[bid] = values.style;
      setButtonStyles(linkedStyles);
      setButtonStyle(values.style);
    } else {
      setButtonStyles({ ...buttonStyles, [id]: values.style });
    }
    setButtonsLinked(values.linked);
    setActiveEditor(null);
    markDraftChanged();

    startTransition(async () => {
      const fd = buildHomeContentFormData(newDe, newEn);
      fd.set("buttonId", id);
      fd.set("linked", String(values.linked));
      if (values.style.borderWidth) fd.set("borderWidth", values.style.borderWidth);
      if (values.style.color) fd.set("color", values.style.color);
      if (values.style.borderColor) fd.set("borderColor", values.style.borderColor);
      if (values.style.borderRadius) fd.set("borderRadius", values.style.borderRadius);
      if (values.style.animation) fd.set("animation", values.style.animation);
      await saveButtonEdit(fd);
    });
  }

  function handleResetButton() {
    if (!activeEditor || activeEditor.kind !== "button") return;
    const id = activeEditor.id as ButtonId;
    const nextStyles = { ...buttonStyles };
    delete nextStyles[id];
    setButtonStyles(nextStyles);
    setButtonsLinked(false);
    setActiveEditor(null);
    markDraftChanged();
    startTransition(async () => {
      await resetButtonStyleForId(id);
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

  function resetFooterTexts() {
    setFooterContentDe(defaultFooterContentDe);
    setFooterContentEn(defaultFooterContentEn);
    setFooterOverride(false);
    markDraftChanged();
    startTransition(async () => {
      await resetFooterContent();
    });
  }

  function resetNavLabelsTexts() {
    setNavLabelsDe(defaultNavLabelsDe);
    setNavLabelsEn(defaultNavLabelsEn);
    setNavOverride(false);
    markDraftChanged();
    startTransition(async () => {
      await resetNavLabels();
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
            {footerOverride && (
              <button type="button" onClick={resetFooterTexts} className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Footer-Texte zurücksetzen
              </button>
            )}
            {navOverride && (
              <button type="button" onClick={resetNavLabelsTexts} className={resetButtonClass}>
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
                Navbar-Links zurücksetzen
              </button>
            )}
          </div>
        </div>

        <div style={previewThemeStyle} data-button-anim={buttonStyle.animation ?? undefined} className="bg-bg">
          {/* Navbar */}
          <div
            className="flex items-center justify-between gap-4 px-8 py-3.5 border-b border-line bg-bg/95 cursor-pointer"
            onClick={openPaletteEditor}
            title="Farbpalette bearbeiten"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageEditor("logo");
                }}
                className="group relative block w-[46px] h-[46px] rounded-full overflow-hidden flex-none cursor-pointer"
                title="Logo ändern"
              >
                <Image src={logoImage} alt="" fill sizes="46px" className="object-cover" />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openImageEditor("logoText");
                }}
                className="group relative block w-[170px] h-[34px] flex-none cursor-pointer"
                title="Logo-Schriftzug ändern"
              >
                {logoTextIsDefault ? (
                  <span className="block">
                    <span className="block font-serif text-[1.25rem] tracking-[0.12em] text-forest leading-none whitespace-nowrap">
                      AUSZEIT
                    </span>
                    <span className="block text-[0.56rem] leading-[1.15] tracking-[0.14em] uppercase text-gold whitespace-nowrap">
                      Ferienwohnung
                      <br />
                      an der Mosel
                    </span>
                  </span>
                ) : (
                  <Image src={logoTextImage} alt="" fill sizes="170px" className="object-contain object-left" />
                )}
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            </div>
            <nav className="flex items-center gap-[26px] max-[820px]:hidden">
              {NAV_LINK_ORDER.map(({ id, key }, i) => (
                <span
                  key={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openTextEditor(id);
                  }}
                  className={`${editableClass} text-[0.76rem] tracking-[0.1em] uppercase pb-1 border-b ${
                    i === 0 ? "border-gold text-forest" : "border-transparent text-ink"
                  }`}
                >
                  {navLabels[key]}
                </span>
              ))}
            </nav>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openButtonEditor("navbar.cta");
              }}
              className={`${editableClass} ${BUTTON_BASE_CLASS} ${BUTTON_VARIANT_CLASS.primary} flex-none`}
              style={{ ...BUTTON_SHAPE_STYLE, ...buttonInlineStyle("navbar.cta") }}
              data-button-anim={buttonAnimationAttr("navbar.cta")}
            >
              {PREVIEW_NAV_CTA[previewLocale]}
            </button>
          </div>

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
                  onClick={() => openButtonEditor("hero.ctaWohnungen")}
                  className={`${editableClass} ${BUTTON_BASE_CLASS} ${BUTTON_VARIANT_CLASS.primary}`}
                  style={{ ...BUTTON_SHAPE_STYLE, ...buttonInlineStyle("hero.ctaWohnungen") }}
                  data-button-anim={buttonAnimationAttr("hero.ctaWohnungen")}
                >
                  {content.hero.ctaWohnungen}
                </button>
                <button
                  type="button"
                  onClick={() => openButtonEditor("hero.ctaBuchen")}
                  className={`${editableClass} ${BUTTON_BASE_CLASS} ${BUTTON_VARIANT_CLASS["outline-light"]}`}
                  style={{ ...BUTTON_SHAPE_STYLE, ...buttonInlineStyle("hero.ctaBuchen") }}
                  data-button-anim={buttonAnimationAttr("hero.ctaBuchen")}
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

          {/* Footer */}
          <footer className="bg-forest text-white/75 pt-[46px] pb-[22px]">
            <div className="max-w-[1180px] mx-auto px-8">
              <div className="grid grid-cols-[1.4fr_1fr_1fr] max-[860px]:grid-cols-1 gap-8 pb-6 border-b border-white/14">
                <div>
                  <Editable
                    styles={styles}
                    onEdit={openTextEditor}
                    id="footer.brandName"
                    as="span"
                    className="font-serif text-white text-[1.15rem] tracking-[0.1em]"
                  >
                    {footerContent.brandName}
                  </Editable>
                  <Editable
                    styles={styles}
                    onEdit={openTextEditor}
                    id="footer.tagline"
                    as="p"
                    className="text-white/65 text-[0.85rem] mt-2 max-w-[300px]"
                  >
                    {footerContent.tagline}
                  </Editable>
                </div>
                <div>
                  <Editable
                    styles={styles}
                    onEdit={openTextEditor}
                    id="footer.navHeading"
                    as="h4"
                    className="text-white font-sans text-[0.75rem] tracking-[0.12em] uppercase mb-3"
                  >
                    {footerContent.navHeading}
                  </Editable>
                  <div className="grid grid-cols-2 gap-x-4">
                    {NAV_LINK_ORDER.map(({ id, key }) => (
                      <span
                        key={id}
                        onClick={() => openTextEditor(id)}
                        className={`${editableClass} block text-white/68 text-[0.85rem] mb-1.5`}
                      >
                        {navLabels[key]}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <Editable
                    styles={styles}
                    onEdit={openTextEditor}
                    id="footer.kontaktHeading"
                    as="h4"
                    className="text-white font-sans text-[0.75rem] tracking-[0.12em] uppercase mb-3"
                  >
                    {footerContent.kontaktHeading}
                  </Editable>
                  <p className="text-white/45 text-[0.8rem] italic m-0">(Kontaktdaten aus „Einstellungen&rdquo;)</p>
                </div>
              </div>
              <div className="flex justify-between flex-wrap gap-2.5 pt-4 text-[0.75rem] text-white/50">
                <Editable styles={styles} onEdit={openTextEditor} id="footer.copyrightSuffix" as="span">
                  © {new Date().getFullYear()} {footerContent.copyrightSuffix}
                </Editable>
                <span className="flex flex-wrap gap-x-2">
                  <Editable styles={styles} onEdit={openTextEditor} id="footer.legalImpressum">
                    {footerContent.legalImpressum}
                  </Editable>
                  <span>·</span>
                  <Editable styles={styles} onEdit={openTextEditor} id="footer.legalDatenschutz">
                    {footerContent.legalDatenschutz}
                  </Editable>
                  <span>·</span>
                  <Editable styles={styles} onEdit={openTextEditor} id="footer.legalCookie">
                    {footerContent.legalCookie}
                  </Editable>
                </span>
              </div>
            </div>
          </footer>
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
      {activeEditor?.kind === "palette" && (
        <PaletteEditPopup
          editor={activeEditor}
          saving={isPending}
          onClose={() => setActiveEditor(null)}
          onApply={(p) => {
            applyPalette(p);
            setActiveEditor(null);
          }}
          onReset={() => {
            resetColors();
            setActiveEditor(null);
          }}
        />
      )}
      {activeEditor?.kind === "button" && (
        <ButtonEditPopup
          editor={activeEditor}
          saving={isPending}
          defaultColors={colors}
          onClose={() => setActiveEditor(null)}
          onSave={handleSaveButton}
          onReset={handleResetButton}
        />
      )}
    </div>
  );
}

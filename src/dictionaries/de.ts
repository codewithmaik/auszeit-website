// Canonical German dictionary. `en.ts` is typed against `Dictionary` (inferred
// below), so TypeScript flags any missing or extra key between the two.
export const dictionary = {
  nav: {
    home: "Startseite",
    wohnung: "Die Wohnungen",
    region: "Die Region",
    bewertungen: "Gästebewertungen",
    kontakt: "Kontakt",
    anfragen: "Anfragen",
    menuOpen: "Menü öffnen",
    menuClose: "Menü schließen",
    switchTo: "EN",
    switchLabel: "Auf Englisch wechseln",
  },

  footer: {
    tagline: "Ihre Ferienwohnung an der Mosel — Ankommen. Durchatmen. Genießen.",
    navHeading: "Navigation",
    kontaktHeading: "Kontakt",
    copyrightSuffix: "AUSZEIT Ferienwohnung. Alle Rechte vorbehalten.",
    impressum: "Impressum",
    datenschutz: "Datenschutz",
    cookieSettings: "Cookie-Einstellungen",
    creditPrefix: "Technische Umsetzung:",
  },

  meta: {
    siteName: "AUSZEIT Ferienwohnung an der Mosel",
    defaultTitle: "AUSZEIT — Ferienwohnung an der Mosel",
    titleTemplate: "%s — AUSZEIT Ferienwohnung an der Mosel",
    description:
      "Ihre Auszeit an der Mosel. Gemütlich, stilvoll, unvergesslich — traumhafter Moselblick, moderne Ausstattung, viel Liebe zum Detail.",
    ogLocale: "de_DE",
  },

  home: {
    hero: {
      title1: "Ihre Auszeit",
      title2: "an der Mosel.",
      lead1: "Gemütlich. Stilvoll. Unvergesslich.",
      lead2:
        "Unsere Ferienwohnung bietet Ihnen Erholung pur – mit traumhaftem Moselblick, moderner Ausstattung und viel Liebe zum Detail.",
      ctaWohnungen: "Zu den Wohnungen",
      ctaBuchen: "Buchen & Anfragen",
    },
    features: [
      { key: "lage", title: "Traumhafte Lage", text: "Direkt an der Mosel – umgeben von Weinbergen & Natur." },
      {
        key: "wohnung",
        title: "Komfortable Wohnung",
        text: "Modern, gemütlich und mit allem ausgestattet, was Sie brauchen.",
      },
      { key: "erholung", title: "Erholung pur", text: "Entspannen, abschalten und die schönsten Momente genießen." },
      {
        key: "service",
        title: "Persönlicher Service",
        text: "Wir sind für Sie da – vor, während und nach Ihrem Aufenthalt.",
      },
    ],
    stepsEyebrow: "So einfach geht's",
    stepsTitle: "Ihre Auszeit in drei Schritten",
    steps: [
      {
        title: "1. Anfrage senden",
        text: "Wählen Sie Ihren Wunschzeitraum und schicken Sie uns eine unverbindliche Buchungsanfrage.",
      },
      {
        title: "2. Bestätigung erhalten",
        text: "Wir prüfen die Verfügbarkeit und melden uns meist innerhalb weniger Stunden persönlich zurück.",
      },
      {
        title: "3. Ankommen & genießen",
        text: "Schlüssel abholen, durchatmen und Ihre Auszeit an der Mosel in vollen Zügen genießen.",
      },
    ],
    bookEyebrow: "Buchen Sie Ihre Auszeit",
    bookTitle: "Jetzt Urlaub anfragen",
    bookText:
      "Wählen Sie Ihren gewünschten Zeitraum und senden Sie uns eine unverbindliche Anfrage. Wir melden uns schnellstmöglich bei Ihnen zurück.",
    bookBullets: ["Unverbindlich & schnell", "Beste Preise direkt bei uns", "Persönliche Beratung", "Sichere & einfache Anfrage"],
    wohlfuehl: {
      title: "Ihre Wohlfühloase",
      text: "Lichtdurchflutete Räume, ein Balkon mit Moselblick und eine Ausstattung zum Ankommen und Wohlfühlen.",
      more: "Mehr erfahren",
    },
    trust: [
      { title: "Sichere Buchung", text: "Ihre Daten sind bei uns sicher und geschützt." },
      { title: "Flexible An- & Abreise", text: "Nach Absprache sind individuelle An- und Abreisezeiten möglich." },
      { title: "Tolle Ausflugsziele", text: "Entdecken Sie die Mosel und ihre schönsten Seiten." },
      { title: "Wein & Genuss", text: "Erleben Sie die Mosel mit ihren Weinen und kulinarischen Highlights." },
    ],
  },

  wohnung: {
    metaTitle: "Die Wohnungen",
    heroEyebrow: "Die Wohnungen",
    heroTitle: "Unsere Wohnungstypen, ein Zuhause an der Mosel",
    heroText:
      "Vom lichtdurchfluteten Rieslinghaus bis zum puristischen Weinberg-Loft — jeder unserer Wohnungstypen hat seinen eigenen Charakter. Blättern Sie durch und finden Sie Ihre Auszeit.",
    emptyEyebrow: "Einen Moment",
    emptyTitle: "Unsere Wohnungen werden gerade aktualisiert",
    emptyText:
      "Bitte schauen Sie in Kürze wieder vorbei, oder kontaktieren Sie uns direkt — wir beraten Sie gern persönlich zu unseren Wohnungen.",
    emptyCta: "Jetzt anfragen",
    galleryEyebrow: "Galerie",
    galleryTitle: "Ein Blick in {name}",
    galleryText: "Weitere Eindrücke aus {name}. Klicken Sie auf ein Foto, um es vergrößert zu betrachten.",
    amenitiesEyebrow: "Ausstattung",
    amenitiesTitle: "Das bieten alle unsere Wohnungen",
    amenities: [
      { key: "betten", title: "Komfortable Betten", text: "Hochwertige Matratzen und Bettwäsche in allen Wohnungen." },
      {
        key: "kueche",
        title: "Vollausgestattete Küche",
        text: "Geschirrspüler, Kaffeemaschine, Backofen und alles fürs Kochen im Urlaub.",
      },
      { key: "bad", title: "Modernes Bad", text: "Regendusche, Fußbodenheizung und hochwertige Ausstattung." },
      { key: "balkon", title: "Balkon oder Terrasse", text: "Ein eigener Außenbereich mit Sicht auf Fluss und Weinberge." },
      { key: "wlan", title: "WLAN & Smart-TV", text: "Schnelles Internet und Streaming-Möglichkeiten inklusive." },
      { key: "parkplatz", title: "Privatparkplatz", text: "Kostenlose Stellplätze direkt am Haus." },
      { key: "waschmaschine", title: "Waschmaschine", text: "Für längere Aufenthalte praktisch mit an Bord." },
      { key: "klima", title: "Klimaanlage", text: "Angenehme Temperaturen auch an warmen Sommertagen." },
      { key: "haustiere", title: "Haustiere auf Anfrage", text: "Ihr Vierbeiner ist nach Absprache herzlich willkommen." },
    ],
    ctaEyebrow: "Noch unentschlossen?",
    ctaTitle: "Wir beraten Sie gern bei der Wahl",
    ctaButton: "Jetzt anfragen",
    slider: {
      ariaLabel: "Unsere Wohnungstypen",
      unitLabel: "Wohnungstyp {i} von {total}",
      prev: "Vorheriger Wohnungstyp",
      next: "Nächster Wohnungstyp",
      goTo: "Zu {name} springen",
      cta: "Jetzt anfragen",
    },
  },

  region: {
    metaTitle: "Die Region",
    heroEyebrow: "Die Region",
    heroTitle: "Die Mosel — Fluss, Wein und Weite",
    heroText:
      "Steile Weinberge, verträumte Winzerdörfer und einer der schönsten Flüsse Deutschlands. Entdecken Sie, was die Region zu bieten hat.",
    weinEyebrow: "Wein & Genuss",
    weinTitle: "Zuhause bei den Winzern",
    weinText1:
      "Die Moselregion zählt zu den ältesten Weinanbaugebieten Deutschlands. Steile Schieferhänge prägen die Landschaft und schenken den Rieslingen ihre unverwechselbare Mineralität.",
    weinText2:
      "Besuchen Sie kleine Familienweingüter, verkosten Sie direkt vom Winzer und lassen Sie sich die Geschichten hinter jedem Glas erzählen.",
    activitiesEyebrow: "Aktivitäten",
    activitiesTitle: "Erleben Sie die Mosel aktiv",
    activitiesText:
      "Ob aktiv oder entspannt, drinnen oder draußen — die Region rund um Bernkastel-Kues bietet für jeden Geschmack die passende Beschäftigung.",
    activities: [
      {
        key: "wandern",
        title: "Wandern im Moseltal",
        meta: "Ganzjährig · alle Schwierigkeitsgrade",
        text: "Der Moselsteig und zahlreiche Traumpfade führen direkt von der Haustür durch Weinberge, Wälder und vorbei an spektakulären Flussschleifen. Ob gemütlicher Spaziergang oder Tagestour mit Höhenmetern — für jeden Anspruch ist der passende Weg dabei.",
      },
      {
        key: "radfahren",
        title: "Radfahren auf dem Moselradweg",
        meta: "Frühling bis Herbst · familienfreundlich",
        text: "Der Moselradweg zählt zu den schönsten Flussradwegen Deutschlands und verläuft nahezu steigungsfrei direkt am Wasser entlang. Fahrräder und E-Bikes lassen sich in der Region unkompliziert leihen — ideal für Ausflüge zu Nachbarorten und Weingütern.",
      },
      {
        key: "weinproben",
        title: "Weinproben & Straußwirtschaften",
        meta: "Am schönsten: Spätsommer & Herbst",
        text: "Kleine Familienweingüter öffnen ihre Keller für Verkostungen, während saisonale Straußwirtschaften mit selbstgemachten Speisen und dem Wein des Hauses zum Verweilen einladen — ein Erlebnis, das die Mosel wie kaum ein anderes prägt.",
      },
      {
        key: "bootstouren",
        title: "Bootstouren & Kanufahrten",
        meta: "Mai bis Oktober",
        text: "Ob entspannte Flusskreuzfahrt zwischen den Weinbergen oder aktive Kanutour auf der Mosel — vom Wasser aus zeigt sich die Region von ihrer ruhigsten Seite. Mehrere Anbieter in der Nähe bieten Touren für jede Kondition an.",
      },
      {
        key: "kulinarik",
        title: "Kulinarik & Genussmomente",
        meta: "Ganzjährig",
        text: "Von urigen Winzerstuben bis zu ausgezeichneten Restaurants: Die Moselregion verwöhnt mit regionaler Küche, frischem Fisch aus dem Fluss und erstklassigem Riesling. Viele Adressen sind in wenigen Gehminuten erreichbar.",
      },
      {
        key: "feste",
        title: "Feste & Jahreszeiten-Highlights",
        meta: "Sommer: Weinfeste · Winter: Weihnachtsmärkte",
        text: "Im Sommer verwandeln Winzerfeste die Dörfer entlang der Mosel in fröhliche Feierorte, im Winter laden stimmungsvolle Weihnachtsmärkte in Bernkastel-Kues und Trier zum Verweilen ein. Zu jeder Jahreszeit gibt es einen guten Grund für einen Besuch.",
      },
    ],
    sightsEyebrow: "Ausflugsziele",
    sightsTitle: "Sehenswertes in der Nähe",
    sights: [
      {
        key: "bernkastel",
        title: "Bernkastel-Kues",
        text: "Historischer Marktplatz mit Fachwerkhäusern, ca. 10 Min. entfernt.",
      },
      {
        key: "landshut",
        title: "Burg Landshut",
        text: "Ruine oberhalb von Bernkastel mit Panoramablick über das Moseltal.",
      },
      {
        key: "bremm",
        title: "Moselschleife bei Bremm",
        text: "Eine der spektakulärsten Flussschleifen Europas, ca. 30 Min. entfernt.",
      },
      {
        key: "wanderweg",
        title: "Moseltal-Wanderweg",
        text: "Ausgeschilderte Wander- und Radwege direkt entlang des Flusses.",
      },
      {
        key: "winzer",
        title: "Weinprobe beim Winzer",
        text: "Zahlreiche Weingüter in Laufnähe bieten geführte Verkostungen an.",
      },
      { key: "trier", title: "Trier", text: "Deutschlands älteste Stadt mit römischem Erbe, ca. 45 Min. entfernt." },
    ],
    lageEyebrow: "Lage",
    lageTitle: "Mitten im Moseltal",
    mapTitle: "Lage der Ferienwohnung AUSZEIT",
  },

  bewertungen: {
    metaTitle: "Gästebewertungen",
    heroEyebrow: "Gästebewertungen",
    heroTitle: "Was unsere Gäste sagen",
    heroText:
      "Diese Bewertungen sind Platzhalter-Beispiele. Ersetzen Sie sie mit echten Rückmeldungen Ihrer Gäste, sobald diese vorliegen.",
    ratingLabel: "Bewertungen",
    reviews: [
      {
        text: "Ein wunderschöner Rückzugsort mit traumhaftem Blick auf die Mosel. Die Wohnung war liebevoll eingerichtet und sehr sauber.",
        name: "Platzhalter-Name, Mai 2026",
      },
      {
        text: "Perfekte Lage für Weinliebhaber, herzlicher Kontakt zur Gastgeberin und ein Balkon, den man kaum verlassen möchte.",
        name: "Platzhalter-Name, April 2026",
      },
      {
        text: "Wir kommen definitiv wieder! Ruhige Umgebung, top Ausstattung und tolle Ausflugstipps von den Gastgebern.",
        name: "Platzhalter-Name, März 2026",
      },
    ],
    ctaEyebrow: "Selbst erleben",
    ctaTitle: "Schreiben Sie das nächste Kapitel",
    ctaButton: "Jetzt anfragen",
  },

  kontakt: {
    metaTitle: "Kontakt",
    heroEyebrow: "Kontakt",
    heroTitle: "Wir freuen uns auf Sie",
    heroText: "Haben Sie Fragen oder möchten Sie direkt anfragen? Schreiben Sie uns — wir melden uns schnellstmöglich zurück.",
    infoEyebrow: "Direkt erreichbar",
    infoTitle: "Kontaktdaten",
    labelAdresse: "Adresse",
    labelTelefon: "Telefon",
    labelEmail: "E-Mail",
    labelErreichbarkeit: "Erreichbarkeit",
    erreichbarkeitValue: "Täglich 9:00 – 20:00 Uhr",
    faqEyebrow: "Häufige Fragen",
    faqTitle: "Gut zu wissen",
    faqItems: [
      {
        question: "Sind Haustiere erlaubt?",
        answer:
          "Ja, nach Absprache sind kleine bis mittelgroße Haustiere herzlich willkommen. Geben Sie uns bei Ihrer Anfrage bitte kurz Bescheid.",
      },
      { question: "Gibt es einen Parkplatz?", answer: "Ja, direkt am Haus steht Ihnen ein kostenloser Privatparkplatz zur Verfügung." },
      {
        question: "Wie funktioniert der Check-in?",
        answer: "Der Check-in ist ab 15:00 Uhr möglich, der Check-out bis 11:00 Uhr. Individuelle Zeiten sind nach Absprache oft machbar.",
      },
      {
        question: "Gibt es eine Mindestaufenthaltsdauer?",
        answer: "Die Wohnung ist ab einer Mindestaufenthaltsdauer von 3 Nächten buchbar.",
      },
      {
        question: "Ist WLAN vorhanden?",
        answer: "Ja, schnelles WLAN sowie ein Smart-TV mit Streaming-Möglichkeiten sind in der Wohnung inklusive.",
      },
      {
        question: "Wie und wann bezahle ich meinen Aufenthalt?",
        answer: "Nach Bestätigung Ihrer Anfrage erhalten Sie von uns alle Details zu Zahlung und Anreise per E-Mail.",
      },
    ],
    anfahrtEyebrow: "Anfahrt",
    anfahrtTitle: "So finden Sie uns",
    mapTitle: "Anfahrt zur Ferienwohnung AUSZEIT",
    submitLabel: "Anfrage senden",
  },

  impressum: {
    metaTitle: "Impressum",
    eyebrow: "Rechtliches",
    title: "Impressum",
  },

  datenschutz: {
    metaTitle: "Datenschutz",
    eyebrow: "Rechtliches",
    title: "Datenschutzerklärung",
  },

  bookingForm: {
    eyebrow: "Verfügbarkeit prüfen",
    labelAnreise: "Anreise",
    labelAbreise: "Abreise",
    labelGaeste: "Gäste",
    guestOptions: ["1 Erwachsener", "2 Erwachsene", "2 Erwachsene, 1 Kind", "2 Erwachsene, 2 Kinder", "Andere (bitte in Nachricht angeben)"],
    labelName: "Name",
    labelEmail: "E-Mail",
    labelTelefon: "Telefon (optional)",
    labelNachricht: "Nachricht (Zimmertyp und Gästeanzahl angeben)",
    submitDefault: "Verfügbarkeit anzeigen",
    submitting: "Wird gesendet …",
    consentNote: "Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren.",
    stepNote: "Im nächsten Schritt fragen wir kurz nach Ihren Kontaktdaten.",
    weiter: "Weiter",
    zurueck: "Zurück",
    errorValidation: "Bitte Name und eine gültige E-Mail-Adresse angeben.",
    successMailto: "Ihr E-Mail-Programm öffnet sich mit der ausgefüllten Anfrage.",
    successSent: "Vielen Dank! Ihre Anfrage wurde versendet — wir melden uns schnellstmöglich.",
    errorSend: "Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie uns direkt eine E-Mail.",
  },

  gallery: {
    zoom: "{alt} vergrößern",
    close: "Schließen",
    prev: "Vorheriges Bild",
    next: "Nächstes Bild",
  },

  map: {
    placeholderTitle: "Karte laden",
    placeholderText:
      "Hier würde eine Google-Maps-Karte geladen. Da dabei Daten an Google übertragen werden, laden wir die Karte erst nach Ihrer Zustimmung.",
    loadButton: "Karte laden & zustimmen",
    privacyLinkText: "Mehr dazu in unserer Datenschutzerklärung",
  },

  cookies: {
    bannerTitle: "Diese Website respektiert Ihre Privatsphäre",
    bannerText:
      "Wir verwenden nur technisch notwendige Cookies. Für die Anzeige von Google Maps benötigen wir zusätzlich Ihre Zustimmung, da dabei Daten an Google übertragen werden.",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Nur notwendige",
    settings: "Einstellungen",
    save: "Auswahl speichern",
    privacyLink: "Datenschutzerklärung",
    categoriesTitle: "Cookie-Einstellungen",
    necessaryTitle: "Technisch notwendig",
    necessaryText: "Erforderlich für den Betrieb der Website (z. B. Spracheinstellung, Admin-Login). Kann nicht deaktiviert werden.",
    mapsTitle: "Externe Karten (Google Maps)",
    mapsText: "Lädt eine interaktive Karte von Google. Dabei wird Ihre IP-Adresse an Google in den USA übermittelt.",
    alwaysOn: "Immer aktiv",
  },
};

export type Dictionary = typeof dictionary;

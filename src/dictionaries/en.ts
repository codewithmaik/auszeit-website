import type { Dictionary } from "./de";

// Typed against `Dictionary` (inferred from de.ts) so TypeScript flags any
// missing or extra key between the two languages.
export const dictionary: Dictionary = {
  nav: {
    home: "Home",
    wohnung: "The Apartments",
    region: "The Region",
    bewertungen: "Guest Reviews",
    kontakt: "Contact",
    anfragen: "Enquire",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    switchTo: "DE",
    switchLabel: "Switch to German",
  },

  footer: {
    tagline: "Your holiday apartment on the Moselle — Arrive. Breathe. Enjoy.",
    navHeading: "Navigation",
    kontaktHeading: "Contact",
    copyrightSuffix: "AUSZEIT Ferienwohnung. All rights reserved.",
    impressum: "Legal Notice",
    datenschutz: "Privacy Policy",
    cookieSettings: "Cookie Settings",
    creditPrefix: "Built by:",
  },

  meta: {
    siteName: "AUSZEIT Ferienwohnung an der Mosel",
    defaultTitle: "AUSZEIT — Holiday Apartment on the Moselle",
    titleTemplate: "%s — AUSZEIT Holiday Apartment on the Moselle",
    description:
      "Your getaway on the Moselle. Cosy, stylish, unforgettable — a stunning river view, modern amenities, and great attention to detail.",
    ogLocale: "en_US",
  },

  home: {
    hero: {
      title1: "Your Getaway",
      title2: "on the Moselle.",
      lead1: "Cosy. Stylish. Unforgettable.",
      lead2:
        "Our holiday apartment offers pure relaxation — with a stunning view of the Moselle, modern amenities, and great attention to detail.",
      ctaWohnungen: "View Apartments",
      ctaBuchen: "Book & Enquire",
    },
    features: [
      { key: "lage", title: "Beautiful Location", text: "Right on the Moselle – surrounded by vineyards & nature." },
      {
        key: "wohnung",
        title: "Comfortable Apartment",
        text: "Modern, cosy, and equipped with everything you need.",
      },
      { key: "erholung", title: "Pure Relaxation", text: "Unwind, switch off, and enjoy the finest moments." },
      {
        key: "service",
        title: "Personal Service",
        text: "We're here for you – before, during, and after your stay.",
      },
    ],
    stepsEyebrow: "It's this easy",
    stepsTitle: "Your getaway in three steps",
    steps: [
      {
        title: "1. Send an enquiry",
        text: "Choose your preferred dates and send us a non-binding booking enquiry.",
      },
      {
        title: "2. Get confirmation",
        text: "We check availability and usually get back to you personally within a few hours.",
      },
      {
        title: "3. Arrive & enjoy",
        text: "Pick up the keys, breathe out, and enjoy your getaway on the Moselle to the fullest.",
      },
    ],
    bookEyebrow: "Book Your Getaway",
    bookTitle: "Enquire About Your Holiday Now",
    bookText:
      "Choose your preferred dates and send us a non-binding enquiry. We'll get back to you as soon as possible.",
    bookBullets: ["Non-binding & quick", "Best rates, direct from us", "Personal advice", "Secure & simple enquiry"],
    wohlfuehl: {
      title: "Your Feel-Good Retreat",
      text: "Light-filled rooms, a balcony with a view of the Moselle, and everything you need to arrive and feel at home.",
      more: "Learn more",
    },
    trust: [
      { title: "Secure Booking", text: "Your data is safe and protected with us." },
      { title: "Flexible Arrival & Departure", text: "Individual arrival and departure times are often possible by arrangement." },
      { title: "Great Day Trips", text: "Discover the Moselle and its most beautiful sides." },
      { title: "Wine & Delight", text: "Experience the Moselle with its wines and culinary highlights." },
    ],
  },

  wohnung: {
    metaTitle: "The Apartments",
    heroEyebrow: "The Apartments",
    heroTitle: "Our Apartment Types, One Home on the Moselle",
    heroText:
      "From the light-filled Rieslinghaus to the minimalist Weinberg-Loft — each of our apartment types has its own character. Browse through and find your perfect getaway.",
    emptyEyebrow: "One Moment",
    emptyTitle: "Our apartments are currently being updated",
    emptyText:
      "Please check back again shortly, or contact us directly — we're happy to advise you personally about our apartments.",
    emptyCta: "Enquire now",
    galleryEyebrow: "Gallery",
    galleryTitle: "A Look Inside {name}",
    galleryText: "More impressions from {name}. Click a photo to view it enlarged.",
    amenitiesEyebrow: "Amenities",
    amenitiesTitle: "What All Our Apartments Offer",
    amenities: [
      { key: "betten", title: "Comfortable Beds", text: "High-quality mattresses and bed linen in every apartment." },
      {
        key: "kueche",
        title: "Fully Equipped Kitchen",
        text: "Dishwasher, coffee machine, oven, and everything you need for cooking on holiday.",
      },
      { key: "bad", title: "Modern Bathroom", text: "Rain shower, underfloor heating, and high-quality fittings." },
      { key: "balkon", title: "Balcony or Terrace", text: "Your own outdoor space with a view of the river and vineyards." },
      { key: "wlan", title: "Wi-Fi & Smart TV", text: "Fast internet and streaming included." },
      { key: "parkplatz", title: "Private Parking", text: "Free parking spaces right at the house." },
      { key: "waschmaschine", title: "Washing Machine", text: "Handy to have on board for longer stays." },
      { key: "klima", title: "Air Conditioning", text: "Pleasant temperatures even on warm summer days." },
      { key: "haustiere", title: "Pets on Request", text: "Your four-legged friend is warmly welcome by arrangement." },
    ],
    ctaEyebrow: "Still Undecided?",
    ctaTitle: "We're Happy to Help You Choose",
    ctaButton: "Enquire now",
    slider: {
      ariaLabel: "Our apartment types",
      unitLabel: "Apartment type {i} of {total}",
      prev: "Previous apartment type",
      next: "Next apartment type",
      goTo: "Jump to {name}",
      cta: "Enquire now",
    },
  },

  region: {
    metaTitle: "The Region",
    heroEyebrow: "The Region",
    heroTitle: "The Moselle — River, Wine, and Wide-Open Space",
    heroText:
      "Steep vineyards, dreamy winegrowing villages, and one of Germany's most beautiful rivers. Discover what the region has to offer.",
    weinEyebrow: "Wine & Delight",
    weinTitle: "At Home with the Winegrowers",
    weinText1:
      "The Moselle region is one of Germany's oldest wine-growing areas. Steep slate slopes shape the landscape and give the Rieslings their unmistakable minerality.",
    weinText2:
      "Visit small family-run wineries, taste wine straight from the winegrower, and let them tell you the stories behind every glass.",
    activitiesEyebrow: "Activities",
    activitiesTitle: "Experience the Moselle Actively",
    activitiesText:
      "Whether active or relaxed, indoors or outdoors — the region around Bernkastel-Kues offers the right activity for every taste.",
    activities: [
      {
        key: "wandern",
        title: "Hiking in the Moselle Valley",
        meta: "Year-round · all difficulty levels",
        text: "The Moselsteig and numerous scenic trails lead straight from the door through vineyards, forests, and past spectacular river bends. Whether a leisurely stroll or a day tour with some elevation — there's a route to suit every ability.",
      },
      {
        key: "radfahren",
        title: "Cycling the Moselle Cycle Path",
        meta: "Spring to autumn · family-friendly",
        text: "The Moselle Cycle Path is one of Germany's most beautiful riverside cycle routes and runs almost flat right along the water. Bikes and e-bikes are easy to rent in the region — perfect for trips to neighbouring villages and wineries.",
      },
      {
        key: "weinproben",
        title: "Wine Tastings & Straußwirtschaften",
        meta: "At their best: late summer & autumn",
        text: "Small family wineries open their cellars for tastings, while seasonal Straußwirtschaften (seasonal wine taverns) invite you to linger with home-made food and the house wine — an experience that defines the Moselle like nowhere else.",
      },
      {
        key: "bootstouren",
        title: "Boat Trips & Canoeing",
        meta: "May to October",
        text: "Whether a relaxed river cruise between the vineyards or an active canoe tour on the Moselle — from the water, the region shows its calmest side. Several local operators offer tours for every fitness level.",
      },
      {
        key: "kulinarik",
        title: "Culinary Delights",
        meta: "Year-round",
        text: "From rustic winegrower taverns to award-winning restaurants: the Moselle region spoils you with regional cuisine, fresh fish from the river, and first-class Riesling. Many places are just a few minutes' walk away.",
      },
      {
        key: "feste",
        title: "Festivals & Seasonal Highlights",
        meta: "Summer: wine festivals · Winter: Christmas markets",
        text: "In summer, winegrower festivals turn the villages along the Moselle into joyful gathering places; in winter, atmospheric Christmas markets in Bernkastel-Kues and Trier invite you to linger. There's a good reason to visit in every season.",
      },
    ],
    sightsEyebrow: "Day Trips",
    sightsTitle: "Sights Nearby",
    sights: [
      {
        key: "bernkastel",
        title: "Bernkastel-Kues",
        text: "Historic market square with half-timbered houses, about 10 minutes away.",
      },
      {
        key: "landshut",
        title: "Landshut Castle",
        text: "Ruin above Bernkastel with a panoramic view over the Moselle valley.",
      },
      {
        key: "bremm",
        title: "Moselle Loop at Bremm",
        text: "One of Europe's most spectacular river loops, about 30 minutes away.",
      },
      {
        key: "wanderweg",
        title: "Moselle Valley Trail",
        text: "Signposted hiking and cycling paths right along the river.",
      },
      {
        key: "winzer",
        title: "Wine Tasting at the Winegrower's",
        text: "Numerous wineries within walking distance offer guided tastings.",
      },
      { key: "trier", title: "Trier", text: "Germany's oldest city with a Roman heritage, about 45 minutes away." },
    ],
    lageEyebrow: "Location",
    lageTitle: "Right in the Heart of the Moselle Valley",
    mapTitle: "Location of the AUSZEIT holiday apartment",
  },

  bewertungen: {
    metaTitle: "Guest Reviews",
    heroEyebrow: "Guest Reviews",
    heroTitle: "What Our Guests Say",
    heroText:
      "These reviews are placeholder examples. Replace them with real feedback from your guests once it's available.",
    ratingLabel: "reviews",
    reviews: [
      {
        text: "A beautiful retreat with a stunning view of the Moselle. The apartment was lovingly furnished and very clean.",
        name: "Placeholder name, May 2026",
      },
      {
        text: "Perfect location for wine lovers, a warm welcome from the host, and a balcony you'll barely want to leave.",
        name: "Placeholder name, April 2026",
      },
      {
        text: "We'll definitely be back! Quiet surroundings, great amenities, and wonderful excursion tips from the hosts.",
        name: "Placeholder name, March 2026",
      },
    ],
    ctaEyebrow: "See for Yourself",
    ctaTitle: "Write the Next Chapter",
    ctaButton: "Enquire now",
  },

  kontakt: {
    metaTitle: "Contact",
    heroEyebrow: "Contact",
    heroTitle: "We Look Forward to Hearing From You",
    heroText: "Have questions or want to enquire directly? Write to us — we'll get back to you as soon as possible.",
    infoEyebrow: "Get in Touch",
    infoTitle: "Contact Details",
    labelAdresse: "Address",
    labelTelefon: "Phone",
    labelEmail: "Email",
    labelErreichbarkeit: "Availability",
    erreichbarkeitValue: "Daily 9:00 AM – 8:00 PM",
    faqEyebrow: "Frequently Asked Questions",
    faqTitle: "Good to Know",
    faqItems: [
      {
        question: "Are pets allowed?",
        answer:
          "Yes, small to medium-sized pets are warmly welcome by arrangement. Please let us know briefly in your enquiry.",
      },
      { question: "Is there parking?", answer: "Yes, a free private parking space is available right at the house." },
      {
        question: "How does check-in work?",
        answer: "Check-in is possible from 3:00 PM, check-out until 11:00 AM. Individual times can often be arranged.",
      },
      {
        question: "Is there a minimum length of stay?",
        answer: "The apartment can be booked for a minimum stay of 3 nights.",
      },
      {
        question: "Is Wi-Fi available?",
        answer: "Yes, fast Wi-Fi and a smart TV with streaming options are included in the apartment.",
      },
      {
        question: "How and when do I pay for my stay?",
        answer: "Once your enquiry is confirmed, we'll email you all the details about payment and arrival.",
      },
    ],
    anfahrtEyebrow: "Getting Here",
    anfahrtTitle: "How to Find Us",
    mapTitle: "Directions to the AUSZEIT holiday apartment",
    submitLabel: "Send enquiry",
  },

  impressum: {
    metaTitle: "Legal Notice",
    eyebrow: "Legal",
    title: "Legal Notice",
  },

  datenschutz: {
    metaTitle: "Privacy Policy",
    eyebrow: "Legal",
    title: "Privacy Policy",
  },

  bookingForm: {
    eyebrow: "Check Availability",
    labelAnreise: "Check-in",
    labelAbreise: "Check-out",
    labelGaeste: "Guests",
    guestOptions: ["1 adult", "2 adults", "2 adults, 1 child", "2 adults, 2 children", "Other (please specify in message)"],
    labelName: "Name",
    labelEmail: "Email",
    labelTelefon: "Phone (optional)",
    labelNachricht: "Message (optional)",
    submitDefault: "Show availability",
    submitting: "Sending …",
    consentNote: "By submitting, you agree that we may contact you regarding your enquiry.",
    stepNote: "In the next step, we'll briefly ask for your contact details.",
    weiter: "Next",
    zurueck: "Back",
    errorValidation: "Please provide a name and a valid email address.",
    successMailto: "Your email program will open with the pre-filled enquiry.",
    successSent: "Thank you! Your enquiry has been sent — we'll get back to you as soon as possible.",
    errorSend: "Unfortunately something went wrong. Please try again or email us directly.",
  },

  gallery: {
    zoom: "Enlarge {alt}",
    close: "Close",
    prev: "Previous image",
    next: "Next image",
  },

  map: {
    placeholderTitle: "Load Map",
    placeholderText:
      "A Google Maps map would load here. Since this transmits data to Google, we only load it after you consent.",
    loadButton: "Load map & consent",
    privacyLinkText: "More in our privacy policy",
  },

  cookies: {
    bannerTitle: "This Website Respects Your Privacy",
    bannerText:
      "We only use technically necessary cookies. To display Google Maps, we additionally need your consent, since this transmits data to Google.",
    acceptAll: "Accept all",
    rejectAll: "Necessary only",
    settings: "Settings",
    save: "Save selection",
    privacyLink: "Privacy Policy",
    categoriesTitle: "Cookie Settings",
    necessaryTitle: "Technically necessary",
    necessaryText: "Required for the website to function (e.g. language setting, admin login). Cannot be disabled.",
    mapsTitle: "External Maps (Google Maps)",
    mapsText: "Loads an interactive map from Google. This transmits your IP address to Google in the USA.",
    alwaysOn: "Always active",
  },
};

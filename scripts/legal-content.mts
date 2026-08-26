// Shared legal placeholder texts for Impressum & Datenschutzerklärung, used
// by both the initial seed and the one-off update-legal-content script.
// Bracketed fields (e.g. [Firmierung / Name]) must be filled in by the site
// owner via the admin panel — see DEVNOTES.md.

export function impressumDe(telephone: string, email: string): string {
  return `Angaben gemäß § 5 TMG

[Firmierung / Name]
[Straße und Hausnummer]
[PLZ und Ort]

Vertreten durch:
[Name der vertretungsberechtigten Person]

Kontakt:
Telefon: ${telephone}
E-Mail: ${email}

Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
[USt-IdNr. eintragen, falls vorhanden]

Bitte ergänzen oder lassen Sie diese Pflichtangaben durch eine fachkundige Stelle prüfen.`;
}

export function impressumEn(telephone: string, email: string): string {
  return `Information according to § 5 of the German Telemedia Act (TMG)

[Company / Owner name]
[Street and house number]
[Postal code and city]

Represented by:
[Name of the authorised representative]

Contact:
Phone: ${telephone}
Email: ${email}

VAT identification number according to § 27a of the German VAT Act:
[Enter VAT ID, if applicable]

This is a courtesy translation. As a German legal notice ("Impressum"), the German version is authoritative. Please complete these mandatory details, or have them reviewed by a qualified professional, in both languages.`;
}

export function datenschutzDe(): string {
  return `DATENSCHUTZERKLÄRUNG

Stand: [Datum einfügen]

1. Verantwortlicher

Verantwortlicher für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:

[Firmierung / Name]
[Straße und Hausnummer]
[PLZ und Ort]
E-Mail: [E-Mail-Adresse, siehe Impressum]

Weitere Angaben finden Sie im Impressum dieser Website.

2. Allgemeines zur Datenverarbeitung

Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist oder eine ausdrückliche Einwilligung vorliegt. Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur nach Einwilligung des Nutzers (Art. 6 Abs. 1 lit. a DSGVO), zur Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO) oder aufgrund eines berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO). Eine erteilte Einwilligung kann jederzeit mit Wirkung für die Zukunft widerrufen werden.

3. Bereitstellung der Website und Erstellung von Logfiles

Bei jedem Aufruf dieser Website erfasst unser Hosting-Anbieter automatisch Daten und Informationen im Rahmen sogenannter Server-Logfiles. Dabei können folgende Daten erhoben werden:

– IP-Adresse des zugreifenden Geräts
– Datum und Uhrzeit des Zugriffs
– verwendeter Browsertyp und Version, Betriebssystem
– Referrer-URL (zuvor besuchte Seite)
– angeforderte Datei bzw. Seite, übertragene Datenmenge, Zugriffsstatus

Die Speicherung dieser Daten erfolgt zur Sicherstellung eines störungsfreien Betriebs der Website sowie zur Gewährleistung der Sicherheit unserer informationstechnischen Systeme (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse). Eine Zusammenführung dieser Daten mit anderen Datenquellen findet nicht statt. Die IP-Adresse wird nur für die Dauer der Sitzung bzw. für die vom Hosting-Anbieter üblichen, kurzen Aufbewahrungsfristen gespeichert.

4. Hosting und technische Infrastruktur

Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (bzw. Vercel B.V. für Kunden in der EU) gehostet. Vercel verarbeitet in unserem Auftrag u. a. die unter Ziffer 3 genannten Zugriffsdaten. Mit Vercel besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO. Soweit dabei Daten in die USA übermittelt werden, stützt sich diese Übermittlung auf geeignete Garantien, insbesondere Standardvertragsklauseln und/oder die Zertifizierung von Vercel nach dem EU-U.S. Data Privacy Framework.

Für die Speicherung der Wohnungsdaten (Beschreibungstexte, Ausstattungsmerkmale) und der Website-Einstellungen (Kontaktdaten, Impressum- und Datenschutztexte) nutzen wir die Datenbank „Neon" (bereitgestellt über den Vercel Marketplace). In dieser Datenbank werden ausschließlich von uns selbst gepflegte Inhalte gespeichert – keine personenbezogenen Daten von Website-Besuchern.

Fotos der Wohnungen werden über „Vercel Blob" gespeichert, einen Objektspeicher-Dienst von Vercel. Auch hier werden ausschließlich von uns bereitgestellte Bilddateien gespeichert, keine personenbezogenen Besucherdaten.

5. Schriftarten (Google Fonts)

Diese Website nutzt zur einheitlichen Darstellung von Schriftarten sogenannte Web Fonts von Google („Google Fonts"). Die Einbindung erfolgt technisch jedoch nicht durch einen Aufruf der Google-Server beim Seitenaufruf: Die Schriftdateien werden bereits beim Erstellen der Website (Build-Prozess) heruntergeladen und werden ausschließlich von unserem eigenen Server bzw. von Vercel als Teil dieser Website ausgeliefert. Es findet somit beim Besuch dieser Website keine Verbindung zu Servern von Google statt und es werden keine Daten an Google übertragen.

6. Cookies und lokaler Speicher

Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Wir unterscheiden zwischen technisch notwendigen und nicht notwendigen Cookies bzw. vergleichbaren Speichertechnologien (z. B. local storage).

a) Technisch notwendige Speicherung (Art. 6 Abs. 1 lit. f DSGVO, § 25 Abs. 2 Nr. 2 TTDSG)

– Spracheinstellung: Ein Cookie speichert, ob Sie die Website auf Deutsch oder Englisch besuchen möchten. Dies dient ausschließlich der korrekten Darstellung der Website.
– Admin-Login: Für den passwortgeschützten Verwaltungsbereich dieser Website (nicht für reguläre Besucher zugänglich) wird ein Sitzungs-Cookie gesetzt, das die Anmeldung technisch ermöglicht.
– Ihre Cookie-Einstellung selbst (siehe unten) wird in Ihrem Browser (local storage) gespeichert, damit wir Sie nicht bei jedem Besuch erneut fragen müssen.

Diese Speicherungen sind für den Betrieb der Website zwingend erforderlich und können nicht deaktiviert werden.

b) Einwilligungsbedürftige Inhalte: Google Maps

Auf den Seiten „Kontakt" und „Die Region" bieten wir die Möglichkeit, eine interaktive Karte des Kartendienstes Google Maps anzuzeigen, betrieben von Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland (bzw. Google LLC, USA). Die Karte wird nicht automatisch geladen, sondern erst, nachdem Sie über unseren Cookie-Hinweis bzw. den entsprechenden Button auf der jeweiligen Seite ausdrücklich zugestimmt haben (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TTDSG).

Erst mit dem Laden der Karte wird eine Verbindung zu Servern von Google hergestellt; dabei kann Ihre IP-Adresse sowie ggf. weitere Geräteinformationen an Google, auch in die USA, übermittelt werden. Wir haben keinen Einfluss auf Umfang und weitere Verarbeitung der von Google erhobenen Daten. Informationen zum Datenschutz bei Google finden Sie unter: https://policies.google.com/privacy

Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft über den Link „Cookie-Einstellungen" im Footer dieser Website widerrufen.

7. Kontakt- und Buchungsformular

Wenn Sie uns über das Kontakt- oder Buchungsformular eine Anfrage zukommen lassen, verarbeiten wir die von Ihnen dort angegebenen Daten (Name, E-Mail-Adresse, optional Telefonnummer, gewünschte Reisedaten, Anzahl Gäste sowie Ihre Nachricht) zur Bearbeitung Ihrer Anfrage.

Die Übermittlung erfolgt technisch entweder
– über den Formular-Dienstleister Formspree (Formspree, Inc., USA), sobald dieser für die jeweilige Website aktiv konfiguriert ist, oder
– solange dies nicht der Fall ist, direkt über Ihr eigenes, lokal auf Ihrem Gerät installiertes E-Mail-Programm, das sich mit einer vorausgefüllten E-Mail an uns öffnet. In diesem Fall werden die Daten nicht über unsere Server oder Dritte geleitet, sondern von Ihrem E-Mail-Programm direkt versendet.

Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Erfüllung vorvertraglicher Maßnahmen bzw. eines Vertrags über die Ferienwohnung) sowie ergänzend Art. 6 Abs. 1 lit. a DSGVO, soweit Sie in die Kontaktaufnahme eingewilligt haben. Ihre Angaben werden ausschließlich zur Bearbeitung Ihrer Anfrage sowie für etwaige Anschlussfragen genutzt und nicht an Dritte weitergegeben, außer an den vorgenannten Formular-Dienstleister, soweit dieser eingesetzt wird. Ihre Daten werden gelöscht, sobald sie für die Bearbeitung Ihrer Anfrage nicht mehr erforderlich sind, spätestens nach Ablauf gesetzlicher Aufbewahrungsfristen (z. B. aus dem Handels- oder Steuerrecht bei zustande gekommenen Buchungen).

8. Weitergabe von Daten

Eine Übermittlung Ihrer personenbezogenen Daten an Dritte zu anderen als den in dieser Erklärung genannten Zwecken findet nicht statt. Wir geben Ihre Daten nur an Dritte weiter, wenn dies zur Vertragserfüllung erforderlich ist (z. B. an die oben genannten Auftragsverarbeiter), wir gesetzlich dazu verpflichtet sind, oder Sie zuvor eingewilligt haben.

9. SSL-/TLS-Verschlüsselung

Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an dem Schloss-Symbol in der Adresszeile Ihres Browsers sowie daran, dass die Adresszeile mit „https://" beginnt.

10. Automatisierte Entscheidungsfindung

Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO findet auf dieser Website nicht statt.

11. Ihre Rechte als betroffene Person

Ihnen stehen gegenüber uns hinsichtlich Ihrer personenbezogenen Daten folgende Rechte zu:

– Recht auf Auskunft (Art. 15 DSGVO)
– Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)
– Recht auf Löschung (Art. 17 DSGVO)
– Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)
– Recht auf Datenübertragbarkeit (Art. 20 DSGVO)
– Widerspruchsrecht gegen die Verarbeitung (Art. 21 DSGVO)
– Recht auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO)

Ihnen steht zudem ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde zu (Art. 77 DSGVO), insbesondere in dem Mitgliedstaat Ihres gewöhnlichen Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes.

12. Kontakt zu Datenschutzfragen

Bei Fragen zur Erhebung, Verarbeitung oder Nutzung Ihrer personenbezogenen Daten, bei Auskünften, Berichtigung, Sperrung oder Löschung von Daten sowie bei Widerruf erteilter Einwilligungen wenden Sie sich bitte an die im Impressum genannte Kontakt-E-Mail-Adresse.

13. Änderung dieser Datenschutzerklärung

Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die jeweils aktuelle Datenschutzerklärung.

Hinweis: Diese Datenschutzerklärung wurde auf Basis der tatsächlich auf dieser Website eingesetzten Technik erstellt und deckt die üblichen gesetzlichen Pflichtangaben ab. Sie ersetzt keine rechtliche Beratung im Einzelfall – bitte lassen Sie den Text, insbesondere nach dem Ausfüllen der eckigen Klammern und vor Live-Schaltung eines Formular-Dienstleisters, von einer fachkundigen Stelle (z. B. einem auf Datenschutz spezialisierten Rechtsanwalt) prüfen.`;
}

export function datenschutzEn(): string {
  return `PRIVACY POLICY

Last updated: [insert date]

This is a courtesy translation of our German-language privacy policy ("Datenschutzerklärung"). The German version is legally authoritative for this German business; in case of any discrepancy, the German text applies.

1. Controller

The controller responsible for data processing on this website within the meaning of the General Data Protection Regulation (GDPR) is:

[Company / Owner name]
[Street and house number]
[Postal code and city]
Email: [see legal notice]

Further details can be found in this website's legal notice ("Impressum").

2. General Information on Data Processing

We generally only process personal data of our users to the extent necessary to provide a functioning website along with our content and services, or where we have obtained explicit consent. Processing takes place based on user consent (Art. 6(1)(a) GDPR), for the performance of a contract or pre-contractual measures (Art. 6(1)(b) GDPR), or on the basis of a legitimate interest (Art. 6(1)(f) GDPR). Any consent given may be withdrawn at any time with future effect.

3. Provision of the Website and Server Log Files

Each time this website is accessed, our hosting provider automatically collects data in server log files, which may include:

– IP address of the accessing device
– date and time of access
– browser type and version, operating system
– referrer URL (previously visited page)
– requested file/page, amount of data transferred, access status

This data is processed to ensure smooth operation of the website and the security of our IT systems (Art. 6(1)(f) GDPR, legitimate interest). This data is not combined with other data sources. The IP address is stored only for the duration of the session or for the short retention periods customary with our hosting provider.

4. Hosting and Technical Infrastructure

This website is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (or Vercel B.V. for EU customers). Vercel processes the access data described in section 3 on our behalf. We have entered into a data processing agreement with Vercel pursuant to Art. 28 GDPR. Where data is transferred to the USA, this transfer relies on appropriate safeguards, in particular standard contractual clauses and/or Vercel's certification under the EU-U.S. Data Privacy Framework.

We use the "Neon" database (provided via the Vercel Marketplace) to store apartment listing data (descriptions, amenities) and website settings (contact details, legal notice and privacy policy text). This database contains only content maintained by us — no personal data of website visitors.

Photos of the apartments are stored using "Vercel Blob", an object storage service provided by Vercel. This, too, contains only image files provided by us, not personal visitor data.

5. Fonts (Google Fonts)

This website uses web fonts from Google ("Google Fonts") for a consistent typographic appearance. However, these fonts are not loaded from Google's servers when you visit the site: the font files are downloaded once, at build time, and are served exclusively from our own server/Vercel as part of this website. As a result, visiting this website does not establish any connection to Google's servers, and no data is transmitted to Google for this purpose.

6. Cookies and Local Storage

Cookies are small text files stored on your device. We distinguish between technically necessary and non-necessary cookies or comparable storage technologies (e.g. local storage).

a) Technically necessary storage (Art. 6(1)(f) GDPR, § 25(2) no. 2 German TTDSG)

– Language setting: a cookie stores whether you would like to view the website in German or English. This serves solely to display the website correctly.
– Admin login: for this website's password-protected admin area (not accessible to regular visitors), a session cookie is set that technically enables the login.
– Your cookie preference itself (see below) is stored in your browser (local storage) so we don't have to ask again on every visit.

This storage is strictly necessary for the website to function and cannot be disabled.

b) Content requiring consent: Google Maps

On the "Contact" and "Region" pages, we offer the option to display an interactive map from the Google Maps service, operated by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (or Google LLC, USA). The map is not loaded automatically; it is only loaded after you have explicitly consented via our cookie banner or the corresponding button on the relevant page (Art. 6(1)(a) GDPR, § 25(1) German TTDSG).

Only once the map is loaded is a connection established to Google's servers; your IP address and possibly other device information may be transmitted to Google, including to the USA. We have no influence over the scope and further processing of the data collected by Google. Information on Google's data protection practices can be found at: https://policies.google.com/privacy

You can withdraw your consent at any time, with future effect, via the "Cookie Settings" link in this website's footer.

7. Contact and Booking Form

If you send us an enquiry via the contact or booking form, we process the data you provide there (name, email address, optionally phone number, requested travel dates, number of guests, and your message) in order to handle your enquiry.

Technically, this is transmitted either
– via the form service provider Formspree (Formspree, Inc., USA), once it is actively configured for the relevant website, or
– as long as that is not the case, directly via your own, locally installed email program, which opens with a pre-filled email addressed to us. In this case, the data is not routed through our servers or any third party, but sent directly by your email program.

The legal basis for this processing is Art. 6(1)(b) GDPR (performance of pre-contractual measures or a contract regarding the holiday apartment), supplemented by Art. 6(1)(a) GDPR where you have consented to being contacted. Your details are used exclusively to handle your enquiry and any related follow-up questions, and are not shared with third parties other than the form service provider mentioned above, if used. Your data is deleted as soon as it is no longer required to process your enquiry, and at the latest after statutory retention periods have expired (e.g. under commercial or tax law for confirmed bookings).

8. Disclosure of Data

Your personal data is not transferred to third parties for purposes other than those stated in this policy. We only share your data with third parties where necessary to fulfil a contract (e.g. with the processors named above), where we are legally obliged to do so, or where you have given prior consent.

9. SSL/TLS Encryption

For security reasons and to protect the transmission of confidential content, this website uses SSL/TLS encryption. You can recognise an encrypted connection by the padlock icon in your browser's address bar and by the address beginning with "https://".

10. Automated Decision-Making

No automated decision-making, including profiling within the meaning of Art. 22 GDPR, takes place on this website.

11. Your Rights as a Data Subject

You have the following rights with respect to your personal data:

– Right of access (Art. 15 GDPR)
– Right to rectification of inaccurate data (Art. 16 GDPR)
– Right to erasure (Art. 17 GDPR)
– Right to restriction of processing (Art. 18 GDPR)
– Right to data portability (Art. 20 GDPR)
– Right to object to processing (Art. 21 GDPR)
– Right to withdraw consent given, with future effect (Art. 7(3) GDPR)

You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR), in particular in the member state of your habitual residence, place of work, or the place of the alleged infringement.

12. Contact for Privacy Questions

For questions about the collection, processing, or use of your personal data, for information requests, correction, blocking, or deletion of data, or to withdraw consent given, please contact the email address listed in the legal notice.

13. Changes to This Privacy Policy

We reserve the right to amend this privacy policy so that it always complies with current legal requirements, or to reflect changes to our services. Your next visit will then be subject to the then-current privacy policy.

Note: This privacy policy was prepared based on the technology actually used on this website and covers the usual statutory requirements. It does not replace individual legal advice — please have the text reviewed by a qualified professional (e.g. a lawyer specialising in data protection), especially after filling in the bracketed placeholders and before activating a live form service provider.`;
}

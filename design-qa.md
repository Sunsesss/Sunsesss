# Design QA — СКТБ «СКиТ»

final result: passed

## Visual targets

- Hero: `/workspace/generated_images/exec-d3e0753b-759b-4c52-a957-d483656d6e60.png` (1487 × 1058).
- Directions and development: `/workspace/generated_images/exec-eec7acd9-a67b-4df5-a15e-854e203b81dd.png` (921 × 1708).
- Production and contacts: `/workspace/generated_images/exec-1a8d2dcd-6782-4285-9ea3-04f7764279ac.png` (899 × 1750).
- Intentional content override: all email addresses and mail actions use `mail@skitlab.ru`, as requested.

## Browser evidence

Chromium, actual production build served by Vite preview. Desktop viewport: 1487 × 1058 CSS pixels, deviceScaleFactor 1. Mobile and intermediate widths: 320, 390, 768, 1024; wide desktop: 1920. The final production image/footer adjustment was additionally checked at 390, 1487 and 1920.

Evidence directory: `/workspace/artifacts/skit-qa/`.

- `hero.png`: browser-rendered first screen, 1487 × 1058.
- `full-1487.png`, `full-390.png`: full-page desktop and mobile captures, all images decoded before capture.
- `hero-comparison.png`: approved source and browser capture in the same image; source left, implementation right.
- `middle-comparison.png`: directions and development comparison, same column widths.
- `ending-comparison.png`: production and contacts comparison after photo-height correction.
- `type-comparison.png`: focused header/wordmark/headline comparison.

The hero is compared at identical pixel dimensions and 1× density. Continuation sources were generated at different widths; comparison columns are both 744 pixels wide, preserving each source's aspect ratio. Section heights are retained independently, not distorted to claim pixel equality. No browser chrome is included. Captures show default closed direction rows, closed navigation dialog, and production photo 1 of 3. Expanded rows, menu and gallery states were tested separately.

## Comparison history

1. Initial desktop capture: hero second line sat too low, logo emblem was too small, blue approach strip was too light, and the development section reused the front/back pair rather than showing the open device. P2. Corrected headline line-height and top spacing; increased emblem display scale; changed approach type weight; produced a separate open-back image asset and placed it in development.
2. Continuation comparison: section headings and direction labels were too small relative to the approved continuation. P2. Increased desktop type scale, row rhythm and board image height; retained responsive overrides below 1101px. Re-captured desktop and checked overflow across breakpoints.
3. Final production comparison: main photograph was too shallow and footer branding too small. P2. Increased desktop photo height from 650 to 860px, secondary image to 440px, and footer type scale. Rebuilt production and re-captured at 390/1487/1920. Evidence: final `ending-comparison.png`.
4. Final comparisons reviewed together with source images. No remaining actionable P0/P1/P2 findings.

## Required fidelity surfaces

- **Fonts and typography:** local Manrope variable with Cyrillic support. Bold/light hierarchy, headline line breaks, editorial section hierarchy and blue contact typography retained. Exact font metadata is unavailable in the generated reference; small glyph/weight differences remain P3. Navigation and detail text use practical web sizes rather than raster-image text tracing.
- **Spacing and layout:** lifted hero heading, overlapping product composition, ruled section indexes, two-column directions, four-stage development process, asymmetric production gallery and blue contact ending retained. Mobile follows an intentional stacked layout; no clipping or horizontal overflow at any tested width.
- **Colors and tokens:** warm ivory, near-black text and cobalt accent. Flat browser background intentionally replaces subtle generated lighting in the reference canvas. Focus, hover and dialog states are visible; white-on-blue contact text is retained.
- **Image quality and assets:** product cutouts and logo prepared as raster assets grounded in the approved reference. User-supplied original photographs are used for boards and production. No screenshot is used as page UI; headings, body copy, navigation and controls are real HTML. Phosphor library provides icons. Photo crops differ slightly because originals are retained rather than reconstructing generated factory details. No broken images; all decoded in browser. Supplied vector logo would be a future P3 improvement over the current concept-derived raster mark.
- **Copy and content:** correct company name and requested email. Five main sections and six direction categories retained. Contacts/requisites come from the supplied presentation. Direction expansions are based on supplied product documents. No fabricated metrics or certification badges.

## Functional and accessibility checks

- `npm run build`: passed.
- Six production browser runs at 320/390/768/1024/1487/1920px: passed.
- All six direction rows open and close; request links point to the correct email with relevant subject.
- Navigation dialog opens, Escape closes it; selecting a section closes it and navigates on-page.
- Gallery next/previous changes image, caption and counter.
- Email and telephone links have appropriate `mailto:` and `tel:` destinations.
- All image assets decode; no browser JavaScript or console errors in the tested runs.
- No horizontal viewport overflow; visible keyboard focus, skip link, semantic headings, named buttons, native details/dialog, reduced-motion handling.
- No backend submission is implied: contact actions invoke the visitor's email client.

## Follow-up polish — P3

- Replace concept-derived raster emblem with the original vector logo when available.
- A separately supplied mobile art-direction target could refine mobile composition further; current responsive layout has been visually inspected.
- Full screen-reader audit and browsers other than Chromium were not executed.

## Implementation checklist

- [x] Build the five approved sections with responsive layouts.
- [x] Use real text and interactive controls.
- [x] Replace all email addresses with `mail@skitlab.ru`.
- [x] Integrate all final image assets.
- [x] Correct P2 findings and re-capture affected views.
- [x] Test the built static site in Chromium.
- [x] Save source-to-implementation comparison evidence.

The site has been verified locally. Public hosting and domain deployment have not been performed.

## KNS scroll-controlled 3D extension

final result: passed

### Scope and source truth

The user requested a new 3D section in the existing visual system, rotating with scroll and revealing specifications, with the «1500…» model inscription removed. Sources: `IMG_4082.jpg`, `IMG_4084.jpg`, `IMG_4086.jpg`, `IMG_4087.jpg`, `IMG_4088.jpg` from the supplied archive under `/workspace/attachments/03108ced-63a9-43f7-bb39-fbce6ab87802/photos/`, the previously approved page, and the user's attached specification slide. The user explicitly confirmed the upper-right specification set. No CAD reference was supplied: the implemented model is a visual reconstruction, not a measured engineering model.

### Evidence and findings

- `/workspace/artifacts/skit-qa/kns-reference-comparison.png`: real product photograph and browser-rendered reconstruction in the same comparison input. The component families, plate, PCB, connectors and main arrangement are recognizable; fine geometry and materials are approximate by design. This is a comparison of subject and composition, not pixel matching of a photograph to a model.
- `kns-1487-0.png` through `kns-1487-3.png`: four desktop stages at 1487 × 1058 CSS px, 1× density.
- `kns-390-0.png` through `kns-390-3.png`: four mobile stages at 390 × 844, 1× density.
- `kns-offline-320-False-True.png`: narrow/short viewport 320 × 568, checked for clipping and overflow.
- `kns-offline-390-True-True.png`: reduced-motion layout with manual step controls.
- `kns-offline-1487-False-False.png`: no-WebGL fallback with real rendered preview and working specifications.
- `kns-final.png`: final inline build after callout transition refinement.

An initial P2 issue showed a transient duplicate front panel while the fallback and canvas cross-faded. Fixed by replacing the fallback atomically once the renderer is ready; post-fix screenshots were inspected. Short mobile viewports received a compact layout to retain the controls and specifications. No remaining actionable P0/P1/P2 issues.

### Required fidelity surfaces

- **Typography:** same local Manrope, bold/light title hierarchy, real HTML annotation text. Numeric values use the confirmed source set; mobile text remains readable at the tested dimensions.
- **Spacing:** new sticky scene inserted after directions; other page sections preserved and section indexes incremented. Desktop three-column product study becomes a stacked model with two annotation columns on mobile. No scroll interception or wheel-event hijacking.
- **Colors:** warm olive-ivory scene and existing cobalt interface accent; model colors grounded in the actual green PCB, black plate, copper windings, yellow components and blue connectors. Physically based materials and lighting, without external HDR downloads.
- **Assets:** genuine Three.js meshes for board, plate, capacitors, windings, transformer, heat-spreading rails, connectors and fasteners; edited photographic plate/PCB textures. Removed model/serial inscriptions from the textures. Approximate dimensions and detail are a P3 refinement pending CAD, not production geometry.
- **Copy:** 95–265 V, 50–60 Hz, power factor 0.99; 3–33 V DC, up to 53 A; efficiency ≥93%, ripple ≤40 mV; −50…+50 °C; up to 1500 W forced / 1000 W convection cooling. No parameters from other slide executions mixed into this block. Email stays `mail@skitlab.ru`.

### Executed validation

- Production and standalone builds passed; ZIP integrity checked.
- Real WebGL2 rendering on desktop and mobile: four distinct rotation values and four correct chapter/metric states verified.
- Buttons change scroll position/chapter and model orientation; callout appearance animates and respects reduced motion.
- Standalone archive extracted and served using ordinary Python `http.server`, with all requests except the HTML explicitly blocked. Passed at 320 × 568, 390 × 844, 1487 × 1058, reduced-motion mobile, and no-WebGL desktop. Zero additional network requests and zero JavaScript/console errors in those runs.
- Fallback shows a rendered model image; controls and specifications remain available.
- Reduced motion disables sticky scroll storytelling and smooth callout transitions; manual stage controls remain functional.
- Rendering starts near the section and stops when the view is idle, outside the section or the document is hidden. Pixel density is capped.
- Final inline build rechecked after the callout-animation change.

Direct `file://` navigation remains blocked by the managed test browser's administrator policy, as documented above. The portable file contains no external modules or assets. Public deployment was not performed.

## Standalone delivery verification

A self-contained HTML build is now produced by `npm run build:portable`. The downloadable `downloads/skit-offline.zip` contains that HTML and instructions. All CSS, classic JavaScript, fonts, icons and images are embedded as inline content or data URIs. It does not depend on serving separate asset files.

The extracted ZIP was tested through Python `http.server` rather than Vite at 390 and 1487px. All requests except the HTML document were explicitly blocked. CSS and font application, image decoding, navigation dialog, direction expansion, gallery switching, viewport width and console were checked: passed, with zero additional network requests and zero browser errors. Browser screenshots: `/workspace/artifacts/skit-qa/offline-390.png`, `offline-1487.png`, and `offline-hero.png`. The desktop capture was visually inspected against the approved hero and previous implementation. No design changes were introduced.

Direct file:// navigation in the managed test Chromium returned `ERR_BLOCKED_BY_ADMINISTRATOR`; that exact launch mode could not be executed here. The portable HTML uses ordinary inline CSS and classic JavaScript (no module imports), with no external resources. Windows/Yandex Browser itself was not available for testing. The user's original CSS loading failure is not established as an archive defect; its exact local cause remains unconfirmed. The portable delivery removes that separate-resource dependency.

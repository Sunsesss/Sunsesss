# Design QA — СКТБ «СКиТ»

final result: passed

## Scope and visual targets

Upgrade of the approved warm-ivory/cobalt corporate website: replace the generated hero pair with a genuine user photograph; preserve the approved development image; repair and restyle mobile navigation; add restrained motion; rebuild and improve the scroll-controlled KNS product study; deliver the editable project and a self-contained offline HTML.

Sources:

- Approved hero: `/workspace/generated_images/exec-d3e0753b-759b-4c52-a957-d483656d6e60.png` (1487 × 1058).
- Approved continuation: `/workspace/generated_images/exec-eec7acd9-a67b-4df5-a15e-854e203b81dd.png` and `/workspace/generated_images/exec-1a8d2dcd-6782-4285-9ea3-04f7764279ac.png`.
- Actual hero photograph: user archive `IMG_4105.jpg`; copied unchanged as `public/assets/tablet-real.jpg`. SHA256: `c9d4925b6de142b7cefb09c343a00310b07bd000527d1a005b0f62e2d391bff9`.
- Approved lower image: `public/assets/development.png`; no change from the previous committed version. The generated hero composition was removed; the user-approved lower cutout was retained deliberately.
- Actual KNS reference: user archive `IMG_4082.jpg` and additional views; preserved component-side photograph in `model/reference/component-side.jpg`.
- Numerical KNS parameters: upper-right specification group in the supplied slide, explicitly confirmed by the user. No specifications from other executions were combined.
- `only.digital/projects/all` was supplied as a stylistic reference but returned proxy HTTP 403 here. It was not visually inspected or cloned; no fidelity claim is made for that URL.

## Final browser evidence

Production Vite build in Chromium, desktop 1487 × 1058 at 1× density. Responsive cases: widths 320, 390, 768 and 1024; touch/mobile emulation at 390 × 844. Screenshots include default hero, open menu, four KNS stages and development. All comparison inputs were opened and visually inspected after the final changes.

Reviewable captures in the project:

- `docs/home-preview.png`, `docs/menu-preview.png`, `docs/kns-preview.png`, `docs/development-preview.png`.
- `docs/menu-mobile.png`, `docs/kns-mobile.png`.
- `docs/home-comparison.png`: approved hero left and final browser capture right, same original viewport dimensions and equal 744px comparison columns. The documentary photograph, its rectangular frame/caption and the menu treatment are intentional authorized changes.
- `docs/model-comparison.png`: actual product photograph left, final browser-rendered reconstruction right, equal-width columns. This compares subject, layout and component families; it does not claim pixel equality or measured CAD fidelity.
- `docs/development-comparison.png`: approved cutout versus the browser image element, each fitted proportionally on the same ivory comparison canvas. The image has transparent padding; the complete section is separately shown in `development-preview.png`.

Raw screenshot/test evidence: `/workspace/artifacts/skit-v2-qa/`. It is not required at runtime.

## Findings and corrections

| Severity | Finding | Final correction |
| --- | --- | --- |
| P1 | Mobile menu depended on scripting and the 3D initialization path. | Native HTML details/summary menu; handlers initialized before 3D. Fullscreen navigation, fixed reachable toggle, section selection, Escape, focus loop/restore and inert main content while open. Basic opening/closing works without JavaScript. |
| P2 | Generated hero looked artificial. | Replaced with the original user photograph; preserved approved lower cutout and editorial headline position. |
| P2 | Headline wrapped/clipped at 320px. | Two explicit title lines with a narrow-screen type rule; verified at all five widths. |
| P2 | Reveal translation could intercept rapid accordion clicks. | Interactive direction list uses opacity-only reveal; rows themselves do not translate. Re-ran the full source suite successfully. |
| P2 | Old model had crude geometry and duplicated component imagery on the front. | Blender geometry with bevels, physical holes, fasteners, connectors, continuous copper windings and three-dimensional indicator labels; photographic component-side projection removed. Optimized embedded GLB with physical materials and shadows. |
| P2 | Software/mobile rendering settled slowly; a canceled touch could leave the render paused. | Time-based interpolation, capped pixel density/mobile frame rate, PCF shadow map, explicit resume after pointer cancellation and rendering paused outside the scene/while the menu is open. Verified after the fix. |

No remaining actionable P0/P1/P2 findings in the executed Chromium scenarios. CAD-level fidelity, original vector branding and additional browser/device coverage remain separate follow-up refinements.

## Required fidelity surfaces

- **Typography:** local Manrope with Cyrillic support; heavy/light two-line headline and large editorial section headings. Native HTML text and icon controls throughout. Menu uses large numbered links and visible keyboard focus.
- **Spacing/layout:** approved section order, ivory background, blue approach strip, ruled indexes, six directions, four development steps, production gallery and contact ending preserved. New KNS scene fits the same grid. Mobile stacks the content without horizontal overflow; short/narrow screens use compact scene controls.
- **Color:** warm ivory, near-black and cobalt. New fullscreen menu uses the existing cobalt with white text; contact/footer contrast retained. KNS colors follow green PCB, dark faceplate, silver rails, copper windings and blue connectors from the photographs.
- **Assets:** real hero JPG, unchanged approved development cutout, actual board/production photographs. New editable `model/kns.blend` and embedded `public/assets/kns.glb` (~4.4MB). Photo-based visual reconstruction with approximate dimensions/materials; not an engineering or photorealistic accuracy claim. Removed the “1500…” designation from the model itself. Contact numbers remain in HTML, not baked into artwork.
- **Copy:** correct company name СКТБ «СКиТ» and mail@skitlab.ru. Confirmed specifications: input 95–265 V / 50–60 Hz / power factor 0.99; output 3–33 V DC / up to 53 A; efficiency ≥93%; ripple ≤40 mV; −50…+50 °C; up to 1500 W forced / 1000 W convection cooling. Complete native specification disclosure is available independently of 3D.

## Interaction and accessibility

- Native menu opens/closes without JavaScript. JavaScript adds animated closing, Escape, section navigation, focus containment/restoration and inert background. A 3D failure cannot prevent menu initialization.
- All six directions and all eight specification groups are static native HTML; contact links remain usable without JavaScript.
- Hero line/photo entry, section reveals, gallery transitions, reading progress and fine-pointer photo movement. Animation has a completion timeout; baseline content remains visible if enhancement fails.
- Reduced motion disables entry/scroll movement and the long sticky KNS narrative. Manual KNS stage buttons remain available.
- Four KNS scroll chapters rotate the genuine WebGL scene and update anchored numeric markers and specifications. No scroll hijacking. Rendering starts near the scene and stops after settling, outside the viewport, while hidden or while the menu is open.
- No-WebGL fallback displays the current rendered preview with working controls and specifications. Zero external CDN/HDR/model dependencies.
- Direction links, gallery, menu and contact destinations exercised. Contact actions invoke the email/telephone application; no backend submission is implied.

## Executed verification

- `npm run build:portable`: passed; produces the ordinary Vite build plus fully embedded standalone HTML.
- Production suite: eight passing cases — 320, 390, 768, 1024 and 1487px; reduced-motion mobile; no-WebGL mobile; no-JavaScript mobile.
- Final standalone suite: five passing cases — 390 and 1487px; reduced-motion mobile; no-WebGL mobile; no-JavaScript mobile. The HTML was served with ordinary Python http.server, not Vite. Every request except the document and in-memory resources was denied; no additional external requests or JavaScript/console errors.
- Checks include title clipping/overflow, photo source and decoding, native menu and main inert state, all directions, mail links, gallery, full specification disclosure, four distinct chapter/rotation states, fallback, reduced motion and fixed menu operation inside the 3D section.
- Separate final keyboard check passed: Shift+Tab and Tab wrap focus inside the menu, Escape closes it, focus returns to the toggle and main content becomes interactive again.
- After the final pointer-cancellation correction, separate source and embedded-build regressions passed for entry animation completion, canceled touch, model rendering and menu opening/closing. The served standalone document hash matched the final `portable/index.html`: `7bb46fd613577ecd4b08966fa7c390d3ff92ab35679c3e2673981e495f8216f9`.
- ZIP packaging uses stdlib zipfile integrity checks and includes a complete editable Blender project plus model-build/optimization scripts.

## Practical limits

Physical phones, iOS/WebKit and the user's Windows/Yandex Browser were not connected. Mobile checks used Chromium touch/viewport emulation; these results are not a claim of physical-device certification. Direct file:// navigation is blocked by the managed test browser's administrator policy. The offline HTML was verified via HTTP with all other network requests denied; it contains inline classic JavaScript, CSS and data-embedded assets, so it requires no installation or external asset server. On a phone it must be opened in a browser rather than an attachment previewer that disables scripting. A complete screen-reader audit has not been executed.

Public hosting/domain deployment was not performed. GitHub source and downloadable ZIP delivery are provided separately from live hosting.

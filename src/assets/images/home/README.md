# Homepage Hero asset contract

The production Hero source is `forgeon-automation-hero-final-master.png`.

- Keep the source at a 4:3 aspect ratio with the quieter factory aisle on the left and the primary equipment/operator on the right.
- Do not bake headlines, calls to action, logos, captions or other website copy into the bitmap.
- Do not replace it with an editor screenshot, provider preview, watermarked export or an image containing generated pseudo-text.
- Keep the master under `src/assets` so Astro can emit intrinsic dimensions and responsive AVIF/WebP derivatives.
- Art-directed crops belong in `Hero.astro` through `object-position`; do not create separate desktop/mobile copies unless a later crop cannot preserve the equipment and operator.
- The website must keep a visible concept-imagery disclosure. This asset is brand imagery for a fictional demonstration project, not evidence of a real FORGEON factory or customer installation.

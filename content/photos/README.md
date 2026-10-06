# Photos

Each folder is a **roll**: a trip, a month, a walk, or an ongoing set like `food/`.
Name it `YYYY-MM-name/` (or anything, for ongoing ones) and put the pictures in it.

```
content/photos/
  2026-10-porto/
    index.md        title, date, place, camera, film, tags (all but title and date optional)
    01.jpg          photos show in file name order
    02.jpg
  food/
    index.md        ongoing: true
```

Before committing new photos, run:

```sh
mise run photos
```

It converts HEIC/TIFF to JPEG, shrinks anything over 2400px, applies rotation, and
**removes all metadata, including GPS location**. Keep your originals in your photo
library; the repo only holds web copies.

Optional extras in `index.md`:

```yaml
cover: 03.jpg              # defaults to the first photo
captions:
  03.jpg: Francesinha, obviously
```

Body text under the frontmatter shows above the photos, if you write any.

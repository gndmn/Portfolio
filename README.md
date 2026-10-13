# Gandom Portfolio

## Adding work (no code needed)
Put files in the right folder under `works/`:

| Folder | What goes in |
|---|---|
| `works/motion/` | Videos (`.mp4`). Optional cover: an image with the same name (`intro.mp4` + `intro.jpg`). |
| `works/posters/` | One image per poster. |
| `works/logos/` | One image per logo, **or** a folder per logo (logo + mockups). |
| `works/catalogs/` | One folder per catalog; each image inside is a page. |

- The file/folder name becomes the title: `03-coffee-house.jpg` → **Coffee House**.
- The leading number sets the order and is hidden.
- Max 50 MB per file. Compress videos first (target under 20 MB).
- Empty sections are hidden automatically.

After upload, GitHub rebuilds the site in about 1–2 minutes.

## Local preview
```
node scripts/build.mjs
python3 -m http.server 8000
```
Open http://localhost:8000

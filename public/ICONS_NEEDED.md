# App Icons Required

You need to create app icons for your PWA and native apps.

## PWA Icons (Required)

Create these files in the `public/` folder:

1. **pwa-192x192.png** - 192x192 pixels, PNG format
2. **pwa-512x512.png** - 512x512 pixels, PNG format

These icons will be used when users install your app on their phones.

## Icon Design Tips

- Use a simple, recognizable design
- Ensure icons look good at small sizes
- Use your brand colors
- Test on both light and dark backgrounds

## Tools to Create Icons

- [Figma](https://www.figma.com/) - Free design tool
- [Canva](https://www.canva.com/) - Easy icon templates
- [App Icon Generator](https://www.appicon.co/) - Generate all sizes
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Generate favicons and app icons

## Quick Test

After adding icons, rebuild:
```bash
npm run build
npm run preview
```

Then check if icons appear in the browser's "Add to Home Screen" dialog.

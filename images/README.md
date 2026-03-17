# Images Directory

Place your custom link icons here.

Supported formats: PNG, JPG, GIF, SVG, WebP

Recommended size: 64x64px or larger (will be scaled to 24x24px)

## Usage

In your `config.json`, add an `image` parameter to any link:

```json
{
  "title": "My Custom Link",
  "url": "https://example.com",
  "image": "images/my-icon.png"
}
```

If no `image` is provided, the favicon will be automatically fetched from the URL.

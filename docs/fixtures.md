# Fixtures

The demo runs without a backend. Data is loaded from `public/fixtures`.

## File Locations

- `public/fixtures/sample-session.json`
- `public/audio/sample.wav` (or `.mp3`)

## Session JSON Shape

Example:

```json
{
  "title": "Sample Session",
  "lang": "de-DE",
  "audioFile": "/audio/sample.wav",
  "sentences": [
    {
      "start": 0.0,
      "duration": 1.2,
      "text": "Hallo!",
      "fa": "سلام!",
      "eng": "Hello!"
    }
  ]
}
```

## Notes

- `start` and `duration` are in **seconds**
- `audioFile` is an absolute path from the web root (because we use `public/`)
- Translations are optional; the UI toggles between FA/EN if present

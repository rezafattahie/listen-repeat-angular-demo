# Architecture

This demo is structured around a single stateful facade and small UI components.

## High-level Data Flow

- `ListenRepeatPage` (container)
  - renders layout
  - keeps the `<audio>` element in the DOM
  - attaches the audio element to the facade

- UI Components (presentation)
  - `ControlsPanel` (buttons + sliders + translation toggle)
  - `CurrentSentenceCard` (current sentence + partial/final)
  - `TranscriptList` (select sentence, highlight active)
  - `ResultsList` (score cards)

- `ListenRepeatFacade` (state + orchestration)
  - holds app state via signals
  - loads fixture (`HttpClient`)
  - orchestrates:
    - play sentence segment
    - wait mic delay
    - start speech capture
    - stop capture after listening window
    - compute score and store results
  - exposes read-only computed values for UI

- Services
  - `SegmentAudioPlayerService`
    - plays a segment by `startSec` + `durationSec`
    - resolves only when the segment finishes
  - `SpeechRecognitionService`
    - wrapper around Web Speech API
    - provides `start/stop` and emits partial/final transcripts

## Why Facade + Small Components?

- Keeps UI files small and readable
- Keeps orchestration logic in a single place
- Makes unit testing straightforward

```md
## PWA

PWA support is enabled via Angular Service Worker:
- `ngsw-config.json` defines caching rules
- `manifest.webmanifest` enables installability
```
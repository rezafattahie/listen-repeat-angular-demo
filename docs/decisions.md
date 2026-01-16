# Decisions

## Why async/await for playback orchestration?

The core flow is sequential:

1. Play sentence segment
2. Wait until mic starts
3. Listen for a fixed window
4. Compute score
5. Repeat (autoplay)

This reads naturally as async/await and maps well to:
- `HTMLAudioElement.play()` (Promise-based)
- SpeechRecognition (event-based) wrapped into a Promise for one capture window

For a small demo, async/await keeps complexity low and code easy to follow.

## Where RxJS is used

- `HttpClient` returns Observables for fixture loading
- Reactive patterns remain available if the project expands

## How it could be RxJS-driven (if needed)

Autoplay can be expressed as:

- `from(sentences).pipe(concatMap(...))`
- cancellation via `takeUntil(stop$)`

# Testing Plan

This project uses the Angular testing setup (Vitest via `ng test`).

## Unit Tests (Recommended)

### ListenRepeatFacade

- loads fixture and sets initial state
- select/prev/next update index correctly
- playCurrent calls audio segment player with correct timestamps
- autoplay can be cancelled (stopProcess)
- results are appended after speech capture

### Utils (speech-score)

- normalization behavior
- tokenF1 scoring for simple cases

## Component Tests (Optional)

- Transcript list: active item styling, click triggers selection
- Controls: buttons disabled/enabled states

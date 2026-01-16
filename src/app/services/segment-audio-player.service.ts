import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class SegmentAudioPlayerService {
  private audio?: HTMLAudioElement;
  private rafId: number | null = null;

  init(audioEl: HTMLAudioElement) {
    this.audio = audioEl;
  }

  pause() {
    this.audio?.pause();
    this.stopTracking();
  }

  async playSegment(startSec: number, durationSec: number): Promise<void> {
    if (!this.audio) throw new Error("Audio element not initialized");

    const a = this.audio;
    this.stopTracking();

    await this.waitForMetadata(a);

    const stopAt = Math.max(0, startSec + Math.max(0, durationSec));
    a.currentTime = Math.max(0, startSec);

    await a.play();

    return new Promise<void>((resolve) => {
      const tick = () => {
        if (!this.audio) return;

        if (a.currentTime >= stopAt) {
          a.pause();
          this.stopTracking();
          resolve();
          return;
        }

        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
    });
  }

  private stopTracking() {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private waitForMetadata(a: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      if (a.readyState >= 1) return resolve();

      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Audio failed to load"));
      };
      const cleanup = () => {
        a.removeEventListener("loadedmetadata", onReady);
        a.removeEventListener("canplay", onReady);
        a.removeEventListener("error", onError);
      };

      a.addEventListener("loadedmetadata", onReady, { once: true });
      a.addEventListener("canplay", onReady, { once: true });
      a.addEventListener("error", onError, { once: true });
    });
  }
}

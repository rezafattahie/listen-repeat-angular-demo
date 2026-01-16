import { Injectable, ElementRef, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SegmentAudioPlayerService } from "../services/segment-audio-player.service";
import { SpeechRecognitionService } from "../services/speech-recognition.service";
import { ListenRepeatSession, TimestampedSentence } from "../models/timestamped-sentence.model";
import { tokenF1 } from "../utils/speech-score";

@Injectable({ providedIn: "root" })
export class ListenRepeatFacade {
    private audioEl?: HTMLAudioElement;

    session = signal<ListenRepeatSession | null>(null);
    idx = signal(0);
    gapMs = signal(600);
    isPlaying = signal(false);
    translationMode = signal<"fa" | "en">("en");

    micDelayRatio = signal(1);       // time to active mic (1× duration)
    listenWindowRatio = signal(1);   // hearing duration (1× duration)

    results = signal<Array<{
        index: number;
        expected: string;
        spoken: string;
        score: number; // 0..1
        createdAt: number;
    }>>([]);

    isAutoPlay = signal(false);
    private runToken = 0;

    speechSupported = signal(false);
    partial = signal("");
    finalText = signal("");

    micDelayMs = computed(() => {
        const cur = this.currentSentence();
        if (!cur) return 0;
        return Math.round(cur.duration * 1000 * this.micDelayRatio());
    });

    listenWindowMs = computed(() => {
        const cur = this.currentSentence();
        if (!cur) return 0;
        return Math.round(cur.duration * 1000 * this.listenWindowRatio());
    });

    currentSentence = computed<TimestampedSentence | null>(() => {
        const s = this.session();
        if (!s?.sentences?.length) return null;
        const i = Math.min(this.idx(), s.sentences.length - 1);
        return s.sentences[i] ?? null;
    });

    constructor(
        private http: HttpClient,
        private player: SegmentAudioPlayerService,
        private speech: SpeechRecognitionService
    ) { }

    attachAudio(el: HTMLAudioElement) {
        this.audioEl = el;
        this.player.init(el);

        // init speech after session loads (or with default)
        const lang = this.session()?.lang ?? "de-DE";
        this.speechSupported.set(this.speech.isSupported());
        this.speech.init(lang);
    }

    loadSession(url = "/fixtures/sample-session.json") {
        this.http.get<ListenRepeatSession>(url).subscribe({
            next: (data) => {
                this.session.set(data);
                this.idx.set(0);

                // refresh speech language if audio already attached
                this.speechSupported.set(this.speech.isSupported());
                this.speech.init(data.lang || "de-DE");
            },
            error: (e) => console.error("Failed to load fixture", e),
        });
    }

    toggleTranslation() {
        this.translationMode.set(this.translationMode() === "fa" ? "en" : "fa");
    }

    resetResults() {
        this.results.set([]);
    }

    private delay(ms: number) {
        return new Promise<void>((res) => setTimeout(res, ms));
    }

    private captureSpeechOnce(timeoutMs: number): Promise<string> {
        return new Promise((resolve) => {
            if (!this.speechSupported()) {
                resolve("");
                return;
            }

            let latestPartial = "";

            this.speech.start(
                (final) => {
                    this.finalText.set(final);
                },
                (p) => {
                    latestPartial = p;
                    this.partial.set(p);
                }
            );

            setTimeout(() => {
                this.speech.stop();

                // Give the browser a short moment to flush final results (if any)
                setTimeout(() => {
                    const final = (this.finalText() || "").trim();
                    const fallback = (latestPartial || this.partial() || "").trim();
                    resolve(final || fallback);
                }, 200);
            }, Math.max(0, timeoutMs));
        });
    }


    async playCurrent() {
        const cur = this.currentSentence();
        if (!cur) return;

        this.isPlaying.set(true);
        this.partial.set("");
        this.finalText.set("");

        try {
            // Wait until the segment actually ends
            await this.player.playSegment(cur.start, cur.duration);
        } catch (e) {
            console.error("playSegment failed", e);
            this.isPlaying.set(false);
            return;
        }

        // Wait before mic starts (your "Time until mic starts")
        const delayMs = this.micDelayMs();
        await this.delay(delayMs);

        this.isPlaying.set(false);

        // Listen for a fixed window; if no final, use partial
        const spoken = await this.captureSpeechOnce(this.listenWindowMs());
        this.finalText.set(spoken);

        const score = tokenF1(cur.text, spoken);

        this.results.update((r) => [
            {
                index: this.idx(),
                expected: cur.text,
                spoken,
                score,
                createdAt: Date.now(),
            },
            ...r,
        ]);
    }



    pauseAll() {
        this.player.pause();
        this.speech.stop();
        this.isPlaying.set(false);
    }

    stopListening() {
        this.speech.stop();
    }

    next() {
        const s = this.session();
        if (!s?.sentences?.length) return;
        this.stopListening();
        this.idx.set(Math.min(this.idx() + 1, s.sentences.length - 1));
    }

    prev() {
        const s = this.session();
        if (!s?.sentences?.length) return;
        this.stopListening();
        this.idx.set(Math.max(this.idx() - 1, 0));
    }

    select(i: number) {
        const s = this.session();
        if (!s?.sentences?.length) return;
        this.pauseAll();
        this.idx.set(Math.max(0, Math.min(i, s.sentences.length - 1)));
    }

    async playAll() {
        const s = this.session();
        if (!s?.sentences?.length) return;

        this.runToken++;
        const token = this.runToken;

        this.isAutoPlay.set(true);
        this.resetResults();
        this.idx.set(0);

        for (let i = 0; i < s.sentences.length; i++) {
            if (token !== this.runToken) break;

            this.select(i); // pauseAll + set idx
            await this.playCurrent();

            // wait to mic sets to off then go to the next sentence
            const waitMs = this.micDelayMs() + this.listenWindowMs() + 50;
            await this.delay(waitMs);
        }

        this.isAutoPlay.set(false);
    }

    stopProcess() {
        this.runToken++;
        this.isAutoPlay.set(false);
        this.pauseAll();
    }

}

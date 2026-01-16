import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";

import { ListenRepeatFacade } from "./listen-repeat.facade";
import { SegmentAudioPlayerService } from "../services/segment-audio-player.service";
import { SpeechRecognitionService } from "../services/speech-recognition.service";
import { ListenRepeatSession } from "../models/timestamped-sentence.model";

describe("ListenRepeatFacade", () => {
    let facade: ListenRepeatFacade;
    let httpMock: HttpTestingController;

    const playerMock = {
        init: vi.fn(),
        playSegment: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
    };

    const speechMock = {
        isSupported: vi.fn().mockReturnValue(true),
        init: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
    };

    const sampleSession: ListenRepeatSession = {
        title: "Sample Session",
        lang: "de-DE",
        audioFile: "/audio/sample.wav",
        sentences: [
            { start: 0, duration: 0.1, text: "Hallo", fa: "سلام", eng: "Hello" },
            { start: 0.2, duration: 0.1, text: "Welt", fa: "دنیا", eng: "World" },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ListenRepeatFacade,
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: SegmentAudioPlayerService, useValue: playerMock },
                { provide: SpeechRecognitionService, useValue: speechMock },
            ],
        });

        facade = TestBed.inject(ListenRepeatFacade);
        httpMock = TestBed.inject(HttpTestingController);

        playerMock.init.mockClear();
        playerMock.playSegment.mockClear();
        playerMock.pause.mockClear();

        speechMock.isSupported.mockClear();
        speechMock.init.mockClear();
        speechMock.start.mockClear();
        speechMock.stop.mockClear();
    });

    afterEach(() => {
        httpMock.verify();
        vi.useRealTimers();
    });

    it("loadSession sets session and idx=0 and initializes speech language", () => {
        facade.loadSession("/fixtures/test.json");

        const req = httpMock.expectOne("/fixtures/test.json");
        req.flush(sampleSession);

        expect(facade.session()).toEqual(sampleSession);
        expect(facade.idx()).toBe(0);

        expect(speechMock.isSupported).toHaveBeenCalled();
        expect(facade.speechSupported()).toBe(true);
        expect(speechMock.init).toHaveBeenCalledWith("de-DE");
    });

    it("attachAudio initializes player and speech using current session language", () => {
        facade.session.set(sampleSession);

        const audio = document.createElement("audio");
        facade.attachAudio(audio);

        expect(playerMock.init).toHaveBeenCalledWith(audio);
        expect(speechMock.isSupported).toHaveBeenCalled();
        expect(speechMock.init).toHaveBeenCalledWith("de-DE");
    });

    it("select clamps index and pauses audio/speech", () => {
        facade.session.set(sampleSession);
        facade.idx.set(0);

        facade.select(99);

        expect(playerMock.pause).toHaveBeenCalled();
        expect(speechMock.stop).toHaveBeenCalled();
        expect(facade.idx()).toBe(sampleSession.sentences.length - 1);
    });

    it("next/prev clamp inside valid range", () => {
        facade.session.set(sampleSession);
        facade.idx.set(0);

        facade.prev();
        expect(facade.idx()).toBe(0);

        facade.next();
        expect(facade.idx()).toBe(1);

        facade.next();
        expect(facade.idx()).toBe(1);
    });

    it("toggleTranslation switches between fa/en", () => {
        facade.translationMode.set("en");
        facade.toggleTranslation();
        expect(facade.translationMode()).toBe("fa");
        facade.toggleTranslation();
        expect(facade.translationMode()).toBe("en");
    });

    it("playCurrent calls playSegment and appends a result (uses speech final)", async () => {
        vi.useFakeTimers();

        facade.session.set(sampleSession);
        facade.idx.set(0);

        // Make timing instant for the test
        facade.micDelayRatio.set(0);
        facade.listenWindowRatio.set(0);
        facade.speechSupported.set(true);

        // Simulate immediate partial + final
        speechMock.start.mockImplementation((onFinal: (t: string) => void, onPartial: (t: string) => void) => {
            onPartial("hal");
            onFinal("Hallo");
        });

        const p = facade.playCurrent();

        // delay(0) + captureSpeechOnce timeout(0) + final flush (200ms)
        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(0);
        await vi.advanceTimersByTimeAsync(250);

        await p;

        expect(playerMock.playSegment).toHaveBeenCalledWith(0, 0.1);
        expect(facade.results().length).toBe(1);
        expect(facade.results()[0].spoken).toBe("Hallo");
        expect(facade.results()[0].score).toBeGreaterThan(0);
    });

    it("playAll runs through sentences and can be stopped", async () => {
        vi.useFakeTimers();

        facade.session.set(sampleSession);
        facade.micDelayRatio.set(0);
        facade.listenWindowRatio.set(0);

        const playCurrentSpy = vi.spyOn(facade, "playCurrent").mockResolvedValue();

        const running = facade.playAll();

        // Let first iteration finish + its delay, then stop
        await vi.advanceTimersByTimeAsync(60);
        facade.stopProcess();

        // Flush remaining timers so playAll can exit
        await vi.advanceTimersByTimeAsync(200);

        await running;

        expect(playCurrentSpy.mock.calls.length).toBeGreaterThan(0);
        expect(playCurrentSpy.mock.calls.length).toBeLessThanOrEqual(2);
        expect(facade.isAutoPlay()).toBe(false);
        expect(playerMock.pause).toHaveBeenCalled();
        expect(speechMock.stop).toHaveBeenCalled();
    });
});

import { Injectable } from "@angular/core";

type SpeechRecognitionCtor = new () => SpeechRecognition;

@Injectable({ providedIn: "root" })
export class SpeechRecognitionService {
  private recognition?: SpeechRecognition;
  private listening = false;

  isSupported(): boolean {
    return typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  init(lang = "de-DE") {
    if (!this.isSupported()) return;

    const Ctor = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) as SpeechRecognitionCtor;
    this.recognition = new Ctor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = lang;
  }

  start(onFinal: (text: string) => void, onPartial?: (text: string) => void) {
    if (!this.recognition || this.listening) return;
    this.listening = true;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript ?? "";

      if (result.isFinal) onFinal(transcript.trim());
      else onPartial?.(transcript);
    };

    this.recognition.onerror = () => {
      this.listening = false;
    };

    this.recognition.onend = () => {
      this.listening = false;
    };

    this.recognition.start();
  }

  stop() {
    if (!this.recognition || !this.listening) return;
    this.listening = false;
    this.recognition.stop();
  }
}

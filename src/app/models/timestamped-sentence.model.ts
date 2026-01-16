export interface TimestampedSentence {
  start: number;      // seconds
  duration: number;   // seconds
  text: string;
  fa?: string;
  eng?: string;
}

export interface ListenRepeatSession {
  title: string;
  audioFile: string;
  lang: string; // e.g. "de-DE"
  sentences: TimestampedSentence[];
}

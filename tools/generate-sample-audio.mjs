import fs from "node:fs";

function writeWavMono16(filePath, durationSec = 6, sampleRate = 44100) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const dataSize = numSamples * 2; // 16-bit mono
  const header = Buffer.alloc(44);

  // RIFF header
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);

  // fmt chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM
  header.writeUInt16LE(1, 20); // audio format: PCM
  header.writeUInt16LE(1, 22); // channels: 1
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  const samples = Buffer.alloc(dataSize);

  // simple “beep blocks” so you can clearly hear segments
  // 0-1.2s beep, 1.2-1.4 silence, 1.4-2.8 beep, 2.8-3.1 silence, 3.1-4.7 beep, rest silence
  const beep = (t) => Math.sin(2 * Math.PI * 660 * t) * 0.35;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const inBeep =
      (t >= 0.0 && t <= 1.2) ||
      (t >= 1.4 && t <= 2.8) ||
      (t >= 3.1 && t <= 4.7);

    const val = inBeep ? beep(t) : 0;
    const s = Math.max(-1, Math.min(1, val));
    samples.writeInt16LE(Math.floor(s * 32767), i * 2);
  }

  fs.mkdirSync(new URL("../src/assets/audio/", import.meta.url), { recursive: true });
  fs.writeFileSync(new URL("../src/assets/audio/sample.wav", import.meta.url), Buffer.concat([header, samples]));
  console.log("✅ generated: src/assets/audio/sample.wav");
}

writeWavMono16("src/assets/audio/sample.wav");

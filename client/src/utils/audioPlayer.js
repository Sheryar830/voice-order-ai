import { base64ToArrayBuffer } from "./audio";

export function createAudioPlayer() {
  const audioContext = new AudioContext({
    sampleRate: 24000,
  });

  let nextStartTime = audioContext.currentTime;
  const activeSources = new Set();

  async function play(base64Audio) {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const buffer = base64ToArrayBuffer(base64Audio);
    const pcm16 = new Int16Array(buffer);

    const audioBuffer = audioContext.createBuffer(
      1,
      pcm16.length,
      24000,
    );

    const channel = audioBuffer.getChannelData(0);

    for (let i = 0; i < pcm16.length; i += 1) {
      channel[i] = pcm16[i] / 32768;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    const startAt = Math.max(audioContext.currentTime, nextStartTime);

    source.start(startAt);

    nextStartTime = startAt + audioBuffer.duration;

    activeSources.add(source);

    source.onended = () => {
      activeSources.delete(source);
    };
  }

  function clear() {
    activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // ignore
      }
    });

    activeSources.clear();
    nextStartTime = audioContext.currentTime;
  }

  async function close() {
    clear();

    if (audioContext.state !== "closed") {
      await audioContext.close();
    }
  }

  return {
    play,
    clear,
    close,
  };
}
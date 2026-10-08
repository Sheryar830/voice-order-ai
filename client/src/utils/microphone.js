import {
  arrayBufferToBase64,
  downsampleBuffer,
  float32ToInt16,
} from "./audio";

export async function startMicrophone(onAudioChunk, { onStop } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: { ideal: 1 },
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });

  const audioContext = new AudioContext();
  try {
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
  } catch (error) {
    stream.getTracks().forEach((track) => track.stop());
    await audioContext.close();
    throw error;
  }

  const source = audioContext.createMediaStreamSource(stream);

  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  let audioChunkCount = 0;
  let rmsSampleSquares = 0;
  let rmsSampleCount = 0;

  processor.onaudioprocess = (event) => {
    const input = event.inputBuffer.getChannelData(0);
    for (let i = 0; i < input.length; i += 1) {
      rmsSampleSquares += input[i] * input[i];
    }
    rmsSampleCount += input.length;

    const downsampled = downsampleBuffer(
      input,
      audioContext.sampleRate,
      16000,
    );

    const pcm16 = float32ToInt16(downsampled);

    const base64 = arrayBufferToBase64(pcm16.buffer);

    audioChunkCount += 1;
    if (audioChunkCount % 20 === 0) {
      const rms = Math.sqrt(rmsSampleSquares / rmsSampleCount);
      console.info(
        `[VoiceOrder] Microphone audio chunks produced: ${audioChunkCount}; mic RMS: ${rms.toFixed(3)}`,
      );
      rmsSampleSquares = 0;
      rmsSampleCount = 0;
    }

    onAudioChunk(base64);
  };

  source.connect(processor);
  processor.connect(audioContext.destination);

  return {
    stop() {
      onStop?.();
      processor.disconnect();
      source.disconnect();

      stream.getTracks().forEach((track) => track.stop());

      audioContext.close();
    },
  };
}
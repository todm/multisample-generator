import * as wavefile from 'wavefile';
import type MultisampleConfiguration from './MultisampleConfiguration';

export default class WaveSplitter {
    private wav: wavefile.WaveFile;
    private fmt: ChunkWavFmt;
    private data: ChunkWavData;

    constructor(file: Uint8Array, private multisampleConfiguration: MultisampleConfiguration) {
        this.wav = new wavefile.WaveFile(file);
        this.fmt = this.wav.fmt as ChunkWavFmt;
        this.data = this.wav.data as ChunkWavData;
    }

    *getSamples(): Generator<[string, Uint8Array]> {
        let currentTimeOffset = 0;
        for (const sampleArea of this.multisampleConfiguration.getSampleAreas()) {
            const sampleStart = this.millisecondsToSamples(currentTimeOffset + sampleArea.attack);
            const sampleEnd = this.millisecondsToSamples(currentTimeOffset + sampleArea.attack + sampleArea.hold + sampleArea.decay);

            const data = this.data.samples.slice(sampleStart, sampleEnd);
            const splittedWav = new wavefile.WaveFile();
            splittedWav.fromScratch(this.fmt.numChannels, this.fmt.sampleRate, this.wav.bitDepth, []);
            const splittedWavDataObject = splittedWav.data as ChunkWavData;
            splittedWavDataObject.samples = data;
            splittedWavDataObject.chunkSize = data.length;

            if (this.multisampleConfiguration.autogain) sampleArea.gain = this.getAutoGain(splittedWav);

            yield [sampleArea.id!, splittedWav.toBuffer()];

            currentTimeOffset =
                currentTimeOffset + sampleArea.attack + sampleArea.hold + sampleArea.decay + this.multisampleConfiguration.getSampleSeparation();
        }
    }

    millisecondsToSamples(ms: number) {
        const bytesPerSample = Math.ceil(this.fmt.bitsPerSample / 8);
        const frames = this.millisecondsToFrames(ms);
        return frames * bytesPerSample * this.fmt.numChannels;
    }

    samplesToMilliseconds(samples: number) {
        const bytesPerSample = this.fmt.bitsPerSample / 8;
        const bytesPerSecond = this.fmt.sampleRate * bytesPerSample * this.fmt.numChannels;
        return (bytesPerSecond * samples) / 1000;
    }

    millisecondsToFrames(ms: number) {
        return Math.floor((this.fmt.sampleRate * ms) / 1000);
    }

    framesToMilliseconds(frames: number) {
        return (frames / this.fmt.sampleRate) * 1000;
    }

    private calculateDb(wav: wavefile.WaveFile) {
        const valueCeil = this.getMaxValueForBitDepth(wav.bitDepth);

        const samples = wav.getSamples(true);
        let maxValue = 0;
        for (let i = 0; i < samples.length; i++) {
            if (samples[i] > maxValue) maxValue = samples[i];
            if (samples[i] === valueCeil) break;
        }

        return 20 * Math.log10(maxValue / valueCeil);
    }

    private getAutoGain(wav: wavefile.WaveFile) {
        const target = -0.5;
        const current = this.calculateDb(wav);
        return (current - target) * -1;
    }

    private getMaxValueForBitDepth(bitDepth: string) {
        switch (bitDepth) {
            case '8':
                return 255 / 2;
            case '16':
                return 32767;
            case '24':
                return 8388607;
            case '32':
                return 2147483647;
            case '32f':
                return 1;
            case '64':
                return 1;
            default:
                return 1;
        }
    }
}

type ChunkWavFmt = {
    chunkId: 'fmt ';
    chunkSize: number;
    audioFormat: 1;
    numChannels: number;
    sampleRate: number;
    byteRate: number;
    blockAlign: number;
    bitsPerSample: number;
    cbSize: number;
    validBitsPerSample: number;
    dwChannelMask: number;
    subformat: any[];
};

type ChunkWavData = {
    chunkId: 'data';
    chunkSize: number;
    samples: Uint8Array;
};

import { midiToNoteName } from '../utils';
import type { SampleArea } from '../MultisampleConfiguration';
import type MultisampleConfiguration from '../MultisampleConfiguration';
import WaveSplitter from '../WaveSplitter';

export default abstract class BaseGenerator {
    protected waveSplitter: WaveSplitter;

    constructor(protected multisampleConfiguration: MultisampleConfiguration, wavFile: Uint8Array) {
        this.waveSplitter = new WaveSplitter(wavFile, multisampleConfiguration);
    }

    abstract generate(): Promise<Uint8Array>;

    abstract getFileExtension(): string;

    protected getFileName(s: SampleArea) {
        const midiName = midiToNoteName(s.keyRoot);
        return `samples/sample_${midiName}_k${s.keyRoot}_v${s.velRoot}_${s.id}.wav`;
    }
}

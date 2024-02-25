import JSZip from 'jszip';
import BaseGenerator from './BaseGenerator';
import templateString from './DecentSampler.hbs?raw';
import { compile } from 'handlebars';

export default class DecentSampler extends BaseGenerator {
    async generate(): Promise<Uint8Array> {
        const zip = new JSZip();

        for (const sample of this.waveSplitter.getSamples()) {
            const [id, data] = sample;
            const info = this.multisampleConfiguration.getSampleArea(id);
            if (!info) continue;
            zip.file(this.getFileName(info), data);
        }

        const definition = decentSamplerPreset({
            groups: this.multisampleConfiguration.getGroups().map(g => {
                return {
                    samples: this.multisampleConfiguration.getSampleAreasOfGroup(g).map(s => {
                        const sampleLength = this.waveSplitter.millisecondsToSamples(s.hold + s.decay);
                        return {
                            path: this.getFileName(s),

                            rootNote: s.keyRoot,
                            loNote: s.keyLow,
                            hiNote: s.keyHigh,
                            loVel: s.velLow,
                            hiVel: s.velHigh,
                            pitchKeyTrack: s.keytrack ?? 1,

                            loopEnabled: !!s.loop,
                            loopStart: s.loopStart && this.waveSplitter.millisecondsToFrames(s.loopStart),
                            loopEnd: s.loopEnd && this.waveSplitter.millisecondsToFrames(s.loopEnd),
                            loopCrossfade: s.loopFade && s.loopStart && s.loopEnd && s.loopFade * sampleLength * (s.loopEnd - s.loopStart),
                            gain: s.gain
                        };
                    })
                };
            })
        });

        zip.file(this.multisampleConfiguration.name + '.dspreset', definition);

        return zip.generateAsync({ type: 'uint8array' });
    }

    getFileExtension(): string {
        return 'dslibrary';
    }
}

type decentSamplerPresetType = {
    groups: Array<{
        samples: Array<{
            path: string;
            rootNote: number;
            loNote: number;
            hiNote: number;
            loVel: number;
            hiVel: number;
            pitchKeyTrack?: number;
            loopEnabled?: boolean;
            loopStart?: number;
            loopEnd?: number;
            loopCrossfade?: number;
            seqMode?: 'random' | 'true_random' | 'round_robin' | 'always';
            seqPosition?: number;
            gain?: number;
        }>;
    }>;
};
const decentSamplerPreset = compile<decentSamplerPresetType>(templateString, {});

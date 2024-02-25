import JSZip from 'jszip';
import BaseGenerator from './BaseGenerator';
import { compile } from 'handlebars';
import MultisampleConfiguration from '../MultisampleConfiguration';
import templateString from './BitwigMultisample.hbs?raw';

export default class MultisampleGenerator extends BaseGenerator {
    constructor(multisampleConfiguration: MultisampleConfiguration, wavFile: Uint8Array) {
        super(multisampleConfiguration, wavFile);
    }

    generate(): Promise<Uint8Array> {
        const zip = new JSZip();

        for (const wav of this.waveSplitter.getSamples()) {
            const [id, file] = wav;
            const sampleAarea = this.multisampleConfiguration.getSampleArea(id);
            if (!sampleAarea) continue;
            zip.file(this.getFileName(sampleAarea), file);
        }

        const groups = this.multisampleConfiguration.getGroups();
        zip.file(
            'multisample.xml',
            multisampleDefinitionTemplate({
                groups: groups.map(g => ({ name: g, color: '000000' })),
                name: this.multisampleConfiguration.name,
                samples: this.multisampleConfiguration.getSampleAreas().map(s => {
                    const sampleLength = this.waveSplitter.millisecondsToSamples(s.hold + s.decay);
                    return {
                        file: this.getFileName(s),
                        group: s.group ? groups.indexOf(s.group) : -1,
                        keyTrack: s.keytrack ?? 1,

                        keyRoot: s.keyRoot,
                        keyLow: s.keyLow,
                        keyHigh: s.keyHigh,
                        velocityLow: s.velLow,
                        velocityHigh: s.velHigh,

                        sampleStart: 0,
                        sampleStop: sampleLength,

                        loopMode: s.loop ? 'loop' : 'off',
                        loopStart: s.loopStart && this.waveSplitter.millisecondsToFrames(s.loopStart),
                        loopStop: s.loopEnd && this.waveSplitter.millisecondsToFrames(s.loopEnd),
                        loopFade: s.loopFade,

                        zoneLogic: 'always-play',
                        gain: s.gain
                    };
                })
            })
        );
        return zip.generateAsync({ type: 'uint8array' });
    }

    getFileExtension(): string {
        return 'multisample';
    }
}

const multisampleDefinitionTemplate = compile<{
    name: string;
    groups: Array<{ name: string; color: string }>;
    samples: Array<{
        file: string;
        sampleStart: number;
        sampleStop: number;
        group?: number;
        zoneLogic: 'always-play' | 'round-robin';

        keyRoot: number;
        keyTrack: number;
        keyLow: number;
        keyHigh: number;

        velocityLow: number;
        velocityHigh: number;

        loopMode: 'off' | 'loop' | 'ping-pong';
        loopStart?: number;
        loopStop?: number;
        loopFade?: number;
        gain?: number;
    }>;
}>(templateString, {});

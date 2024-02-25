import type { Optional } from './utils';
import { z } from 'zod';
import { writeMidi } from 'midi-file';
import type { MidiNoteOnEvent, MidiControllerEvent, MidiNoteOffEvent, MidiData, MidiEndOfTrackEvent } from 'midi-file';
import { uid } from './utils';

export default class MultisampleConfiguration {
    name: string = '';
    private bpm: number = 128;
    private sampleSeparation: number = 0;
    private sampleAreas: SampleArea[];

    constructor(name: string, bpm: number, sampleSeparation: number, public autogain = false) {
        this.name = name;
        this.setBPM(bpm);
        this.setSampleSeparation(sampleSeparation);
        this.sampleAreas = [];
    }

    setBPM(bpm: number) {
        if (bpm < 10 || bpm > 500) throw new Error();
        this.bpm = bpm;
    }

    getBPM() {
        return this.bpm;
    }

    setSampleSeparation(sampleSeparation: number) {
        if (sampleSeparation < 0) this.sampleSeparation = 0;
        else this.sampleSeparation = sampleSeparation;
    }

    getSampleSeparation() {
        return this.sampleSeparation;
    }

    getGroups() {
        const set = new Set<string>();
        this.sampleAreas.forEach(e => set.add(e.group || 'default'));
        return [...set];
    }

    getSampleAreasOfGroup(group: string) {
        return this.sampleAreas.filter(e => e.group === group);
    }

    addSampleArea(...sampleArea: Optional<SampleArea, 'id'>[]) {
        for (const s of sampleArea) {
            s.id ??= uid();
            s.group ??= 'default';
            this.sampleAreas.push(sampleAreaSchema.parse(s));
        }
    }

    getSampleAreas() {
        return this.sampleAreas;
    }

    getSampleArea(id: string) {
        return this.getSampleAreas().find(e => e.id === id);
    }

    toString() {
        return JSON.stringify(this, null, 4);
    }

    static fromString(str: string) {
        const obj = JSON.parse(str);
        const c = multisampleConfigurationSchema.parse(obj);
        const instance = new MultisampleConfiguration('', 120, 0, false);
        Object.assign(instance, c);
        return instance;
    }

    static generateBasicConfiguration(params: generateBasicConfigurationInput) {
        const keySize = params.keyEnd - params.keyStart + 1;
        const keyWidth = Math.floor(keySize / params.keySteps);
        const velSize = params.velEnd - params.velStart + 1;
        const velWidth = Math.floor(velSize / params.velSteps);

        const msc = new MultisampleConfiguration(params.name, params.bpm, params.sampleSeparation, params.autogain);

        for (let x = 0; x < params.keySteps; x++) {
            for (let y = 0; y < params.velSteps; y++) {
                const keyPos = params.keyStart + x * keyWidth;
                const velPos = params.velStart + y * velWidth;

                msc.addSampleArea({
                    attack: params.attack ?? 0,
                    hold: params.hold,
                    decay: params.decay ?? 0,
                    keytrack: params.keytrack ?? 1,

                    keyRoot: Math.floor(keyPos + keyWidth / 2),
                    keyLow: x == 0 && params.keyFill ? 0 : keyPos,
                    keyHigh: x == params.keySteps - 1 ? (params.keyFill ? 127 : params.keyEnd) : keyPos + keyWidth - 1,

                    velRoot: y === params.velSteps - 1 ? params.velEnd : velPos + velWidth,
                    velLow: y == 0 && params.velFill ? 0 : velPos,
                    velHigh: y == params.velSteps - 1 ? (params.velFill ? 127 : params.velEnd) : velPos + velWidth -1,

                    loop: params.loop,
                    loopStart: params.loopStart,
                    loopEnd: params.loopEnd,
                    loopFade: params.loopFade
                });
            }
        }
        return msc;
    }

    generateMidiFile() {
        const midiData: MidiData = {
            header: {
                format: 0,
                numTracks: 1,
                ticksPerBeat: 1000 / (this.bpm / 60)
            },
            tracks: [[]]
        };
        const track = midiData.tracks[0];

        track.push(<MidiControllerEvent>{
            type: 'controller',
            channel: MIDI_CHANNEL,
            deltaTime: 0,
            controllerType: CC_SEPARATOR,
            value: 0
        });

        for (const area of this.sampleAreas) {
            track.push(
                <MidiNoteOnEvent>{
                    type: 'noteOn',
                    channel: MIDI_CHANNEL,
                    deltaTime: 0,
                    noteNumber: area.keyRoot,
                    velocity: area.velRoot
                },
                <MidiNoteOffEvent>{
                    type: 'noteOff',
                    channel: MIDI_CHANNEL,
                    deltaTime: area.attack + area.hold,
                    noteNumber: area.keyRoot,
                    velocity: area.velRoot
                },
                <MidiControllerEvent>{
                    type: 'controller',
                    channel: MIDI_CHANNEL,
                    deltaTime: area.decay,
                    controllerType: CC_SEPARATOR,
                    value: 127
                },
                <MidiControllerEvent>{
                    type: 'controller',
                    channel: MIDI_CHANNEL,
                    deltaTime: this.sampleSeparation,
                    controllerType: CC_SEPARATOR,
                    value: 0
                }
            );
        }
        track.push(<MidiEndOfTrackEvent>{
            type: 'endOfTrack',
            deltaTime: 0
        });

        return new Uint8Array(writeMidi(midiData));
    }

    getSamplepackDuration() {
        return this.getSampleAreas().reduce((store, e) => store + e.hold + e.decay, 0);
    }
    getFullDuration() {
        return this.getSamplepackDuration() + this.getSampleAreas().reduce((store, e) => store + e.attack + this.sampleSeparation, 0);
    }

    getEstimatedWavSize(sampleRate: number = 48000, bitDepth: number = 16, channels: number = 2) {
        const bytesPerSample = Math.ceil(bitDepth / 8);
        const bytesPerFrame = bytesPerSample * channels;
        const bytesPerSeconds = sampleRate * bytesPerFrame;
        return (this.getSamplepackDuration() / 1000) * bytesPerSeconds + 20000;
    }

    millisecondsToMidiTicks(ms: number) {
        return Math.floor(ms * 128) / ((60 / this.bpm) * 1000);
    }
}

const sampleAreaSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    group: z.string().default('default').optional(),
    keytrack: z.number().min(0).max(1).default(1).optional(),
    gain: z.number().min(-12).max(12).default(0).optional(),

    attack: z.number().min(0).max(60_000),
    hold: z.number().min(0).max(60_000),
    decay: z.number().min(0).max(60_000),

    loop: z.boolean().default(false).optional(),
    loopStart: z.number().min(0).max(60000).default(0).optional(),
    loopEnd: z.number().min(0).max(60000).default(0).optional(),
    loopFade: z.number().min(0).max(1).default(0).optional(),

    keyLow: z.number().min(0).max(127),
    keyHigh: z.number().min(0).max(127),
    keyRoot: z.number().min(0).max(127),

    velLow: z.number().min(0).max(127),
    velHigh: z.number().min(0).max(127),
    velRoot: z.number().min(0).max(127)
});

const multisampleConfigurationSchema = z.object({
    name: z.string(),
    bpm: z.number().min(1).max(999),
    autogain: z.boolean().default(false).optional(),
    sampleSeparation: z.number().min(0).max(60_000),
    sampleAreas: z.array(sampleAreaSchema)
});

export type SampleArea = z.infer<typeof sampleAreaSchema>;

const CC_SEPARATOR = 20;
const MIDI_CHANNEL = 0;

type generateBasicConfigurationInput = {
    name: string;
    bpm: number;
    sampleSeparation: number;
    autogain?: boolean;

    keyStart: number;
    keyEnd: number;
    keySteps: number;
    keyFill?: boolean;

    velStart: number;
    velEnd: number;
    velSteps: number;
    velFill?: boolean;

    attack?: number;
    hold: number;
    decay?: number;
    keytrack?: number;

    loop?: boolean;
    loopStart?: number;
    loopEnd?: number;
    loopFade?: number;
};

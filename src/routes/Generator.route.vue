<script setup lang="ts">
import { ref } from 'vue';

import Step from '../components/Step.vue';
import ContainerCard from '../components/ContainerCard.vue';
import MultisampleViewVue from '../components/MultisampleView.vue';

import MultisampleConfiguration from '../services/MultisampleConfiguration';
import { downloadData, readLocalFile } from '../services/utils';
import { BaseGenerator, BitwigMultisample, DecentSampler } from '../services/generators';

const multisampleConfiguration = ref<MultisampleConfiguration>();
const wavFile = ref<File>();
const outputType = ref<string>();

async function onMultisampleConfigInput(e: Event) {
    multisampleConfiguration.value = undefined;

    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await readLocalFile(file, 'text');
    multisampleConfiguration.value = MultisampleConfiguration.fromString(text);
}

async function onDownloadMidi() {
    const data = multisampleConfiguration.value?.generateMidiFile();
    if (data) downloadData(data, `${multisampleConfiguration.value?.name}_${multisampleConfiguration.value?.getBPM()}bpm.mid`);
}

function onWavfileInput(e: Event) {
    wavFile.value = undefined;
    const input = e.target as HTMLInputElement;
    wavFile.value = input.files?.[0];
}

async function onGenerateLibrary() {
    if (!multisampleConfiguration.value || !wavFile.value) return;
    const wavArrayBuffer = await readLocalFile(wavFile.value, 'arraybuffer');
    const wavData = new Uint8Array(wavArrayBuffer);
    let generator: BaseGenerator;
    switch (outputType.value) {
        case 'bitwig':
            generator = new BitwigMultisample(multisampleConfiguration.value, wavData);
            break;
        case 'decentsampler':
            generator = new DecentSampler(multisampleConfiguration.value, wavData);
            break;
        default:
            throw new Error();
    }

    const data = await generator.generate();
    downloadData(data, multisampleConfiguration.value.name + '.' + generator.getFileExtension());
}
</script>

<template>
    <ContainerCard title="Multisample Generator" subtitle="Automatically generate sample libraries from midi capable instruments">
        <Step step="Step 1" name="Select Configuration">
            <input type="file" class="form-control" @change="onMultisampleConfigInput" accept="application/json" />
            <div class="is-flex">
                <button class="btn btn-link" @click="$router.push({ name: 'config-basic' })">Generate Configuration</button>
                |
                <a class="btn btn-link" href="https://github.com/todm/multisample-generator/tree/main/templates">Browse predefined configurations</a>
            </div>
            <div class="row align-items-start mt-2" v-if="multisampleConfiguration">
                <table class="table col">
                    <tbody>
                        <tr>
                            <th>Name:</th>
                            <td>{{ multisampleConfiguration?.name }}</td>
                        </tr>
                        <tr>
                            <th>BPM:</th>
                            <td>{{ multisampleConfiguration?.getBPM() }}</td>
                        </tr>
                        <tr>
                            <th>Areas:</th>
                            <td>{{ multisampleConfiguration?.getSampleAreas().length }}</td>
                        </tr>
                        <tr>
                            <th>Autogain:</th>
                            <td>{{ multisampleConfiguration?.autogain }}</td>
                        </tr>
                        <tr>
                            <th>Samplepack Duration:</th>
                            <td>{{ Number((multisampleConfiguration.getSamplepackDuration() || 0) / 1000 / 60).toFixed(2) + 'min' }}</td>
                        </tr>
                        <tr>
                            <th>WAV Duration:</th>
                            <td>{{ Number(multisampleConfiguration.getFullDuration() / 1000 / 60).toFixed(2) + ' min' }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="col">
                    <MultisampleViewVue :config="multisampleConfiguration" />
                </div>
            </div>
        </Step>

        <Step step="Step 2" name="Download MIDI File" :disabled="!multisampleConfiguration">
            <button class="btn btn-secondary" @click="onDownloadMidi">Download MIDI File</button>
        </Step>

        <Step step="Step 3" name="Render the MIDI File to Audio" :disabled="!multisampleConfiguration">
            <p>Render the <b>.mid</b> file to a <b>.wav</b> file in your favourit DAW.</p>
            <ul>
                <li>Make sure to set the correct BPM</li>
                <li>Your instrument should be as loud as possible without clipping</li>
            </ul>
        </Step>

        <Step step="Step 4" name="Upload the wav file" :disabled="!multisampleConfiguration">
            <input type="file" class="form-control" @change="onWavfileInput" accept="audio/wav" />
        </Step>

        <Step step="Step 5" name="Generate the sample-library" :disabled="!multisampleConfiguration || !wavFile">
            <div class="row g-3 w-75">
                <select class="form-select col" v-model="outputType">
                    <option value="bitwig">Bitwig Multisample</option>
                    <option value="decentsampler">Decentsampler</option>
                </select>
                &nbsp;
                &nbsp;
                <button class="btn btn-primary col-auto" @click="onGenerateLibrary" :disabled="!outputType">Generate</button>
            </div>
        </Step>
    </ContainerCard>
</template>

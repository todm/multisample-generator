<script setup lang="ts">
import { ref } from 'vue';

import Step from '../components/Step.vue';
import FileInput from '../components/FileInput.vue';
import ContainerCard from '../components/ContainerCard.vue';
import Dropdown from '../components/Dropdown.vue';
import PropertiesDisplay from '../components/PropertiesDisplay.vue';
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
            <FileInput @change="onMultisampleConfigInput" accept="application/json" />
            <div class="is-flex">
                <a @click="$router.push({ name: 'config-basic' })">Generate Configuration</a>
                <span class="has-text-grey-light ml-2 mr-2">|</span>
                <a href="https://github.com/todm/multisample-generator/tree/main/templates">Browse predefined configurations</a>
            </div>
            <div class="card is-flex mt-3 p-4" v-if="multisampleConfiguration">
                <PropertiesDisplay
                    :options="{
                        Name: multisampleConfiguration.name,
                        BPM: multisampleConfiguration.getBPM().toString(),
                        Areas: multisampleConfiguration.getSampleAreas().length.toString(),
                        Autogain: multisampleConfiguration.autogain.toString(),
                        'Samplepack Duration': Number(multisampleConfiguration.getSamplepackDuration() / 1000 / 60).toFixed(2) + ' min',
                        'Total Duration': Number(multisampleConfiguration.getFullDuration() / 1000 / 60).toFixed(2) + ' min'
                    }"
                    style="width: 50%"
                />
                <MultisampleViewVue :config="multisampleConfiguration" style="width: 50%" />
            </div>
        </Step>

        <Step step="Step 2" name="Download MIDI File" :disabled="!multisampleConfiguration">
            <button class="button" @click="onDownloadMidi">Download MIDI File</button>
        </Step>

        <Step step="Step 3" name="Render the MIDI File to Audio" :disabled="!multisampleConfiguration">
            <p class="pl-2">
                Use a daw to render the downloaded midi file to a <b>wav</b> file. Make sure to set the <b>correct bpm</b> specified in the
                configuration file!
            </p>
        </Step>

        <Step step="Step 4" name="Upload the wav file" :disabled="!multisampleConfiguration">
            <FileInput @change="onWavfileInput" accept="audio/wav" />
        </Step>

        <Step step="Step 5" name="Generate the sample-library" :disabled="!multisampleConfiguration || !wavFile">
            <Dropdown
                :options="{
                    bitwig: 'Bitwig Multisample',
                    decentsampler: 'Decentsampler'
                }"
                placeholder="Library Type"
                v-model="outputType"
            />
            <button class="button is-primary ml-2" @click="onGenerateLibrary" :disabled="!outputType">Generate</button>
        </Step>
    </ContainerCard>
</template>

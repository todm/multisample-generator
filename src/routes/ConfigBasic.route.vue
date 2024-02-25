<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import ContainerCard from '../components/ContainerCard.vue';
import MultisampleView from '../components/MultisampleView.vue';
import Step from '../components/Step.vue';
import PropertiesDisplay from '../components/PropertiesDisplay.vue';
import { Info } from 'lucide-vue-next';
import Modal from '../components/Modal.vue';

import MultisampleConfiguration from '../services/MultisampleConfiguration';
import { downloadData, midiToNoteName } from '../services/utils';

type BasicConfiguration = Parameters<typeof MultisampleConfiguration.generateBasicConfiguration>[0];

const generationData = reactive<BasicConfiguration>({
    name: 'basic',
    bpm: 120,
    autogain: false,
    sampleSeparation: 200,

    attack: 0,
    hold: 2000,
    decay: 1000,

    keyStart: 20,
    keyEnd: 100,
    keySteps: 8,
    keyFill: true,
    keytrack: 100,

    velStart: 30,
    velEnd: 127,
    velSteps: 4,
    velFill: true,

    loop: false,
    loopStart: 0,
    loopEnd: 0,
    loopFade: 50
});

const sizeParams = reactive({
    samplerate: 44100,
    bitdepth: 16,
    channels: 2
});

const modal = ref<typeof Modal>();

const multisampleConfiguration = ref<MultisampleConfiguration>();

function regenerateConfig() {
    try {
        multisampleConfiguration.value = MultisampleConfiguration.generateBasicConfiguration({
            ...generationData,
            keytrack: generationData.keytrack && generationData.keytrack / 100,
            loopFade: generationData.loopFade && generationData.loopFade / 100
        });
    } catch (ex) {}
}

function downloadConfig() {
    if (!multisampleConfiguration.value) return;
    const data = new TextEncoder().encode(multisampleConfiguration.value.toString());
    downloadData(data, `${multisampleConfiguration.value.name}_${multisampleConfiguration.value.getBPM()}bpm.json`);
}

watch(generationData, regenerateConfig);
onMounted(regenerateConfig);
</script>

<template>
    <ContainerCard title="Basic Configuration" subtitle="Generate basic configuration">
        <MultisampleView class="multisample-view" :config="multisampleConfiguration" v-if="multisampleConfiguration" />

        <PropertiesDisplay
            v-if="multisampleConfiguration"
            :options="{
                Areas: multisampleConfiguration.getSampleAreas().length.toString(),
                'Samplepack Duration': (multisampleConfiguration.getSamplepackDuration() / 1000 / 60).toFixed(2) + ' min',
                'Total Duration': (multisampleConfiguration.getFullDuration() / 1000 / 60).toFixed(2) + ' min',
                'Estimated filesize':
                    (
                        multisampleConfiguration.getEstimatedWavSize(sizeParams.samplerate, sizeParams.bitdepth, sizeParams.channels) /
                        1024 /
                        1024
                    ).toFixed(2) + ' megabytes'
            }"
            class="mt-2"
        />
        <a style="position: relative; left: 8.5rem; top: -1.3rem" @click="modal?.open()">
            <Info height="1rem" />
        </a>
        <Modal title="Estimated size" ref="modal">
            <p>The size of the wavefile will be calculated with the following parameters:</p>
            <div class="is-flex mt-4 gap-1">
                <div class="field">
                    <label class="label">Samplerate</label>
                    <div class="control">
                        <input class="input" v-model="sizeParams.samplerate" type="number" min="0" max="500000" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">BitDepth</label>
                    <div class="control">
                        <input class="input" v-model="sizeParams.bitdepth" type="number" min="0" max="128" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Channels</label>
                    <div class="control">
                        <input class="input" v-model="sizeParams.channels" type="number" min="0" max="8" />
                    </div>
                </div>
            </div>
            <p v-if="multisampleConfiguration">
                The size of the file will be roughly
                <b
                    >{{
                        (
                            multisampleConfiguration.getEstimatedWavSize(sizeParams.samplerate, sizeParams.bitdepth, sizeParams.channels) /
                            1024 /
                            1024
                        ).toFixed(2)
                    }}
                    megabytes</b
                >
            </p>
        </Modal>

        <Step step="General" name="">
            <div class="is-flex gap-1">
                <div class="field grow">
                    <label class="label">Name</label>
                    <div class="control">
                        <input class="input" v-model="generationData.name" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">BPM</label>
                    <div class="control">
                        <input class="input" v-model="generationData.bpm" type="number" min="10" max="600" />
                    </div>
                </div>
            </div>
        </Step>
        <Step step="Timing" name="">
            <div class="is-flex gap-1">
                <div class="field">
                    <label class="label">Attack (ms)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.attack" type="number" min="0" max="60000" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Hold (ms)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.hold" type="number" min="0" max="60000" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Decay (ms)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.decay" type="number" min="0" max="60000" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Separate (ms)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.sampleSeparation" type="number" min="0" max="60000" />
                    </div>
                </div>
            </div>
        </Step>
        <Step step="Areas" name="">
            <div class="is-flex gap-1">
                <div class="field">
                    <label class="label">Key Start ({{ midiToNoteName(generationData.keyStart) }})</label>
                    <div class="control">
                        <input class="input" v-model="generationData.keyStart" type="number" min="0" max="127" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Key End ({{ midiToNoteName(generationData.keyEnd) }})</label>
                    <div class="control">
                        <input class="input" v-model="generationData.keyEnd" type="number" min="0" max="127" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Key Steps</label>
                    <div class="control">
                        <input class="input" v-model="generationData.keySteps" type="number" min="0" max="127" />
                    </div>
                </div>
            </div>
            <div class="is-flex gap-1">
                <div class="field">
                    <label class="label">Vel Start</label>
                    <div class="control">
                        <input class="input" v-model="generationData.velStart" type="number" min="0" max="127" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Vel End</label>
                    <div class="control">
                        <input class="input" v-model="generationData.velEnd" type="number" min="0" max="127" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Vel Steps</label>
                    <div class="control">
                        <input class="input" v-model="generationData.velSteps" type="number" min="0" max="127" />
                    </div>
                </div>
            </div>
            <div class="is-flex gap-1">
                <div class="field">
                    <label class="label">Key Fill</label>
                    <div class="control">
                        <input class="checkbox" v-model="generationData.keyFill" type="checkbox" />
                    </div>
                </div>
                <div class="field ml-4">
                    <label class="label">Vel Fill</label>
                    <div class="control">
                        <input class="checkbox" v-model="generationData.velFill" type="checkbox" />
                    </div>
                </div>
                <div class="field ml-4">
                    <label class="label">Autogain</label>
                    <div class="control">
                        <input class="checkbox" v-model="generationData.autogain" type="checkbox" />
                    </div>
                </div>
                <div class="field ml-4">
                    <label class="label">Keytrack (%)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.keytrack" type="number" min="0" max="100" />
                    </div>
                </div>
            </div>
        </Step>
        <Step step="Loop" name="">
            <div class="is-flex gap-1">
                <div class="field">
                    <label class="label">Enable</label>
                    <div class="control">
                        <input class="checkbox" v-model="generationData.loop" type="checkbox" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Start (ms)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.loopStart" type="number" :disabled="!generationData.loop" min="0" max="60000" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">End (ms)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.loopEnd" type="number" :disabled="!generationData.loop" min="0" max="60000" />
                    </div>
                </div>
                <div class="field">
                    <label class="label">Fade (%)</label>
                    <div class="control">
                        <input class="input" v-model="generationData.loopFade" type="number" :disabled="!generationData.loop" min="0" max="100" />
                    </div>
                </div>
            </div>
        </Step>
        <Button class="button is-primary mt-3" @click="downloadConfig" :disabled="!multisampleConfiguration">Download Configuration</Button>
    </ContainerCard>
</template>

<style scoped>
.multisample-view {
    width: 100%;
}

.gap-1 {
    gap: 0.5rem;
}

.grow {
    flex-grow: 1;
}
</style>

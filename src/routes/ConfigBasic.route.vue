<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';

import ContainerCard from '../components/ContainerCard.vue';
import MultisampleView from '../components/MultisampleView.vue';
import { Info } from 'lucide-vue-next';
import Modal from '../components/Modal.vue';
import Accordion from '../components/Accordion.vue';
import AccordionItem from '../components/AccordionItem.vue';
import MultiRange from '../components/MultiRange.vue';

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

watch(generationData, () => regenerateConfig());
onMounted(regenerateConfig);
</script>

<template>
    <ContainerCard title="Basic Configuration" subtitle="Generate basic configuration">
        <div class="row align-items-start mt-2" v-if="multisampleConfiguration">
            <table class="table col">
                <tbody>
                    <tr>
                        <th>Name:</th>
                        <td>{{ multisampleConfiguration.name }}</td>
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
                        <th>Samplepack Duration:</th>
                        <td>{{ Number((multisampleConfiguration.getSamplepackDuration() || 0) / 1000 / 60).toFixed(2) + 'min' }}</td>
                    </tr>
                    <tr>
                        <th>WAV Duration:</th>
                        <td>{{ Number(multisampleConfiguration.getFullDuration() / 1000 / 60).toFixed(2) + ' min' }}</td>
                    </tr>
                    <tr>
                        <th>
                            Estimated filesize:
                            <a href="" @click.prevent="modal?.open()">
                                <Info height="1rem" />
                            </a>
                        </th>
                        <td>
                            {{
                                (
                                    multisampleConfiguration.getEstimatedWavSize(sizeParams.samplerate, sizeParams.bitdepth, sizeParams.channels) /
                                    1024 /
                                    1024
                                ).toFixed(2) + ' megabytes'
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="col">
                <MultisampleView class="multisample-view" :config="multisampleConfiguration" v-if="multisampleConfiguration" />
            </div>
        </div>

        <Modal title="Estimated size" ref="modal">
            <p>The size of the wavefile will be calculated with the following parameters:</p>
            <div class="row">
                <div class="col-auto">
                    <label class="form-label">Samplerate:</label>
                    <input type="number" class="form-control" min="0" max="500000" v-model="sizeParams.samplerate" />
                </div>
                <div class="col-auto">
                    <label class="form-label">BitDepth:</label>
                    <input type="number" class="form-control" min="0" max="128" v-model="sizeParams.bitdepth" />
                </div>
                <div class="col-auto">
                    <label class="form-label">Channels:</label>
                    <input type="number" class="form-control" min="0" max="8" v-model="sizeParams.channels" />
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

        <Accordion>
            <AccordionItem header="General" val="general">
                <div class="row">
                    <div class="col-auto">
                        <label class="col-form-label">Name</label>
                        <input type="text" class="form-control" v-model="generationData.name" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">BPM</label>
                        <input type="number" class="form-control" v-model="generationData.bpm" min="10" max="600" />
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem header="Timing" val="timing">
                <div class="row">
                    <div class="col-auto">
                        <label class="col-form-label">Attack <span class="badge text-bg-secondary">ms</span></label>
                        <input class="form-control" v-model="generationData.attack" type="number" min="0" max="60000" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Hold <span class="badge text-bg-secondary">ms</span></label>
                        <input class="form-control" v-model="generationData.hold" type="number" min="0" max="60000" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Decay <span class="badge text-bg-secondary">ms</span></label>
                        <input class="form-control" v-model="generationData.decay" type="number" min="0" max="60000" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Separate <span class="badge text-bg-secondary">ms</span></label>
                        <input class="form-control" v-model="generationData.sampleSeparation" type="number" min="0" max="60000" />
                    </div>
                </div>
            </AccordionItem>
            <AccordionItem header="Keys" val="keys">
                <div class="col-auto">
                    <label class="form-label">
                        Key Range
                        <span class="badge text-bg-secondary">{{ midiToNoteName(generationData.keyStart) }}</span>
                        -
                        <span class="badge text-bg-secondary">{{ midiToNoteName(generationData.keyEnd) }}</span>
                    </label>
                    <MultiRange :min="0" :max="127" v-model:v1="generationData.keyStart" v-model:v2="generationData.keyEnd" />
                    <div class="piano"></div>
                </div>
                <div class="row">
                    <div class="col-auto">
                        <label class="col-form-label">Key Steps</label>
                        <input class="form-control" v-model="generationData.keySteps" type="number" min="0" max="127" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Key Steps</label>
                        <input class="form-control" v-model="generationData.keySteps" type="number" min="0" max="127" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Keytrack <span class="badge text-bg-secondary">%</span></label>
                        <input class="form-control" v-model="generationData.keytrack" type="number" min="0" max="100" />
                    </div>
                </div>
                <div class="form-check mt-3">
                    <input class="form-check-input" v-model="generationData.keyFill" type="checkbox" />
                    <label class="form-check-label">Key Fill</label>
                </div>
            </AccordionItem>
            <AccordionItem header="Velocity" val="vel">
                <label class="form-label">
                    Velocity Range
                    <span class="badge text-bg-secondary">{{ generationData.velStart }}</span>
                    -
                    <span class="badge text-bg-secondary">{{ generationData.velEnd }}</span>
                </label>
                <MultiRange :min="0" :max="127" v-model:v1="generationData.velStart" v-model:v2="generationData.velEnd" />
                <div class="row">
                    <div class="col-auto">
                        <label class="col-form-label">Velocity Steps</label>
                        <input class="form-control" v-model="generationData.velSteps" type="number" min="0" max="127" />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Velocity Steps</label>
                        <input class="form-control" v-model="generationData.velSteps" type="number" min="0" max="127" />
                    </div>
                </div>
                <div class="form-check mt-3">
                    <input class="form-check-input" v-model="generationData.velFill" type="checkbox" />
                    <label class="form-check-label">Velocity Fill</label>
                </div>
                <div class="form-check mt-3">
                    <input class="form-check-input" v-model="generationData.autogain" type="checkbox" />
                    <label class="form-check-label">Autogain</label>
                </div>
            </AccordionItem>
            <AccordionItem header="Looping" val="loop">
                <div class="form-check mt-3">
                    <input class="form-check-input" v-model="generationData.loop" type="checkbox" />
                    <label class="form-check-label">Loop Enabled</label>
                </div>
                <div class="row">
                    <div class="col-auto">
                        <label class="col-form-label">Start <span class="badge text-bg-secondary">ms</span></label>
                        <input
                            class="form-control"
                            v-model="generationData.loopStart"
                            type="number"
                            min="0"
                            max="60000"
                            :disabled="!generationData.loop"
                        />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">End <span class="badge text-bg-secondary">ms</span></label>
                        <input
                            class="form-control"
                            v-model="generationData.loopEnd"
                            type="number"
                            min="0"
                            max="60000"
                            :disabled="!generationData.loop"
                        />
                    </div>
                    <div class="col-auto">
                        <label class="col-form-label">Fade <span class="badge text-bg-secondary">%</span></label>
                        <input
                            class="form-control"
                            v-model="generationData.loopFade"
                            type="number"
                            min="0"
                            max="100"
                            :disabled="!generationData.loop"
                        />
                    </div>
                </div>
            </AccordionItem>
        </Accordion>
        <button class="btn btn-primary mt-3" @click="downloadConfig" :disabled="!multisampleConfiguration">Download Configuration</button>
    </ContainerCard>
</template>

<style scoped>
.piano {
    width: 100%;
    height: 2rem;
    background-image: url('../assets/piano.svg');
    background-size: calc(100% / 10.6666666666666) 100%;
}
</style>

<script setup lang="ts">
import type MultisampleConfiguration from '../services/MultisampleConfiguration';
import { onMounted, watch, ref } from 'vue';

const props = defineProps<{
    config: MultisampleConfiguration;
    bounds?: {
        t: number;
        r: number;
        b: number;
        l: number;
    };
}>();

const canvas = ref<HTMLCanvasElement>();
const canvasWrapper = ref<HTMLDialogElement>();

function draw() {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx) return;

    if (canvasWrapper.value) {
        ctx.canvas.width = canvasWrapper.value?.clientWidth;
        ctx.canvas.height = canvasWrapper.value?.clientHeight;
    }

    ctx.clearRect(0, 0, 9999, 9999);

    const cellWidth = ctx.canvas.width / 127;
    const cellHeight = ctx.canvas.height / 127;

    ctx.fillStyle = '#00008833';
    ctx.strokeStyle = '#000000';

    for (const area of props.config.getSampleAreas()) {
        ctx.fillStyle = '#00008833';
        ctx.strokeStyle = '#000000';
        ctx.fillRect(
            area.keyLow * cellWidth, //
            area.velLow * cellHeight,
            (area.keyHigh - area.keyLow + 1) * cellWidth,
            (area.velHigh - area.velLow + 1) * cellHeight
        );
        ctx.strokeRect(
            area.keyLow * cellWidth, //
            area.velLow * cellHeight,
            (area.keyHigh - area.keyLow + 1) * cellWidth,
            (area.velHigh - area.velLow + 1) * cellHeight
        );
        ctx.fillStyle = '#00008844';
        ctx.fillRect(
            area.keyRoot * cellWidth, //
            area.velRoot * cellHeight-5,
            5,
            5
        );
    }

    if (props.bounds) {
        ctx.strokeStyle = '#ff000080';
        ctx.strokeRect(
            props.bounds.l * cellWidth,
            props.bounds.b * cellHeight,
            (props.bounds.r - props.bounds.l + 1) * cellWidth,
            (props.bounds.t - props.bounds.b + 1) * cellHeight
        );
    }
}

onMounted(() => draw());
watch(
    () => props.config,
    () => draw()
);
</script>

<template>
    <canvas ref="canvas" width="500" height="250"></canvas>
</template>

<style scoped>
canvas {
    transform: scaleY(-1);
    border: 1px solid black;
    border-radius: 0.4rem;
}
</style>

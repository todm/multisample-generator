<script setup lang="ts">
import type MultisampleConfiguration from '../services/MultisampleConfiguration';
import { onMounted, watch, ref } from 'vue';

const props = defineProps<{
    config: MultisampleConfiguration;
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

    for (const area of props.config.getSampleAreas()) {
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
    }
    ctx.stroke();
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

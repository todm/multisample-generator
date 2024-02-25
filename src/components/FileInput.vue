<script setup lang="ts">
import { Upload } from 'lucide-vue-next';
import { ref } from 'vue';

const fileName = ref<string | undefined>();

defineOptions({
    inheritAttrs: false
});
defineProps({
    buttonText: { type: String, default: 'Choose a file' }
});

function onchange(e: Event) {
    const input = e.target as HTMLInputElement;
    fileName.value = input.files?.[0].name;
}
</script>

<template>
    <div class="file has-name">
        <label class="file-label">
            <input type="file" class="file-input" v-bind="$attrs" @change="onchange" />
            <span class="file-cta">
                <span class="file-icon">
                    <Upload />
                </span>
                <span class="file-label">{{ buttonText }}</span>
            </span>
            <span class="file-name">
                <i v-if="!fileName">No file selected</i>
                {{ fileName }}
            </span>
        </label>
    </div>
</template>

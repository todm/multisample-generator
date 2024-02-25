<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { ref } from 'vue';

const isActive = ref(false);
const selectedKey = defineModel<string | undefined>();

defineProps<{
    options: Record<string, string>;
    placeholder?: string;
}>();

function onTriggerClick() {
    isActive.value = !isActive.value;
}

function onSelect(key: string) {
    isActive.value = false;
    selectedKey.value = key;
}
</script>

<template>
    <div class="dropdown" :class="{ 'is-active': isActive }">
        <div class="dropdown-trigger" @click="onTriggerClick">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                <span v-if="selectedKey">{{ options[selectedKey] }}</span>
                <span v-else>
                    <i>{{ placeholder }}</i>
                </span>
                <span class="icon is-small ml-4">
                    <ChevronDown />
                </span>
            </button>
        </div>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
                <a
                    class="dropdown-item"
                    :class="{ 'is-active': selectedKey === key }"
                    @click.prevent="onSelect(key)"
                    v-for="[key, name] in Object.entries(options)"
                    >{{ name }}</a
                >
            </div>
        </div>
    </div>
</template>

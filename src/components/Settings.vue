<script setup lang="ts">
import { ref } from 'vue';
import Tracker from './Tracker.vue';

// State Management
const isOpen = ref<boolean>(true);

interface GraphSettings {
  updateFrequency: number; // in seconds
  maxEvents: number;
}

const settings = ref<GraphSettings>({
  updateFrequency: 30,
  maxEvents: 25
});

const averageValue = ref<string>('');
const highestValue = ref<number>(0);
const lowestValue = ref<number>(Number.MAX_SAFE_INTEGER)


// Compute statistics from current data
function computeStatistics(numbers: number[]) {
  if (numbers.length === 0) averageValue.value = '0.00'
  const sum = numbers.reduce((a, b) => a + b, 0)
  highestValue.value = Math.max(highestValue.value, Math.max(...numbers))
  lowestValue.value = Math.min(lowestValue.value, Math.min(...numbers))
  averageValue.value = (sum / numbers.length).toFixed(2)
}


// Dropdown Options
const frequencyOptions = [
  { label: '1 Second', value: 1 },
  { label: '5 Seconds', value: 5 },
  { label: '10 Seconds', value: 10 },
  { label: '30 Seconds', value: 30 },
  { label: '1 Minute', value: 60 },
];

const toggleMenu = () => { isOpen.value = !isOpen.value; };
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-gray-100 font-sans">
    <aside :class="[
      'bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out flex flex-col',
      isOpen ? 'w-80' : 'w-20'
    ]">
      <div class="p-6 flex items-center justify-between border-b border-gray-700">
        <h2 v-if="isOpen" class="font-bold text-xl tracking-tight transition-all">Settings & Statistics</h2>
        <button @click="toggleMenu" class="p-2 hover:bg-gray-700 rounded-lg transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      <div v-if="isOpen" class="p-6 space-y-8 overflow-y-auto">

        <section>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Update Frequency
          </label>
          <div class="relative">
            <select v-model.number="settings.updateFrequency"
              class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer text-sm">
              <option v-for="opt in frequencyOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <label class="block text-xs font-semibold text-red-400 uppercase tracking-wider mt-2">
            Warning: will reset graph data
          </label>
        </section>

        <section>
          <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Max Events Stored
          </label>
          <input type="number" v-model.number="settings.maxEvents"
            class="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
        </section>

        <hr class="border-gray-700">

        <section class="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
          <h3 class="text-xs font-semibold text-gray-400 uppercase mb-4">Live Statistics</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">Average Listeners:</span>
              <span class="text-sm font-mono font-bold text-green-400">{{ averageValue }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">Highest Listeners:</span>
              <span class="text-sm font-mono text-blue-400">{{ highestValue }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-400">Lowest Listeners:</span>
              <span class="text-sm font-mono text-blue-400">{{ lowestValue }}</span>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="flex flex-col items-center py-6 space-y-8">
        <span title="Frequency" class="text-xl opacity-50">⏱️</span>
        <span title="Events" class="text-xl opacity-50">📊</span>
        <span title="Stats" class="text-xl opacity-50">📈</span>
      </div>
    </aside>

    <main class="flex-1 min-w-0 p-12 relative">
      <div class="h-full w-full">
        <Tracker :frequency="settings.updateFrequency" :max-events="settings.maxEvents || 0"
          @data-update="computeStatistics" />
      </div>
    </main>
  </div>
</template>
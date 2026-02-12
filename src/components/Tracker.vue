<template>
  <canvas ref="chartCanvas"></canvas>
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted, onBeforeUnmount, watchEffect } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import { getListenerCount } from '../utils/api.ts';
import 'chartjs-adapter-date-fns'


const props = defineProps({
  frequency: Number,
  maxEvents: Number
})

const emit = defineEmits<{
  (e: 'data-update', points: number[]): void
}>()

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const canvas = useTemplateRef("chartCanvas")
let chart: Chart | null = null
let intervalId: number | undefined
let updateFreq: number | undefined
let updateEvents: number | undefined

watchEffect(() => {
  console.log(`Chart initialized with update frequency of ${props.frequency} seconds`)
  if (props.frequency) changeFreq(props.frequency)
  if (props.maxEvents) updateEvents = props.maxEvents
  chart?.destroy()
  initChart()
  graphValue()
})


// Change the update frequency of the graph (from settings)
function changeFreq(freq: number): void {
  updateFreq = freq
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(graphValue, updateFreq * 1000)
  if (chart && chart.data.datasets[0]) {
    chart.data.datasets[0].data = []
  }
  // graphValue()
  // chart?.update()
  chart?.data.datasets[0]?.data.splice(0, chart?.data.datasets[0]?.data.length)
}

// Plot point on graph
async function graphValue() {
  if (!chart) return
  const now = new Date().toLocaleTimeString()
  chart.data.labels?.push(now)
  const listenerCount = await getListenerCount() as number
  chart.data.datasets[0]?.data.push(listenerCount)
  const length = chart.data.datasets[0]?.data.length as number
  if (updateEvents && length > updateEvents) {
    chart.data.labels?.shift()
    chart.data.datasets[0]?.data.shift()
  }
  chart?.update()

  const rawData = chart?.data.datasets[0]?.data
  if (rawData) {
    const cleanData: number[] = rawData.filter((item): item is number => {
      return typeof item === 'number';
    });
    emit('data-update', cleanData)
  }
}

// Initialize chart
function initChart() {
  if (!canvas.value) return
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Listener Count',
          data: [],
          // Line
          borderColor: '#3b82f6',        // line color
          borderWidth: 2,
          backgroundColor: 'transparent',

          // Points
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      responsive: true,
      resizeDelay: 0,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  })
}

// When canvas is mounted, initialize graph and update loop
onMounted(() => {
  initChart()
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  chart?.destroy()
})
</script>
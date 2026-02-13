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
let dataPoints: number[] = []
let intervalId: number | undefined
let updateFreq: number | undefined
let updateEvents: number | undefined


// Listeners for prop changes
watchEffect(() => {
  // Update frequency
  if (props.frequency && props.frequency !== updateFreq) {
    console.log(`Updated frequency to ${props.frequency} seconds`)
    changeFreq(props.frequency)
    chart?.destroy()
    initChart()
    graphValue()
  }
  // Max events
  if (props.maxEvents && props.maxEvents !== updateEvents) {
    console.log(`Updated max events to ${props.maxEvents}`)
    updateEvents = props.maxEvents
    chart?.destroy()
    initChart()
    graphArray(dataPoints.slice(-updateEvents, -1))
    // Re-calculate statistics for the current event window
    emitData()
  }
})


// Change the update frequency of the graph (from settings)
function changeFreq(freq: number): void {
  updateFreq = freq
  if (intervalId) clearInterval(intervalId)
  intervalId = window.setInterval(graphValue, updateFreq * 1000)
  dataPoints.splice(0, dataPoints.length)
}


// Adds a single point to the graph
function graphSingleValue(value: number): void {
  const now = new Date().toLocaleTimeString()
  chart?.data.datasets[0]?.data.push(value)
  chart?.data.labels?.push(now)
  const length = chart?.data.datasets[0]?.data.length as number
  if (updateEvents && length > Number(updateEvents)) {
    chart?.data.labels?.shift()
    chart?.data.datasets[0]?.data.shift()
  }
  chart?.update()
}


// Adds an array of points to the graph (used when changing max events)
function graphArray(values: number[]): void {
  for (const value of values) {
    graphSingleValue(value)
  }
}


// Plot point on graph
async function graphValue() {
  if (!chart) return
  const listenerCount = await getListenerCount() as number
  dataPoints.push(listenerCount)
  graphSingleValue(listenerCount)
  emitData()
}


// Emit data currently graphed to Settings for statistics
function emitData(): void {
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
  graphValue()
})

// When canvas is unmounted, clear interval and destroy graph
onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
  chart?.destroy()
})
</script>
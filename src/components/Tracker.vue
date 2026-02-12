<template>
  <div class="flex bg-slate-200 p-5 text-slate-500 h-screen w-screen justify-center pt-16">
    <div class="bg-slate-700 rounded-xl p-4 w-2/3 min-w-[500px] h-2/3 min-h-[350px]">
      <canvas ref="chartCanvas"></canvas>
    </div>
    <!-- <Settings @freq-select="changeFreq"/> -->
</div>
</template>

<script setup lang="ts">
  import { useTemplateRef, onMounted, onBeforeUnmount } from 'vue'
  import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
  import { getListenerCount } from '../utils/api.ts';
  import Settings from './Settings.vue';
  import 'chartjs-adapter-date-fns'

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

  const canvas = useTemplateRef("chartCanvas")
  let chart: Chart | null = null
  let intervalId: number | undefined
  let updateFreq: number = 30

  // Change the update frequency of the graph (from settings)
  function changeFreq(freq: number): void {
    updateFreq = freq
    if (intervalId) clearInterval(intervalId)
    // intervalId = window.setInterval(graphValue, updateFreq * 1000)
    if (chart && chart.data.datasets[0]) {
      chart.data.datasets[0].data = []
    }
    graphValue()
    chart?.update()
  }

  // Random value generator (for datapoint testing)
  function getRandomValue(): number {
    return Math.floor(Math.random() * 10)
  }

  // Plot point on graph
  async function graphValue() {
    if (!chart) return
    const now = new Date().toLocaleTimeString()
    chart.data.labels?.push(now)
    // chart.data.datasets[0]?.data.push(getRandomValue())
    const listenerCount = await getListenerCount() as number
    chart.data.datasets[0]?.data.push(listenerCount)
    const length = chart.data.datasets[0]?.data.length as number
    if (length > 15) {
      chart.data.labels?.shift()
      chart.data.datasets[0]?.data.shift()
    }
    chart.update()
  }

  // When canvas is mounted, initialize graph and update loop
  onMounted(() => {
    if (!canvas.value) return

    chart = new Chart(canvas.value, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Random Value',
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
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    })

    graphValue()
    intervalId = window.setInterval(graphValue, updateFreq * 1000)
  })

  onBeforeUnmount(() => {
    if (intervalId) clearInterval(intervalId)
    chart?.destroy()
  })
</script>
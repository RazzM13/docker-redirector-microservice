<template>
  <div class="container">
    <chart
      v-if="loaded"
      :chartdata="chartdata"
      :options="options"/>
  </div>
</template>

<script>
import Chart from './Chart.vue'

export default {
  components: { Chart },
  data: () => ({
    loaded: false,
    chartdata: null,
    options: null
  }),
  async mounted () {
    this.loaded = false
    try {
      const stats = await fetch(
        'http://localhost:8083/api/stats/localhost/main-graph?period=30d&date=2021-05-05&filters=%7B%7D'
      )
      .then((r) => r.json())
      console.log(stats)
      this.chartdata = { datasets: [{ data: stats.plot }], labels: stats.labels }
      this.loaded = true
    } catch (e) {
      console.error(e)
    }
  }
}
</script>

<style scoped>
.container > iframe {
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
}

.container > iframe >> * {
  display: none;
}
</style>

<template>
  <div class="container">
    <iframe :src="src" width="100%" height="100%"/>
  </div>
</template>

<script>
export default {
  components: { },
  props: {
    src: {
      type: String,
      required: true
    },
  },
  data: () => ({
    loaded: false,
  }),
  async mounted () {
    this.loaded = true
  }
}
</script>

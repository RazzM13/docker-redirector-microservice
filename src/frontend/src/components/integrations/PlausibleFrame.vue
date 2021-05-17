<template>
  <div class="container">
    <i-frame
      :src="src"
    />
  </div>
</template>

<script>
import IFrame from './IFrame'
export default {
  components: { IFrame },
  props: {
    shortUrl: {
      type: String,
      required: false
    },
  },
  data: () => ({
    src: '//localhost:8083/share/frontend',
  }),
  mounted: function() {
    if (this.shortUrl) {
      this.src = `//localhost:8083/share/localhost?auth=frontend&page=%2Fr%2F${this.shortUrl}`;
    }
  }
}
</script>

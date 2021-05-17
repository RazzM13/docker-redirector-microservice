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
  data: () => ({
    src: '//localhost:8081/',
  }),
}
</script>

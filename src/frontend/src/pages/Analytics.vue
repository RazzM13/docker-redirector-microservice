<template>
  <q-page class="flex flex-center">
    <plausible-frame
      :short-url="$route.params.shortUrl"
      class="col"
    ></plausible-frame>
  </q-page>
</template>

<script>
import PlausibleFrame from "components/integrations/PlausibleFrame";
export default {
  name: 'PageAnalytics',
  components: { PlausibleFrame }
}
</script>

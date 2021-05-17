<template>
  <q-page class="flex flex-center">
    <swagger-frame class="col"></swagger-frame>
  </q-page>
</template>

<script>
import SwaggerFrame from "components/integrations/SwaggerFrame";
export default {
  name: 'PageDocumentation',
  components: { SwaggerFrame }
}
</script>

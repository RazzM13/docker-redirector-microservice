<template>
    <q-card class="my-card">
    <q-card-section>
      <div class="text-h6 text-center">
        <a :href="redirectorBaseUrl + redirection.shortUrl">{{ redirection.shortUrl }}</a>
      </div>
      <div class="text-subtitle2 text-center">{{ redirection.longUrl }}</div>
    </q-card-section>

    <q-separator />

    <q-card-actions horizontal class="justify-evenly">
      <q-btn flat color="blue" @click="$emit('click-change', redirection)">Change</q-btn>
      <q-btn flat color="red" @click="$emit('click-remove', redirection)">Remove</q-btn>
    </q-card-actions>

    <div class="text-h6 text-center" v-if="redirectionViews">
      <q-separator/>
      <q-btn flat @click="$router.push(`analytics/${redirection.shortUrl}`)">
        <q-icon name="visibility"/>
        <span class="q-pa-sm">{{redirectionViews}} redirects</span>
      </q-btn>
    </div>

  </q-card>
</template>

<script>
import { RedirectionModel } from 'common/dal/models/redirection';

export default {
  components: { },
  props: {
    redirection: {
      type: Object,
      required: true
      // TODO: validation
    },
    redirectorBaseUrl: {
      type: String,
      required: true
    },
    analyticsBaseUrl: {
      type: String,
      required: true
    },
  },
  data: () => ({
    redirectionViews: null,
  }),
  async mounted () {
    const redirectionStats = await fetch(`${this.analyticsBaseUrl}/pages?filters=%7B%22page%22%3A%22%2Fr%2F${this.redirection.shortUrl}%22%7D&auth=frontend`)
    .then(result => result.json());
    this.redirectionViews = redirectionStats[0]['pageviews'];
  }
}
</script>

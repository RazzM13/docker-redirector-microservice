<template>
  <q-page padding style="padding-top: 66px">

    <div class="q-pa-md row items-start justify-evenly q-gutter-md">
      <redirection-card
        v-for="entry of entries" :key="entry.id"
        v-bind:redirection="entry"
        v-bind:redirector-base-url="redirectorBaseUrl"
        v-bind:analytics-base-url="analyticsBaseUrl"
        @click-change="handleRedirectionCardClickChange"
        @click-remove="handleRedirectionCardClickRemove"
      ></redirection-card>
    </div>

     <q-dialog v-model="registrationModalVisible" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">URL</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            filled
            label="e.g. http://example.com/"
            v-model="newEntryForm.entry.longUrl"
            autofocus
            bottom-slots
            hint="The target of the redirection."
            :error-message="newEntryForm.errorMessage"
            :error="newEntryForm.hasError"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" @click="hideRegistrationModal" />
          <q-btn flat label="Register" @click="processRegistration" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- place QPageSticky at end of page -->
    <q-page-sticky expand position="top">
      <q-toolbar class="bg-white justify-center">
        <q-btn color="secondary" icon="add" label="Register redirection" @click="showRegistrationModal" />
      </q-toolbar>
    </q-page-sticky>

  </q-page>
</template>

<script>
import { RedirectionModel } from 'common/dal/models/redirection';
import RedirectionCard from "components/cards/RedirectionCard";

const isValidUrl = (url) => {
  try {
    new URL(url);
  } catch (err) {
    return false;
  }
  return true;
}

const newEntryFormTemplate = {
  entry: new RedirectionModel().toJSON(),
  hasError: false,
  errorMessage: null
}

export default {
  name: 'PageIndex',
  inject: [ 'redirectionService' ],
  components: { RedirectionCard },
  data: () => ({
    entries: [],
    redirectionCollection: null,
    redirectorBaseUrl: `http://localhost:8082/r/`,
    analyticsBaseUrl: `http://localhost:8083/api/stats/localhost`,
    newEntryForm: Object.assign({}, newEntryFormTemplate),
    registrationModalVisible: false
  }),
  methods: {

    resetRegistrationModal(entry) {
      this.newEntryForm = Object.assign({}, newEntryFormTemplate);
      this.newEntryForm.entry = new RedirectionModel(entry).toJSON();
    },

    showRegistrationModal() { this.registrationModalVisible = true },

    hideRegistrationModal() {
      this.registrationModalVisible = false;
      this.resetRegistrationModal();
    },

    showRegistrationError(errorMessage) {
      this.newEntryForm.hasError = true;
      this.newEntryForm.errorMessage = errorMessage;
    },

    resetRegistrationError() {
      this.newEntryForm.hasError = false;
      this.newEntryForm.errorMessage = '';
    },
    // TODO
    validateRegistration() {
      this.resetRegistrationError();
      console.log(this.newEntryForm.entry);
      if(!this.newEntryForm.entry.longUrl || !isValidUrl(this.newEntryForm.entry.longUrl)) {
        this.showRegistrationError('Invalid URL!');
      }
    },

    processRegistration() {
      this.validateRegistration();
      if (this.newEntryForm.hasError) {
        return;
      }

      this.redirectionCollection.create(this.newEntryForm.entry, {wait: true});
      this.hideRegistrationModal();
    },

    handleRedirectionCardClickChange(redirectionData) {
      this.resetRegistrationModal(redirectionData);
      this.showRegistrationModal();
    },

    handleRedirectionCardClickRemove(redirectionData) {
      this.redirectionCollection.remove(redirectionData).destroy();
    },

  },
  watch: {
    'newEntryForm.entry.longUrl': function (currVal) { currVal && this.validateRegistration() },
  },
  mounted: async function () {
    this.redirectionCollection = await this.redirectionService.find({liveUpdate: true});
    this.redirectionCollection.on('change add remove reset', () => {
      this.entries = this.redirectionCollection.toJSON();
    });
    this.entries = this.redirectionCollection.toJSON();
    window.redirectionCollection = this.redirectionCollection;
  }
}
</script>

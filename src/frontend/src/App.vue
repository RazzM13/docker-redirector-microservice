<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
import io from 'socket.io-client';
import RedirectionService from 'src/dal/services/redirection';

const socket = io('http://localhost:8082');
const redirectionService = new RedirectionService(socket);

export default {
  name: 'App',
  provide: () => ({
    redirectionService
  }),
}
</script>

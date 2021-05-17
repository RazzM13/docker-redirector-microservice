import pkg from '../../package.json';

export default ({ app, router, store, Vue }) => {
  window.quasar = { app, router, store, Vue };
  app.name = pkg.name;
  app.author = pkg.author;
  app.version = pkg.version;
  Vue.prototype.$q.app = app;
}

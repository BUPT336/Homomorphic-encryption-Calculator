import Vue from 'vue';
import Router from 'vue-router';
import index from './pages/Index.vue';

Vue.use(Router);

export default new Router({
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'index',
      components: { default: index},
      props: {
        header: { colorOnScroll: 400 }
      }
    }
  ],
});

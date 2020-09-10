<template>
  <div class="page-header clear-filter" filter-color="white">
    <div
      class="page-header-image"
      style="background-image: url('/img/now-logo.jpg')"
    ></div>
    <!--<div class="content">-->
      <div class="container raw" id="mainBox">
      <paillierBox/>
      <fhe-box/>
      </div>
    <!--</div>-->
  </div>
</template>


<script>
import paillierBox from '@/components/paillierBox.vue'
import fheBox from '@/components/FheBox.vue'

export default {
  name: 'index-page',
  components:{
    paillierBox:paillierBox,
    fheBox: fheBox
  }
};
</script>
<style>
#mainBox {
  display: flex;
  justify-content: space-around;
}
.card-signup {
  opacity: 0.8;
}
</style>

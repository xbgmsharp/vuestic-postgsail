<template>
  <div class="flex flex-col">
    <div class="text-center">
      <h2>Still loading... sorry for the long wait!</h2>
      <img class="img-thumbnail" src="/boat.gif" alt="loading..." />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Loading',
  }
</script>

<style>
  #loading {
    position: absolute;
    z-index: 1000;
    /*background-color: white;*/
    height: 100vh;
    width: 100vw;
    text-align: center;
    line-height: 100vh;
    margin: auto;
  }
  .img {
    position: relative;
    margin: auto;
    /*  margin-top: 20%; */
  }
</style>

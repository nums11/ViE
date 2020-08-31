<template>
  
  <div class="centered-module">
    <div class="centerer">
      <div class="logo-area">
        <div class="logo-box" :style="{backgroundImage: `url( ${require('@/assets/venue-logo.svg')} )`}"></div>
        <div class="text-box">Venue</div>
      </div>
      <slot></slot>
    </div>
  </div>

</template>
<script>
export default {
  name: 'CenteredModule'
}
</script>
<style lang="scss">
.centered-module {
  background-color: white;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  
  .centerer {
    min-width: 350px;
    max-width: 500px;
    margin: 0 auto;
    position: relative;
    top: 25%;
    

    .button-area {
      text-align: center;
      margin-top: 40px;
    }

    .text-body {
      .header {
        font-family: Lato;
        font-size: 1.3rem;
        color: #383B3F;
      }
    }

    .logo-area {
      margin-bottom: 20px;
      height: 50px;
      display: flex;
      align-items: center;

      .logo-box {
        width: 35px;
        height: 35px;
        background-size: 100%;
        background-repeat: no-repeat;
        margin-right: 10px;
      }

      .text-box {
        font-family: Ubuntu;
        font-size: 2rem;
        color: #383B3F;
      }
    }
  }
}


</style>
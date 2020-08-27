<template>
      <button 
        @click="handleButtonClick" 
        v-bind:class="{hidden:fade_out, visible:fade_in}" 
        type="button" class="btn button shadow venue-btn" 
        tabindex="0"

        :style="{
          fontSize: getFontSize ()
        }"
      >
        <!-- <div v-if="show_login_text">Login</div> -->
        <!-- <div v-else>Get Started</div> -->
        <div>{{ text }}</div>
      </button>
</template>

<script>
  export default {
    name: 'Button',
    props: {
      // btn_str: String
      href: String,
      text: String,
      onClick: Function,
      config: Object
    },
    data() {
      return {
        show_login_text: false,
        fade_out: false,
        fade_in: false
      }
    },
    created() {
    },
    methods: {
      getFontSize () {
        if (this.config && this.config.fontSize) return this.config.fontSize
        return '1rem'
      },
      handleButtonClick () {

        if (this.href != null && this.href != "") {
          window.location.href = this.href
        }

        else if (this.onClick) {
          this.onClick ()
        }
      },
      toggleBtnText() {
        this.show_login_text = !this.show_login_text
      },
      fadeOut() {
        this.fade_out = true
      },
      fadeIn() {
        this.fade_in = true
      }
    }
  }
</script>

<style lang="scss" scoped>

.venue-btn {
  padding: 10px 20px;
  font-weight: 600;
  border: 4px solid #47C4FC;
  cursor: pointer;
  transition: background-color 0.25s;

  &:hover {
    background-color: #47C4FC;
  }
}

.dark-mode {

  .venue-btn {
    background-color: #121419;
    // color: white;
    color: #47C4FC;

    &:hover {
      background-color: #47C4FC;
      color: white;
    }
  }
}

.light-mode {

  .venue-btn {
    background-color: white;
    // color: black;
    color: #46b0e0;

    &:hover {
      background-color: #47C4FC;
      color: white;
    }
  }
}

</style>
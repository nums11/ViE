<template>
  <div class="signup-button">
    <router-link :to="{name: 'signup'}">
      <div :class="'signup-button-container ' +
      (size === 'small' ? 'small ' : 'large ') +
      (wide ? 'wide ' : '') +
      (color === 'blue' ? 'blue ' : '') +
      (color === 'pink' ? 'pink ' : '') +
      (invert_colors ? 'invert-colors ' : '')">
        {{ text }}
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'SignupButton',
  props: {
    text: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    invert_colors: {
      type: Boolean,
      default: false
    },
    wide: {
      type: Boolean,
      default: false
    },
  },
  data(){
    return {
    }
  },
  created() {
    console.log("Wide", this.wide)
  },
  methods: {

  }
}
</script>

<style lang="css" scoped>
.signup-button {
  display: inline-block;
}

.signup-button-container {
  border-radius: 3px;
  text-align: center;
  -webkit-transition: background-color 0.15s, color 0.15s linear;
  -ms-transition: background-color 0.15s, color 0.15s linear;
  transition: background-color 0.15s, color 0.15s linear;
}

.blue {
  border: #00B3FF solid;
  color: #00B3FF;
}

.blue.invert-colors {
  background-color: #00B3FF;
  color: white;
}

.pink {
  border: #e83e8c solid;
  color: #e83e8c;
}

.pink.invert-colors {
  background-color: #e83e8c;
  color: white;
}

.small {
  height: 2.15rem;
  width: 6rem;
  font-size: 1.25rem;
  padding-top: 0.25rem;
}

.large {
  height: 3.5rem;
  width: 9rem;
  font-size: 2rem;
  padding-top: 0.8rem;
}

.wide {
  width: 14rem;
}

.signup-button-container:hover {
  color: white;
}

.signup-button-container.blue:hover {
  background-color: #00B3FF;
}

.signup-button-container.pink:hover {
  background-color: #e83e8c;
}

.signup-button-container.invert-colors:hover {
  background-color: white;
}

.signup-button-container.blue.invert-colors:hover {
  color: #00B3FF;
}

.signup-button-container.pink.invert-colors:hover {
  color: #e83e8c;
}
</style>
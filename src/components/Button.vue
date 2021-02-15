<template>
  <div class="signup-button">
    <router-link :to="{name: route_name,
      params: route_params}"
    :style="disabled ? 'cursor:auto' : ''">
      <div :class="'signup-button-container ' +
      `${size} ` +
      (wide ? 'wide ' : '') +
      (color === 'blue' ? 'blue ' : '') +
      (color === 'pink' ? 'pink ' : '') +
      (invert_colors ? 'invert-colors ' : '') +
      (disabled ? 'disabled ' : '')">
        {{ text }}
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'SignupButton',
  props: {
    route_name:{
     type: String,
     default: ''
    },
    route_params: {
      type: Object,
      default: null
    },
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
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
    }
  },
  created() {
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

.extra-small {
  width: 6rem;
  font-size: 1rem;
  height: 1.85rem;
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

.signup-button-container.disabled,
.signup-button-container.disabled.blue.invert-colors:hover {
  background-color: #dbdbdb;
  border: #dbdbdb solid;
  color: white;
}

/*.signup-button-container.disabled:hover {
  bac
}*/
</style>
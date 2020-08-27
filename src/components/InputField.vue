<template>
  <div class="input-field-container">
    <div class="input-field">
      <div class="input-label"><label class="input-field-label" :id="label+'-label'">{{label}}</label></div>
      <input v-on:keyup="change" v-on:change="change" v-model="input_value" :type="type" :aria-labelledby="label+'-label'">
    </div>
  </div>
</template>

<script>
  export default {
    name: 'InputField',
    props: {
      change: {
        type: Function,
        default: () => {}
      },
      type: {
        type: String,
        default: "text"
      },
      label: {
        type: String,
        default: "<empty>"
      },
    },
    data() {
      return {
        input_value: ""
      }
    },
    methods: {
      emitInputValue() {
        this.$emit('set-input-value', this.input_value)
      }
    }
  }
</script>

<style lang="scss">
.input-field-label {
  margin: 0;
}

/* InputField Styles */
.input-field-container {
  position: relative;
  padding: 20px 0px;
}

.input-field-container .input-field {
  width: 60%;
  margin: 0 auto;
  position: relative;
}

.input-field-container .input-label {
  position: absolute;
  font-size: 12px;
  padding: 0px 8px;
  top: -10px;
  left: 5px;
  color: rgba(0, 0, 0, 0.6);
  z-index: 2;
}

.input-field-container .input-field input {
  width: 100%;
  height: 35px;
  line-height: 35px;
  padding: 0px 15px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #D2D2D2;
  color: rgba(0, 0, 0, 0.7);
  background-color: #FCFEFF;
  transition: all 0.25s;
}

.input-field-container .input-field input:focus {
  border: 1px solid #919191;
  color: rgba(0, 0, 0, 0.85);
}

.dark-mode {

  .input-field-container {

    .input-label {
      background-color: #121419;
    }

    .input-field {
      input {
        border: 1px solid white;
        background-color: #121419;
        color: white;
        opacity: 0.7;
        transition: opacity 0.3s;

        &:focus {
          opacity: 1;
        }
      }
    }
  }
}

.light-mode {

  .input-field-container {

    .input-label {
      background-color: white;
    }

    .input-field {
      input {
        border: 1px solid #121419;
        background-color: white;
        color: #121419;
      }
    }
  }
}
</style>

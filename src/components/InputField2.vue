<template>
  
  <div 
    :class="`venue-input-field-2 ${input_focused ? 'focus' : 'unfocus'} ${statusBad () ? 'bad' : ''}`"
    :style="{
      width: getWidth(),
      minWidth: getMinWidth ()
    }"  
  >

    <!-- STATUS BUBBLE -->
    <transition name="fade" mode="out-in">
      <div v-if="input_focused && statusBad()" :class="`status-bubble ${statusBad() ? 'bad' : ''}`">
        <div class="message-label">ERROR</div>
        {{ bad_status_message }}
      </div>
    </transition>

    <!-- INPUT COMPONENTS -->

    <div :class="`icon-area ${input_focused ? 'focus' : 'unfocus'} ${statusBad () ? 'bad' : ''}`" v-if="hasIcon()"><i :class="`icon ${config.icon}`"></i></div>
    <div :class="`input-field-area ${hasIcon() ? '' : 'left-spacing'}`" @click="forceFocus">

      <div :class="`input-label ${input_focus_persist ? 'focus' : 'unfocus'}  ${statusBad () ? 'bad' : ''}`" @click="forceFocus">
        {{ getLabel() }}
      </div>
      <div class="input-field">
        <input
          ref="inputArea"
          v-on:keydown.tab="(e) => { if (tabDisabled ())  disableTab(e) }"
          v-on:keydown.enter="onEnter"
          @focus="inputFocus"
          @blur="inputBlur"
          :type="getInputType()"
          @input="updateInputValue($event.target.value)"
          :id="id"
        />
      </div>

    </div>
    <transition name="fade" mode="out-in">
      <div class="status-area" v-if="!statusGood ()"  @click="forceFocus">
        <div :class="`status-indicator ${statusBad () ? 'bad' : ''}`"  @click="forceFocus">
          <i v-if="statusBad()" class="icon exclamation"></i>
        </div>
      </div>
    </transition>
  </div>

</template>
<script>
export default {
  name: 'InputField2',
  props: {
    config: Object,
    value: String,
    validate: Object,
    id: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      input_focused: false,
      input_focus_persist: false,
      input_status: "good", // "good", "bad", "caution"
      bad_status_message: ""
    }
  },
  methods: {
    onEnter (e) {
      if (this.hasKey(this.config, 'onenter')) {
        this.config.onenter ()
      }
    },
    tabDisabled () {
      if (this.hasKey(this.config, 'tabDisabled')) {
        return this.config.tabDisabled
      }
      return false
    },
    focus () {
      this.$refs.inputArea.focus ()
    },
    disableTab (e) {
      e.preventDefault ()
    },
    forceFocus () {
      this.$refs.inputArea.focus ()
    },
    inputFocus () {
      this.input_focused = true
      this.input_focus_persist = true
    },
    inputBlur (e) {
      this.input_focused = false
      if (e.target.value.length == 0) this.input_focus_persist = false
    },
    getWidth () {
      if (this.hasKey(this.config, 'width')) return this.config.width
      return '300px'
    },
    updateInputValue (val) {
      this.$emit('input', val)

      // validate input
      if (this.validate) {
        let validators = Object.keys(this.validate)
        let input_valid = true

        for (let i = 0; i < validators.length; ++i) {
          let result = this.validate[ validators[i] ]( val )
          if (!result[0]) {
            input_valid = false
            this.input_status = "bad"
            this.bad_status_message = result[1]
            break;
          }
        }

        if (input_valid) this.input_status = "good"
      }
    },
    statusGood () {
      return this.input_status == "good"
    },
    statusBad () {
      return this.input_status == "bad"
    },
    statusCaution () {
      return this.input_status == "caution"
    },
    getInputType () {
      if (this.hasKey(this.config, 'type')) return this.config.type
      return 'text'
    },
    getMinWidth () {
      if (this.hasKey(this.config, 'minWidth')) return this.config.minWidth
      return '300px'
    },
    getLabel () {
      if (this.hasKey(this.config, 'label')) return this.config.label.toUpperCase()
      return 'unlabeled'.toUpperCase()
    },
    hasKey (a, b) {
      if (!a) return false
      return Object.prototype.hasOwnProperty.call(a, b)
    },
    hasIcon () {
      return this.hasKey(this.config, 'icon')
    }
  }
}
</script>
<style lang="scss">

  .venue-input-field-2 {
    border: 2px solid #47C4FC;
    display: flex;
    height: 55px;
    border-radius: 5px;
    align-items: center;
    margin-bottom: 15px;
    transition: border 0.25s;
    position: relative;

    &.focus {
      border: 2px solid #268ebd;
    }
    
    &.unfocus {
      border: 2px solid #47C4FC;
    }

    &.bad {
      border: 2px solid #FF5E5E !important;
    }

    .icon-area {
      width: 45px;
      min-width: 45px;
      line-height: 45px;
      height: 45px;
      text-align: center;
      font-size: 1.3rem;
      transition: color 0.25s;

      &.focus {
        color: #268ebd;
      }

      &.unfocus {
        color: #47C4FC;
      }
      &.bad {
        color: #FF5E5E !important;
      }
    }

    .input-field-area {
      position: relative;
      height: 100%;
      flex-grow: 1;

      &.left-spacing {
        margin-left: 10px;
      }

      .input-label {
        position: absolute;
        font-size: 1rem;
        line-height: 17px;
        height: 15px;
        transition: transform 0.25s, color 0.25s;
        z-index: 3;
        top: 50%;
        left: 0px;
        transform-origin: center left;
        font-weight: 600;

        &.focus {
          transform: translateY(-18px) scale(0.6);
          color: #268ebd;
        }

        &.unfocus {
          transform: translateY(-50%) scale(0.8);
          color: #47C4FC;
        }

        &.bad {
          color: #FF5E5E !important;
        }
      }

      .input-field {
        height: 100%;
        position: relative;

        input {
          height: 65%;
          width: 100%;
          box-sizing: border-box;
          position: absolute;
          z-index: 1;
          bottom: 3px;
          left: 0;
          right: 0;
          border: none;
          background-color: rgba(0, 0, 0, 0);
          font-size: 0.9rem;
          font-weight: 600;
          padding: 0;
          outline: none;
        }
        input[type=password] {
          letter-spacing: 2px;
        }
        input[type=text] {
          letter-spacing: 1.2px;
        }
      }
    }

    .status-bubble {
      position: absolute;
      bottom: 60px;
      padding: 5px 10px;
      z-index: 10;
      border-radius: 5px;
      left: 0;
      right: 0;
      font-size: 0.9rem;

      &::before {
        content: '';
        position: absolute;
        z-index: 9;
        
        border-left: 7px solid rgba(0, 0, 0, 0);
        border-right: 7px solid rgba(0, 0, 0, 0);
        border-top: 10px solid purple;
        border-bottom: 10px solid rgba(0, 0, 0, 0);
        bottom: -16px;
        right: 20px;
      }

      .message-label {
        font-size: 0.8rem;
        transform: translateY(5px);
        opacity: 0.8;
      }
      
      &.bad {
        background-color: #FF5E5E;
        color: white;
        box-shadow: 0px 3px 5px rgba(255, 212, 212, 0.8);

        &::before {
          border-top: 10px solid #FF5E5E;
        }
      }
    }

    .status-area {
      width: 55px;
      height: 55px;
      min-width: 55px;
      text-align: center;
      display: flex;
      align-items: center;

      .status-indicator {
        cursor: pointer;
        width: 47px;
        height: 44px;
        line-height: 44px;
        color: white;
        font-size: 1rem;
        background-color: black;
        border-radius: 4px;
        position: relative;
        border: none;
        display: inline-block;
        left: 3px;

        &.bad {
          background-color: #FF5E5E;
        }
      }
    }
  }

</style>
<template>

  <div 
    :class="`venue-button-2 ${valid ? getColor() : 'venue-red'} ${disabled ? 'disabled' : ''}`" 
    @click="handleClick"
    :style="{
      width: getWidth(),
      height: getHeight(),
      lineHeight: getLineHeight()
    }">
    <div v-if="iconOnly()" class="icon-button-container">
      <i :class="`icon ${hasIcon () ? config.icon : ''}`"></i>
    </div>
    <div v-else class="button-container">
      <div class="icon-area left" v-if="hasIcon() && iconLeft()">
        <i :class="`icon ${config.icon}`"></i>
      </div>
      <div class="text-area" :style="{transform: `translateY(${ getLineHeight() })`}">
        {{ text }}
      </div>
      <div class="icon-area right" v-if="hasIcon() && iconRight()">
        <i :class="`icon ${config.icon}`"></i>
      </div>
    </div>
  </div>

</template>
<script>
export default {
  name: 'Button2',
  props: {
    text: String,
    config: Object,
    disabled: {
      type: Boolean,
      default: false
    },
    valid: {
      type: Boolean,
      default: true
    },
    onClick: Function
  },
  methods: {
    handleClick () {
      if (this.onClick && !this.disabled) this.onClick ()
    },
    getHeight () {
      if (this.hasKey(this.config, 'height')) return this.config.height
      return '40px'
    },
    getLineHeight () {
      if (this.hasKey(this.config, 'lineHeight')) return this.config.lineHeight
      return 'inherit'
    },
    getWidth () {
      if (this.hasKey(this.config, 'width')) return this.config.width
      return 'inherit'
    },
    getColor () {
      if (this.hasColor()) return this.config.color
      return 'venue-blue'
    },
    hasColor () {
      return this.hasKey(this.config, 'color')
    },
    hasIcon () {
      return this.hasKey(this.config, 'icon')
    },
    iconOnly () {
      if (this.hasKey(this.config, 'iconOnly')) return this.config.iconOnly
      return false
    },
    hasKey (a, b) {
      if (!a) return false
      return Object.prototype.hasOwnProperty.call(a, b)
    },
    iconLeft () {
      if (!this.hasKey(this.config, 'iconSide')) return true
      return this.config.iconSide == 'left'
    },
    iconRight () {
      if (!this.hasKey(this.config, 'iconSide')) return false
      return this.config.iconSide == 'right'
    }
  }
}
</script>
<style lang="scss">

.venue-button-2 {
  display: inline-block;
  height: 40px;
  border-radius: 5px;
  box-sizing: border-box;
  padding: 0;
  color: white;
  cursor: pointer;
  transition: transform 0.25s;
  vertical-align: top;

  &:active {
    transform: scale(0.95);
  }
  
  &.disabled {
    opacity: 0.7;
    cursor: not-allowed;

    &:active {
      transform: scale(1);
    }
  }

  .icon-button-container {
    text-align: center;
    line-height: 40px;
  }

  .button-container {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 13px;
    font-weight: 600;
    position: relative;

    .icon-area {
      width: 25%;
      min-width: 20%;
      text-align: center;
      position: absolute;

      &.left {
        left: 0;
      }
      &.right {
        right: 0;
      }
    }
    .text-area {
      text-align: center;
      width: 100%;
      font-weight: 600;
    }
  }
}

</style>
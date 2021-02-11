<template>
  <div @click="selectButton"
  class="quiz-radio-button light-border-shadow"
  :id="`quiz-radio-button-${index}`">
    <div class="circle inline-block"></div>
    <div class="answer inline-block">
      {{ answer }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizRadioButton',
  props: {
    answer: {
      type: String,
      required: true
    },
    index: {
      type: Number,
      required: true
    }
  },
  components: {
  },
  data(){
    return {

    }
  },
  created() {
  },
  methods: {
    selectButton() {
      this.$emit('select-answer-choice', this.index)
      document.querySelectorAll('.quiz-radio-button').forEach(
        el => {
          el.classList.remove('selected-button')
          el.firstElementChild.classList.remove('selected-button')
      })
      this.addClass('selected-button')
    },
    highlightButton(is_green) {
      const class_name = is_green ?
      'green-button' : 'red-button'
      this.removeClass('selected-button')
      this.addClass(class_name)
    },
    addClass(class_name) {
      const button = document.getElementById(
        `quiz-radio-button-${this.index}`)
      button.classList.add(class_name)
      button.firstElementChild.classList.add(class_name)
    },
    removeClass(class_name) {
      const button = document.getElementById(
        `quiz-radio-button-${this.index}`)
      button.classList.remove(class_name)
      button.firstElementChild.classList.remove(class_name)
    }
  }
}
</script>

<style scoped>
.quiz-radio-button {
  width: 35rem;
  min-height: 4rem;
  max-height: 8rem;
  margin: auto;
  margin-top: 2rem;
  border-radius: 3px;
  padding-top: 1rem;
  padding-left: 1rem;
  padding-right: 1rem;
  cursor: pointer;
  -webkit-transition: border-color 0.15s, color 0.15s linear;
  -ms-transition: border-color 0.15s, color 0.15s linear;
  transition: border-color 0.15s, color 0.15s linear;
}

.quiz-radio-button:hover {
  border-color: #00B3FF;
  color: #00B3FF;
}

.circle {
  border: #c7c7c7 solid thin;
  height: 2rem;
  width: 2rem;
  border-radius: 100%;
}

.answer {
  /*border: red solid;*/
  font-size: 1.2rem;
  margin-left: 1.5rem;
  vertical-align: center;
  margin-top: 0.25rem;
}

.selected-button {
  border: #00B3FF solid;
  color: #00B3FF;
  font-weight: bold;
}

.green-button {
  color: #00b80c;
  border-color: #00b80c;
}

.red-button {
  color: #FF0000;
  border-color: #FF0000;
}

/* Phones */
@media (max-width: 744px) {
  .quiz-radio-button {
    width: 90%;
    min-height: 3.5rem;
    padding-top: 0.8rem;
  }
  .circle {
    height: 1.5rem;
    width: 1.5rem;
  }
  .answer {
    font-size: 1rem;
    margin-top: 0.1rem;
  }

}
</style>

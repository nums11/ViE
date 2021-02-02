<template>
  <div>
    <div v-for="(question, index) in questions"
    class="question-time">
      <li style="color:#00B3FF;">
        <span style="color: black;font-weight: bold;">
          {{ formatted_question_timestamps[index] }}
        </span>
        <sui-button
        @click="$emit('show-quiz-question-unrestricted',
        question)"
        animated size="mini"
        style="background-color:#00B3FF; color:white;
        margin-left: 2rem;"
        :disabled="!unrestricted_mode" >
          <sui-button-content visible>
            View Question
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="eye" />
          </sui-button-content>
        </sui-button>
      </li>
      <div v-if="index < questions.length-1"
      class="line"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuizQuestionTimeline",
  data() {
    return {
    }
  },
  props: {
    questions: {
      type: Array,
      required: true
    },
    formatted_question_timestamps: {
      type: Array,
      required: true
    },
    unrestricted_mode: {
      type: Boolean,
      required: true
    }
  },
  components: {
  },
  created() {
  },
  computed: {
  },
  methods: {

  }
};
</script>

<style scoped>
.question-time {
  width: 14rem;
  /*border: red solid;*/
  text-align: left;
  margin: auto;
}

.line {
  background-color: #00B3FF;
  width: 0.25rem;
  height: 3rem;
  margin-left: 0.05rem;
}
</style>
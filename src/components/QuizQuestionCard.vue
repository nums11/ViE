<template>
  <div class="quiz-question-card-container mt-1">
    <div class="inline-block timestamp">
      {{ question.video_timestamp }}
    </div>
    <div class="quiz-question-card inline-block
    light-border-shadow">
      <div class="question inline-block wrap-text">
        {{ question.question }}
      </div>
      <div class="float-right">
        <sui-button @click="$emit('remove-question')"
        animated size="mini"
        style="background-color:#FF0000; color:white;
        margin-top:0.2rem; margin-left: 0.5rem;">
          <sui-button-content visible>
            Remove
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="trash" />
          </sui-button-content>
        </sui-button>
      </div>
      <div class="divider float-right"></div>
      <div class="float-right">
        <sui-button
        animated size="mini"
        style="background-color:#00B3FF; color:white;
        margin-top:0.2rem;">
          <sui-button-content visible>
            Edit
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="edit outline" />
          </sui-button-content>
        </sui-button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'QuizQuestionCard',
  props: {
    question: {
      type: Object,
      required: true
    }
  },
  data () {
    return {

    }
  },
  components: {
  },
  computed: {

  },
  created () {
  },
  methods: {

  }
}
</script>

<style scoped>
.timestamp {
  margin-top: 0.5rem;
}

.quiz-question-card {
  border-radius: 3px;
  height: 2.5rem;
  width: 85%;
  margin-left: 1rem;
  text-align: left;
  padding-left: 1rem;
  padding-right: 0.25rem;
}

.question {
  width: 60%;
  margin-top: 0.35rem;
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  margin-top: 0.15rem;
}
</style>
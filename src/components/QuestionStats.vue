<template>
  <div>
    <div v-for="question in questions"
    class="mt-2 question-container light-border-shadow">
      <div class="question wrap-text">{{ question.question }}</div>
      <h4 class="navy-blue">
        Percentage of students who answered correctly
      </h4>
      <p class="percent">
        {{ question.percent_correct.toFixed(1) }}%
      </p>
      <sui-table celled>
        <sui-table-header>
          <sui-table-row>
            <sui-table-header-cell>
              Answer Choice
            </sui-table-header-cell>
            <sui-table-header-cell>
              Percentage of students who chose this answer
            </sui-table-header-cell>
          </sui-table-row>
        </sui-table-header>
        <sui-table-body>
          <sui-table-row
          v-for="(choice,index) in question.answer_choices"
          :positive="index === question.correct_answer_index"
          :negative="index !== question.correct_answer_index">
            <sui-table-cell>{{ choice }}</sui-table-cell>
            <sui-table-cell>
              {{ choice_percentages[index].toFixed(1) }} %
            </sui-table-cell>
          </sui-table-row>
        </sui-table-body>
      </sui-table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionStats',
  props: {
    questions: {
      type: Array,
      required: true
    },
    submissions: {
      type: Array,
      required: true
    }
  },
  components: {
  },
  data () {
    return {
      choice_percentages: []
    }
  },
  created() {
    this.calculatePercentages()
  },
  methods: {
    calculatePercentages() {
      let num_submissions = this.submissions.length 
      for(let i = 0; i < this.questions.length; i++) {
        let question = this.questions[i]
        let num_correct = 0
        if(num_submissions === 0) {
          this.questions[i].percent_correct = 0
          question.answer_choices.forEach(choice => {
            choice.percent_chosen = 0
          })
        } else {
          let choice_frequencies =
            new Array(question.answer_choices.length).fill(0)
          this.submissions.forEach(submission => {
            let choice_index = submission.quiz_answer_indices[i]
            if(choice_index === question.correct_answer_index)
              num_correct++
            choice_frequencies[choice_index]++
          })
          this.questions[i].percent_correct =
            (num_correct / num_submissions) * 100
          for(let j = 0; j < question.answer_choices.length; j++) {
            this.choice_percentages.push(
              (choice_frequencies[j] / num_submissions) * 100)
          }
        }

      }
    }
  }
}
</script>

<style scoped>
.question-container {
  padding: 1rem;
}

.question {
  width: 80%;
  margin: auto;
  font-size: 1.2rem;
}

.percent {
  font-weight: bold;
  color: #00B3FF;
  font-size: 5rem;
  margin-bottom: 0;
}
</style>
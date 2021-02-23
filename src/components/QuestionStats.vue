<template>
  <div class="center-text">
    <div v-for="(question,question_index) in questions"
    class="mt-2 question-container light-border-shadow">
      <div class="question wrap-text">{{ question.question }}</div>
      <Metric class="mt-1"
      header="Percentage of students who answered correctly"
      :percentage="question.percent_correct.toFixed(1)"
      size="small" />
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
          v-for="(choice,choice_index) in question.answer_choices"
          :positive="question.correct_answer_indices.includes(choice_index)"
          :negative="!question.correct_answer_indices.includes(choice_index)">
            <sui-table-cell>{{ choice }}</sui-table-cell>
            <sui-table-cell>
              {{ choice_percentages[question_index][
                  choice_index].toFixed(1) }} %
            </sui-table-cell>
          </sui-table-row>
        </sui-table-body>
      </sui-table>
    </div>
  </div>
</template>

<script>
import Metric from '@/components/Metric'
import helpers from '@/helpers'

export default {
  name: 'QuestionStats',
  mixins: [helpers],
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
    Metric
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
      const num_submissions = this.submissions.length 
      for(let i = 0; i < this.questions.length; i++) {
        const question = this.questions[i]
        let num_correct = 0
        if(num_submissions === 0) {
          this.questions[i].percent_correct = 0
          this.choice_percentages.push([])
          question.answer_choices.forEach(choice => {
            this.choice_percentages[i].push(0)
          })
        } else {
          const choice_frequencies =
            new Array(question.answer_choices.length).fill(0)
          this.submissions.forEach(submission => {
            const selected_indices = submission.quiz_answer_indices[i]
            if(this.userWasCorrect(selected_indices,
              question.correct_answer_indices))
              num_correct++
            selected_indices.forEach(index => {
              choice_frequencies[index]++
            })
          })
          this.questions[i].percent_correct =
            (num_correct / num_submissions) * 100
          this.choice_percentages.push([])
          for(let j = 0; j < question.answer_choices.length; j++) {
            this.choice_percentages[i].push(
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
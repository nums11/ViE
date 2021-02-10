<template>
  <div>
    <div id="btn-area">
      <sui-button content="Previous Question"
      icon="arrow left"
      label-position="left"
      style="background-color:#00B3FF; color:white;" />
      <sui-button content="Next Question"
      icon="arrow right"
      label-position="right"
      class="float-right"
      style="background-color:#00b80c; color: white;" />
    </div>
    <div id="logo-container">
      <img src="@/assets/logo.svg" id="logo" />
    </div>
    <div class="center-text" id="question">
      Which astronmer was the first to complete
      this random thing that I didn't know existed
      and now I'm just going to make this longer for no
      reason?
    </div>
    <div class="center-text wrap-text" id="submissions">
      Submissions
      <p id="num-submissions">10/20 (50%)</p>
    </div>
    <BarChart :chart_data="chart_data"
    :chart_options="chart_options"
    :style="chart_styles" />
    <div class="mt-1 float-right" id="stop-quiz-btn">
      <Button text="Stop Quiz" color="pink" size="small"
      wide />
    </div>
  </div>
</template>

<script>
import BarChart from '@/components/BarChart'
import Button from '@/components/Button'

export default {
  name: 'RealTimeQuiz',
  components: {
    BarChart,
    Button
  },
  data(){
    return {
      quiz_id: "",
      chart_data: {
        label: "hello",
        labels: ['Option 1', 'Option 2', 'Option 3',
          'Option 4', 'Option 5', 'Option 6'],
        datasets: [{
          // backgroundColor: ['#e83e8c', '#00B3FF', '#00b80c',
          //   '#ffac26', '#8000ff', '#00ffe1'],
          backgroundColor: ['rgba(232, 62, 140, 0.65)',
          'rgba(0, 179, 255, 0.65)', 'rgba(0, 184, 12, 0.65)',
            'rgba(255, 172, 38, 0.65)', 'rgba(128, 0, 255, 0.65)',
            'rgba(0, 255, 225, 0.65)'],
          borderWidth: 3,
          data: [10, 20, 30, 40, 50, 60],
        }]
      },
      chart_options: {
        legend: {display: false},
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            }
          }]
        }
      },
      chart_styles: {
        width: '90%',
        height: '25rem',
        margin: 'auto',
        'margin-top': '1rem'
      }
    }
  },
  created() {
    this.quiz_id = this.$route.params.quiz_id
  },
  methods: {

  }
}
</script>

<style scoped>
#btn-area {
  /*border: black solid;*/
  padding-top: 1rem;
  padding-right: 2rem;
  padding-left: 2rem;
}

#logo-container {
  /*border: red solid;*/
  width: 4rem;
  /*display: inline-block;*/
  margin: auto;
}

#logo {
  height: 4rem;
  display: inline-block;
  /*border: blue solid;*/
  margin: auto;
}

#question {
  /*border: blue solid;*/
  height: 8rem;
  line-height: 4rem;
  width: 90%;
  margin: auto;
  margin-top: 1rem;
  font-weight: bold;
  font-size: 2rem;
  color: #2c3e50;
}

#submissions {
  margin: auto;
  margin-top: 1rem;
  /*border: blue solid;*/
  font-size: 1.3rem;
}

#num-submissions {
  /*border: red solid;*/
  margin-top: 0.75rem;
  font-weight: bold;
  color: #2c3e50;
}

#stop-quiz-btn {
  margin-right: 5rem;
}
</style>

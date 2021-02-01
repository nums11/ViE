<template>
  <div class="question-card light-border-shadow">
    <div class="question">What is the center of the universe?</div>
    <sui-form id="answer-form">
      <div class="mt-3 answer-container">
        <div class="mt-1">
          <sui-form-field>
            <sui-checkbox radio label="42" />
          </sui-form-field>
        </div>
        <div class="mt-1">
          <sui-form-field>
            <sui-checkbox radio label="21" />
          </sui-form-field>
        </div>
        <div class="mt-1">
          <sui-form-field>
            <sui-checkbox radio label="53" />
          </sui-form-field>
        </div>
        <div class="mt-1">
          <sui-form-field>
            <sui-checkbox radio label="65" />
          </sui-form-field>
        </div>
      </div>
      <div class="btn-container">
        <Button text="Submit" size="small" color="blue" />
      </div>
    </sui-form>
  </div>
</template>

<script>
import Button from '@/components/Button'

export default {
  name: "WatchVideo",
  data() {
    return {

    }
  },
  components: {
    Button
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
.question-card {
  width: 90%;
  border-radius: 3px;
  margin: auto;
  height: 25rem;
  padding: 2rem 1rem;
  overflow-y: auto;
}

.question {
  /*border: black solid;*/
  font-size: 1.25rem;
}

#answer-form {
  width: 80%;
  text-align: left;
}

.answer-container {
  /*border: red solid;*/
  height: 11rem;
}

.answer {
  /*border: red solid;*/
}

.btn-container {
  /*border: blue solid;*/
  width: 6rem;
  margin: auto;
  margin-top: 3rem;

}
</style>
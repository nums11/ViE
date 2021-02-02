<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Add Quiz
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
      <div class="inline-block" id="left-side">
        <VideoPreview v-if="show_video_preview"
        :video_source="video_source"
        ref="VideoPreview"
        v-on:created-player="assignPlayer" />
        <h3>Questions ({{ questions.length }})</h3>
        <NewQuizQuestionCard v-for="(question,index) in questions"
        :question="question"
        v-on:remove-question="removeQuestion(index)" />
      </div>
      <div v-if="video_player != null"
      class="inline-block" id="right-side">
        <h3>Add Question</h3>
        <sui-form id="question-form">
          <sui-form-field>
            <p>
              Set the video to the timestamp that you want this
              question to appear at.
            </p>
            <label class="form-label">Timestamp</label>
            <input type="number" min="0" id="timestamp-input" 
            :max="video_player.duration"
            :value="Math.floor(video_player.currentTime())" disabled />
          </sui-form-field>
          <sui-form-field>
            <label class="form-label">Question</label>
            <textarea v-model="question.question" id="question-input"
            placeholder="Type your question here" />
          </sui-form-field>
          <sui-form-field
            v-for="(choice,index) in question.answer_choices">
            <label class="float-left" style="margin-left:2rem;">
              Choice {{ index + 1 }}
            </label>
            <sui-icon v-if="question.answer_choices.length > 2"
            @click="removeChoice(index)" name="x" class="float-right pointer"
            style="margin-right:1rem;" />
            <sui-form-field>
              <sui-popup content="Mark this choice as the correct answer"
              position="top center" inverted>
                <sui-checkbox :value="index.toString()"
                @click="markCorrect(index)"
                name="correct_answer_index"
                radio slot="trigger"
                style="float:left; margin-top:0.65rem;"/>
              </sui-popup>
              <textarea v-model="choice.text" style="width:85%;height: 3rem;" 
              placeholder="Type your choice here"  />
            </sui-form-field>
          </sui-form-field>
          <p @click="addChoice" id="add-choice">
            + Add another answer choice
          </p>
          <p v-if="questionInputsFilled && disableSaveQuestionBtn"
          id="warning-msg">
            <sui-icon name="exclamation triangle" size="small" />
            You must select at least 1 correct answer
          </p>
          <div class="mt-2">
            <sui-button @click.prevent="clearQuestion">Clear</sui-button>
            <sui-button @click.prevent="saveQuestion"
            :disabled="disableSaveQuestionBtn"
            style="background-color:#00B3FF;
            color:white; margin-left:2rem;">
              Save Question
            </sui-button>
          </div>
        </sui-form>
      </div>
    </sui-modal-content>
    <sui-modal-actions>
      <div id="action-btns-container">
        <sui-button @click="cancelQuiz">Cancel</sui-button>
        <sui-button @click="saveQuiz"
        :disabled="disableSaveQuizBtn"
        style="background-color:#00b80c;
        color:white; margin-left:2rem;">
          Save Quiz
        </sui-button>
      </div>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import VideoPreview from '@/components/VideoPreview'
import NewQuizQuestionCard from '@/components/NewQuizQuestionCard'

export default {
  name: 'AddQuizModal',
  data () {
    return {
      show_modal: false,
      show_video_preview: false,
      video_source: null,
      questions: [],
      question: {
        question: "",
        answer_choices: [
          {text: ""},
          {text: ""}
        ],
        correct_answer_index: null,
        video_timestamp: 0
      },
      player_created: false,
      video_player: null
    }
  },
  components: {
    VideoPreview,
    NewQuizQuestionCard
  },
  computed: {
    questionInputsFilled() {
      if(this.question.question.length === 0)
        return false
      const answer_choices = this.question.answer_choices
      for(let i =0; i < answer_choices.length; i++) {
        if(answer_choices[i].text.length === 0) {
          return false
        }
      }
      return true
    },
    disableSaveQuestionBtn() {
      return !this.questionInputsFilled ||
      this.question.correct_answer_index == null
    },
    disableSaveQuizBtn() {
      return this.questions.length === 0
    }
  },
  created () {
  },
  methods: {
    showModal(video_file) {
      this.video_source = {
        src: URL.createObjectURL(video_file),
        type: "video/mp4"
      }
      this.show_modal = true
      this.show_video_preview = true
    },
    cancelQuiz() {
      this.show_video_preview = false
      this.video_player = null
      this.video_source = null
      this.clearQuestion()
      this.questions = []
      this.show_modal = false
    },
    addChoice() {
      this.question.answer_choices.push({
        text: ""
      })
    },
    removeChoice(index) {
      this.question.answer_choices.splice(index, 1)
    },
    assignPlayer(player) {
      this.video_player = player
    },
    markCorrect(index) {
      this.question.correct_answer_index = index
    },
    clearQuestion() {
      this.question = {
        question: "",
        answer_choices: [
          {text: ""},
          {text: ""}
        ],
        correct_answer_index: null,
        video_timestamp: 0
      }
      document.querySelector(
        'input[name="correct_answer_index"]:checked').checked = false;
    },
    saveQuestion() {
      this.question.video_timestamp =
        document.getElementById('timestamp-input').value
      this.questions.push(this.question)
      this.questions.sort(this.questionCompare)
      this.clearQuestion()
    },
    questionCompare(a,b) {
      if ( a.video_timestamp < b.video_timestamp ){
        return -1;
      }
      if ( a.video_timestamp > b.video_timestamp ){
        return 1;
      }
      return 0;
    },
    saveQuiz() {
      this.$emit('save-quiz', this.questions)
      this.cancelQuiz()
    },
    removeQuestion(index) {
      this.questions.splice(index, 1)
    }
  }
}
</script>

<style scoped>
#left-side {
  width: 60%;
}
#right-side {
  width: 40%;
}

#action-btns-container {
  width: 17rem;
  margin: auto;
}

#question-form {
  margin-top: 0;
  width: 100%;
  padding-right: 2rem;
  padding-left: 2rem;
}

#question-input {
  height: 6rem;
}

#add-choice {
  cursor: pointer;
  font-weight: bold;
  color: #a6a6a6;
}

#warning-msg {
  /*font-weight: bold;*/
  background-color: #fff4d3;
  border-radius: 2px;
  padding: 0;
  /*border: black solid;*/
}
</style>
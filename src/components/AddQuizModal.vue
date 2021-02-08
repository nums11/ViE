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
        <p class="mt-1">
          Use the left and right arrow keys to move
          through the video more precisely.
        </p>
        <h3>Questions ({{ questions.length }})</h3>
        <NewQuizQuestionCard v-for="(question,index) in questions"
        :question="question"
        v-on:remove-question="removeQuestion(index)" />
      </div>
      <div v-if="video_player != null"
      class="inline-block" id="right-side">
        <h3>Add Question</h3>
        <sui-form style="margin-top:0;width:100%;padding-right:2rem;
        padding-left:2rem;">
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
        </sui-form>
        <QuestionForm v-on:save-question="saveQuestion" />
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
import QuestionForm from '@/components/QuestionForm'

export default {
  name: 'AddQuizModal',
  data () {
    return {
      show_modal: false,
      show_video_preview: false,
      video_source: null,
      questions: [],
      player_created: false,
      video_player: null
    }
  },
  components: {
    VideoPreview,
    NewQuizQuestionCard,
    QuestionForm
  },
  computed: {
    disableSaveQuizBtn() {
      return this.questions.length === 0
    }
  },
  created () {
  },
  methods: {
    showModal(video_file, questions = null) {
      this.video_source = {
        src: URL.createObjectURL(video_file),
        type: "video/mp4"
      }
      this.show_modal = true
      this.show_video_preview = true
      if(questions != null) {
        this.questions = questions
        // Set Timeout to avoid undefined Video Preview
        let self = this
        setTimeout(function() {
          self.$refs.VideoPreview.addMarkers(
            self.questions)
        }, 500)
      }
    },
    cancelQuiz() {
      this.show_video_preview = false
      this.video_player = null
      this.video_source = null
      this.questions = []
      this.show_modal = false
    },
    assignPlayer(player) {
      this.video_player = player
    },
    saveQuestion(question) {
      question.video_timestamp =
        document.getElementById('timestamp-input').value
      this.questions.push(question)
      this.questions.sort(this.questionCompare)
      this.$refs.VideoPreview.addMarker(
        question.video_timestamp, question.question)
    },
    questionCompare(a,b) {
      const a_timestamp = parseInt(a.video_timestamp)
      const b_timestamp = parseInt(b.video_timestamp)
      if ( a_timestamp < b_timestamp ){
        return -1;
      }
      if ( a_timestamp > b_timestamp ){
        return 1;
      }
      return 0;
    },
    removeQuestion(index) {
      this.questions.splice(index, 1)
      this.$refs.VideoPreview.removeMarker(index)
    },
    saveQuiz() {
      this.$emit('save-quiz', this.questions)
      this.cancelQuiz()
    },
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
</style>
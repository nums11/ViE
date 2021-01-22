<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      {{ header }}
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text" style="padding-top: 0">
      <!-- Page 1 start -->
      <sui-form class="form" v-if="page == 1">
        <p>{{ time_window_text }}</p>
        <div class="form-field">
          <sui-form-field required>
            <label class="form-label">
              {{ start_label }}
            </label>
            <input
              v-model="start"
              @change="updatePropTime('start')"
              type="datetime-local"
            />
          </sui-form-field>
        </div>
        <div class="form-field">
          <sui-form-field required>
            <label class="form-label">
              {{ end_label }}
            </label>
            <input
              v-model="end"
              @change="updatePropTime('end')"
              type="datetime-local"
            />
          </sui-form-field>
        </div>
        <div id="radio-container">
          <p class="mb-2 mr-1">
            Choose the task type ({{ coming_soon_task }}
            coming soon).
          </p>
          <sui-form-fields inline>
            <sui-form-field>
              <div class="ui radio checkbox">
                <input
                  type="radio"
                  name="checked_value"
                  checked="checked"
                  id="cb-one"
                  @click="selectValue(1)"
                />
                <label for="cb-one">{{ radio_label_one }}</label>
              </div>
            </sui-form-field>
            <sui-form-field>
              <div class="ui radio checkbox">
                <input
                  type="radio"
                  name="checked_value"
                  id="cb-two"
                  @click="selectValue(2)"
                  disabled
                />
                <label for="cb-two">{{ radio_label_two }}</label>
              </div>
            </sui-form-field>
          </sui-form-fields>
        </div>
        <div class="form-field" v-if="is_real_time">
          <p class="mb-2">
            Optionally schedule a reminder to receive a notification for this
            task.
          </p>
          <sui-form-field>
            <label class="form-label">Schedule Reminder</label>
            <input v-model="task.reminder_time" type="datetime-local" />
          </sui-form-field>
        </div>
        <div class="form-field" v-else>
          <sui-form-field>
            <label class="form-label">Video Name</label>
            <input v-model="task.name" placeholder="Class Video" />
          </sui-form-field>
          <sui-form-field>
            <input @change="setVideoFile" type="file" id="file-input" />
          </sui-form-field>
        </div>
        <div class="form-field">
          <sui-button
            @click.prevent="nextPage"
            animated
            style="background-color: #00b80c; color: white"
          >
            <sui-button-content visible> Add Task </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="podcast" />
            </sui-button-content>
          </sui-button>
        </div>
      </sui-form>
      <!-- Page 1 end -->
      <!-- Page 2 start -->
      <div v-if="page == 2">
        <VideoJSWrapper ref="videoPlayer" :options="videoOptions" />
        <div v-if="this.task.quiz != null">
          <h1>Questions</h1>
          <div
            v-for="(question, index) in this.task.quiz.questions"
            v-bind:key="index + ' ' + question.question"
          >
            <p>{{ question.video_timestamp + " " + question.question }}</p>
            <sui-button
              v-if="!adding_question"
              @click="editQuestion(index)"
              style="background-color: #00b3ff; color: white"
            >
              <sui-button-content>
                <sui-icon name="edit" />
              </sui-button-content>
            </sui-button>
            <sui-button @click="deleteQuestion(index)" style="color: #00b3ff">
              <sui-button-content>
                <sui-icon name="cancel" />
              </sui-button-content>
            </sui-button>
          </div>
        </div>
        <sui-button
          v-if="!adding_question"
          @click="addQuestion"
          style="background-color: #00b3ff; color: white"
        >
          Add question
        </sui-button>
        <sui-form class="form" v-if="adding_question">
          <sui-form-field>
            <label class="form-label"> Timestamp </label>
            <!-- TODO: Figure out why it doesn't accept decimals -->
            <input
              type="number"
              steps="any"
              min="0"
              :max="this.$refs.videoPlayer.player.duration"
              :value="this.$refs.videoPlayer.player.currentTime()"
              v-on:change="(event) => updateCurrentTime(event.target.value)"
            />
          </sui-form-field>
          <div class="form-field">
            <sui-form-field required>
              <label class="form-label"> Question </label>
              <input v-model="quiz_question.question" />
            </sui-form-field>
            <sui-form-field required>
              <label class="form-label"> Options </label>
              <div
                v-for="(choice, index) in quiz_question.answer_choices"
                v-bind:key="index"
              >
                <input
                  type="radio"
                  :checked="index == quiz_question.correct_answer"
                  :id="'option-' + index"
                  @click="selectCorrectAnswer(index)"
                />
                <input v-model="quiz_question.answer_choices[index]" />
                <sui-button
                  v-if="quiz_question.answer_choices.length > 2"
                  @click="deleteOption(index)"
                  style="color: #00b3ff"
                >
                  <sui-button-content>
                    <sui-icon name="cancel" />
                  </sui-button-content>
                </sui-button>
              </div>
            </sui-form-field>
            <sui-button
              @click="addOption"
              style="background-color: #00b3ff; color: white"
            >
              <sui-button-content hidden>
                <sui-icon name="add" />
              </sui-button-content>
            </sui-button>
            <sui-button
              @click="finishAddQuestion"
              style="background-color: #00b3ff; color: white"
            >
              <sui-button-content hidden>
                <sui-icon name="check" />
              </sui-button-content>
            </sui-button>
          </div>
        </sui-form>
      </div>
      <!-- Page 2 end -->
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button
        v-if="hasPrevious"
        @click="previousPage"
        style="background-color: #00b3ff; color: white"
      >
        <sui-button-content hidden>
          <sui-icon name="left arrow" />
        </sui-button-content>
      </sui-button>
      <sui-button
        v-if="canFinish"
        @click="addTask"
        style="background-color: #00b3ff; color: white"
      >
        Finish
      </sui-button>
      <sui-button
        v-else
        @click="hideModal"
        style="background-color: #00b3ff; color: white"
      >
        Done
      </sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import VideoJSWrapper from "@/components/VideoJSWrapper.vue";
export default {
  name: "AddTaskModal",
  props: {
    real_time_portion: Object,
    async_portion: Object,
  },
  components: {
    VideoJSWrapper,
  },
  data() {
    return {
      show_modal: false,
      task: {
        reminder_time: null,
      },
      value: 1,
      is_real_time: Boolean,
      header: "",
      time_window_text: "",
      coming_soon_task: "",
      start_label: "",
      end_label: "",
      start_popup_text: "",
      end_popup_text: "",
      start: Date,
      end: Date,
      radio_label_one: "",
      radio_label_two: "",
      page: 1,
      player: null,
      adding_question: false,
      videoOptions: {
        autoplay: false,
        controls: true,
        fluid: true,
        sources: [{}],
      },
      quiz_question: null,
    };
  },
  computed: {
    isVideoTask() {
      return !this.is_real_time && this.value === 1;
    },
    hasNext() {
      return this.isVideoTask && this.page === 1;
    },
    hasPrevious() {
      return this.isVideoTask && this.page > 1;
    },
    canFinish() {
      return this.page === 2 && this.task.video_file != null;
    },
  },
  created() {
    this.is_real_time = this.real_time_portion != null;
    this.setLabelsAndDates();
  },
  methods: {
    setLabelsAndDates() {
      let label_prefix = "";
      if (this.is_real_time) {
        label_prefix = "Real-Time";
        this.time_window_text =
          "Choose the time window" +
          " for the real-time portion of your meeting";
        this.coming_soon_task = "quizzes";
        this.start = this.real_time_portion.real_time_start;
        this.end = this.real_time_portion.real_time_end;
        this.radio_label_one = "QR Scan";
        this.radio_label_two = "Quiz";
      } else {
        label_prefix = "Async";
        this.time_window_text =
          "Choose the time window" +
          " for which students will be able to submit" +
          " to async tasks";
        this.coming_soon_task = "links";
        this.start = this.async_portion.async_start;
        this.end = this.async_portion.async_end;
        this.radio_label_one = "Video";
        this.radio_label_two = "Link";
      }
      this.header = `Add ${label_prefix} Task`;
      this.start_label = `${label_prefix} start`;
      this.end_label = `${label_prefix} end`;
    },
    updatePropTime(time) {
      if (time === "start") {
        if (this.is_real_time)
          this.real_time_portion.real_time_start = this.start;
        else this.async_portion.async_start = this.start;
      } else {
        if (this.is_real_time) this.real_time_portion.real_time_end = this.end;
        else this.async_portion.async_end = this.end;
      }
    },
    setVideoFile(e) {
      // todo check if valid file extension
      this.task.video_file = e.target.files[0];
      this.videoOptions.sources = [
        { src: URL.createObjectURL(this.task.video_file), type: "video/mp4" },
      ];
    },
    selectValue(value) {
      this.value = value;
    },
    addTask() {
      if (this.task.quiz != null && this.task.quiz.questions.length == 0) {
        this.task.quiz = null;
      }
      this.$emit("add-task", this.task);
      this.hideModal();
    },
    showModal() {
      this.show_modal = true;
    },
    hideModal() {
      this.task = {
        reminder_time: null,
      };
      if (document.getElementById("file-input") != null) {
        document.getElementById("file-input").value = "";
      }
      this.page = 1;
      this.task.video_file = null;
      this.show_modal = false;
      this.adding_question = false;
      this.task = null;
    },
    nextPage() {
      if (!this.hasNext || this.task.video_file == null) {
        return;
      }
      if (this.canFinish) {
        this.addTask();
        return;
      }
      this.page++;
    },
    previousPage() {
      if (this.hasPrevious) {
        this.page--;
      }
    },
    addQuestion() {
      if (this.task.quiz == null) {
        this.task.quiz = { name: "Quiz", questions: [] };
      }
      this.adding_question = true;
      this.$refs.videoPlayer.player.pause();
      this.quiz_question = {
        question: "",
        answer_choices: ["", ""],
        correct_answer: 0,
        video_timestamp: this.$refs.videoPlayer.player.currentTime(),
      };
    },
    addOption() {
      this.quiz_question.answer_choices.push("");
    },
    deleteOption(index) {
      this.quiz_question.answer_choices.splice(index, 1);
      if (
        this.quiz_question.correct_answer >
        this.quiz_question.answer_choices.length - 1
      ) {
        this.quiz_question.correct_answer =
          this.quiz_question.answer_choices.length - 1;
      }
    },
    selectCorrectAnswer(value) {
      this.quiz_question.correct_answer = value;
    },
    finishAddQuestion() {
      this.quiz_question.video_timestamp = this.$refs.videoPlayer.player.currentTime();
      this.task.quiz.questions.push(this.quiz_question);
      this.task.quiz.questions.sort((a, b) =>
        a.video_timestamp > b.video_timestamp ? 1 : -1
      );
      this.quiz_question = null;
      this.adding_question = false;
    },
    updateCurrentTime(value) {
      if (this.$refs.videoPlayer.player.paused()) {
        this.$refs.videoPlayer.player.currentTime(value);
      }
    },
    editQuestion(index) {
      this.adding_question = true;
      this.quiz_question = this.task.quiz.questions[index];
      this.task.quiz.questions.splice(index, 1);
    },
    deleteQuestion(index) {
      this.task.quiz.questions.splice(index, 1);
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped>
#add-task-modal {
  margin-top: 2rem;
}
.form {
  /*border: black solid;*/
  /*width: 80%;*/
}

.date-input {
  margin-left: 1rem;
  margin-right: 1rem;
  width: 13rem;
}

#radio-container {
  width: 12rem;
  margin: auto;
  margin-top: 3rem;
}
</style>
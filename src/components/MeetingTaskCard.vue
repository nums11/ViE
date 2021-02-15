<template>
  <div class="meeting-task-card-container">
    <div class="meeting-task-card light-border-shadow">
      <div class="meeting-title wrap-text">
        {{ card_title }}
      </div>
      <div v-if="is_instructor" class="reminder-container inline-block">
        <div v-if="task_type === 'qr_scan'">
          {{ task.reminder_time == null ?
            'No Scheduled Reminder' :
            task.reminder_time | moment("M/D, h:mm a")
          }}
        </div>
        <div v-else-if="task_type === 'quiz'">
          {{ `${task.questions.length} questions` }}
        </div>
        <div v-else-if="task_type === 'video'">
          {{ task.quiz == null ?
            'No Quiz':
            `Quiz, ${task.quiz.questions.length} questions`
          }}
        </div>
      </div>
      <div class="divider" v-if="is_instructor"></div>
      <div class="btn-container">
        <sui-button v-if="task_type === 'qr_scan' && is_instructor"
        @click="$emit('show-qr')"
        animated size="mini"
        style="background-color:#00B3FF; color:white;">
          <sui-button-content visible>
            {{ first_button_text }}
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="qrcode" />
          </sui-button-content>
        </sui-button>
        <div v-else-if="task_type === 'quiz'">
          <router-link v-if="is_instructor ||
          (!is_instructor && window_is_open)"
          :to="{name: 'view_quiz',
          params: {meeting_id: meeting_id, 
            quiz_id: task._id}}">
            <sui-button
            animated size="mini"
            style="background-color:#00B3FF; color:white;">
              <sui-button-content visible>
                {{ first_button_text }}
              </sui-button-content>
              <sui-button-content hidden>
                  <sui-icon name="pencil alternate" />
              </sui-button-content>
            </sui-button>
          </router-link>
        </div>
        <div v-else-if="task_type === 'video'">
          <router-link v-if="is_instructor ||
          (!is_instructor && window_is_open)"
          :to="{name: 'watch_video',
          params: {meeting_id: meeting_id, 
            async_portion_id: portion._id,
            video_id: task._id}}">
            <sui-button animated size="mini"
            style="background-color:#00B3FF; color:white;">
              <sui-button-content visible>
                {{ first_button_text }}
              </sui-button-content>
              <sui-button-content hidden>
                  <sui-icon name="play circle outline" />
              </sui-button-content>
            </sui-button>
          </router-link>
        </div>
      </div>
      <div class="divider" v-if="is_instructor"></div>
      <div class="btn-container" v-if="is_instructor">
        <sui-button animated size="mini"
        @click="$emit('view-submissions')"
        style="background-color:#00B3FF; color:white;">
          <sui-button-content visible>
            View Submissions
          </sui-button-content>
          <sui-button-content hidden>
              <sui-icon name="arrow right" />
          </sui-button-content>
        </sui-button>
      </div>
      <div v-else class="student-submission-status inline-block">
        <div v-if="student_submitted">
          <div v-if="task_type === 'qr_scan'">
            Submission Recorded
            <sui-icon name="check" color="green" />
          </div>
          <div v-else-if="task_type === 'quiz'">
            {{ num_correct_answers }}/{{ num_quiz_questions }} correct
            ({{ ((num_correct_answers/
              num_quiz_questions) *100).toFixed(1) }}%)
          </div>
          <div v-else-if="task_type === 'video'">
            {{ percent_watched.toFixed(1) }}%
            watched<span v-if="task.quiz != null">, </span>
            <div v-if="task.quiz != null" class="quiz-percentage">
              {{ num_correct_answers }}/{{ num_quiz_questions }} correct
              ({{ ((num_correct_answers/
                num_quiz_questions) *100).toFixed(1) }}%)
            </div>
          </div>
        </div>
        <div v-else>
          No Submission <sui-icon name="x" color="red" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import helpers from '@/helpers.js'

export default {
  name: 'MeetingTaskCard',
  mixins: [helpers],
  props:{
    meeting_id: {
      type: String,
      required: true
    },
    task_type: {
      type: String,
      required: true
    },
    portion: {
      type: Object,
      required: true
    },
    task: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    window_is_open: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
      return {
        course_subject_code: null,
        course_number: null,
        course_name: null,
        card_title: "",
        first_button_text: "",
        student_submitted: false,
        percent_watched: 0,
        num_quiz_questions: 0,
        num_correct_answers: 0
      }
  },
  created () {
    this.setLabelsBasedOnTaskType()
    if(!this.is_instructor) {
      const submission =
        this.checkIfStudentSubmittedToTask(this.task)
      this.student_submitted = submission != null
      if(this.student_submitted) {
        if(this.task_type === 'quiz') {
          this.num_correct_answers = submission.num_correct_answers
          this.num_quiz_questions = this.task.questions.length
        } else if(this.task_type === 'video') {
          this.percent_watched = submission.video_percent_watched
          if(this.task.quiz != null) {
            this.num_correct_answers = submission.num_correct_answers
            this.num_quiz_questions = this.task.quiz.questions.length
          }
        }
      }
    }
  },
  methods: {
    setLabelsBasedOnTaskType() {
      if(this.task_type === 'qr_scan') {
        this.card_title = `QR Scan ${this.index + 1}`
        this.first_button_text = "Show QR"
      } else {
        this.card_title = this.task.name
        this.first_button_text = "View"
      }
    }
  }
}
</script>

<style scoped>
.meeting-task-card-container {
  width: 38rem;
  display: inline-block;
  vertical-align: top;
}

.meeting-task-card {
  border-radius: 3px;
  margin-top: 2rem;
  height: 2.75rem;
  display: inline-block;
  width: 37rem;
  padding-left: 0.45rem;
  padding-right: 0.2rem;
  padding-top: 0.35rem;
}

.meeting-title {
  display: inline-block;
  vertical-align: top;
  margin-top: 0.2rem;
  font-size: 1.15rem;
  color: #252b36bf;
  font-weight: bold;
  /*border: orange solid;*/
  width: 8rem;
}

.reminder-container {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  /*border: blue solid;*/
  width: 29.5%;
}

.icon-section {
  display: inline-block;
  /*border: black solid;*/
  margin-top: 0.5rem;
  /*margin-left: 2rem;*/
  width: 4.5rem;
}

.divider {
  border-left: #c7c7c7 solid thin;
  background-color: #c7c7c7;
  height: 90%;
  width: 0.005rem;
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
}

.btn-container {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.65rem;
}

.student-submission-status {
  margin-top: 0.25rem;
  float: right;
  margin-right: 0.25rem;
}

.quiz-percentage {
  display: inline-block;
  vertical-align: top;
}

/* Phone */
@media (max-width: 768px) {
  .meeting-task-card-container {
    width: 100%;
  }
  .meeting-task-card {
    width: 100%;
    height: auto;
  }
  .meeting-title {
    float: left;
    text-align: left;
  }
  .student-submission-status {
    margin-top: 0;
  }
  .quiz-percentage {
    display: block;
  }
}
</style>

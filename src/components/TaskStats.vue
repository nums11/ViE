<template>
  <div class="mt-3">
    <div>
      {{ stats_label }}
      <sui-button @click="$emit('hide-stats')"
      content="Back" icon="arrow left"
      label-position="left" size="small"
      class="float-right" />
    </div>
    <div v-if="students_loaded" class="mt-2">
      <QRStats v-if="task_type === 'qr_scan'"
      :qr_scan="task" :present_students="present_students"
      :absent_students="absent_students" />
      <VideoStats v-else-if="task_type === 'video'"
      :video="task" :present_students="present_students"
      :absent_students="absent_students" />
      <QuizStats v-else-if="task_type === 'quiz'"
      :quiz="task" :present_students="present_students"
      :absent_students="absent_students" />
    </div>
  </div>
</template>

<script>
import QRStats from '@/components/QRStats'
import VideoStats from '@/components/VideoStats'
import QuizStats from '@/components/QuizStats'
import helpers from '@/helpers.js'

export default {
  name: 'TaskStats',
  mixins: [helpers],
  props: {
    task: {
      type: Object,
      required: true
    },
    task_type: {
      type: String,
      required: true
    },
    meeting_students: {
      type: Set,
      required: true
    }
  },
  components: {
    QRStats,
    VideoStats,
    QuizStats
  },
  data () {
    return {
      stats_label: "",
      students_loaded: false,
      present_students: [],
      absent_students: []
    }
  },
  created () {
    this.setStatsLabel()
    this.separateAttendees()
  },
  methods: {
    setStatsLabel() {
      let type;
      if(this.task_type === 'qr_scan')
        type = "QR"
      else if(this.task_type === 'video')
        type = "Video"
      this.stats_label = `${type} Statistics`
    },
    separateAttendees() {
      const students = this.getPresentAndAbsentStudents(
        this.meeting_students, this.task)
      this.present_students = students.present_students
      this.absent_students = students.absent_students
      this.students_loaded = true
    }
  }
}
</script>

<style scoped>

</style>
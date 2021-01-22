<template>
  <div class="course-meetings-for-month-container">

<!--     <div class="month">{{ month }}</div>
    <div class="meeting-cards">
      <p v-if="meetings.length === 0" class="no-meetings-text">
        No Meetings.
        <span v-if="is_instructor">
          Click on the green button above to schedule a meeting.
        </span>
      </p>
      <div v-else>
        <CourseMeetingCard v-for="(meeting,index) in meetings"
        :meeting="meeting" />
      </div>
    </div> -->
    <FullCalendar :options="calendar_options" />
  </div>
</template>

<script>
import CourseMeetingCard from '@/components/CourseMeetingCard'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'

export default {
  name: 'CourseMeetingsCalendar',
  props: {
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    CourseMeetingCard,
    FullCalendar
  },
  data () {
    return {
      calendar_options: {
        plugins: [ dayGridPlugin, interactionPlugin,
        timeGridPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: this.handleEventClick,
        events: [],
        editable: true
      }
    }
  },
  async created () {
    console.log("meetings", this.meetings)
    this.addMeetingsToCalendar()
  },
  mounted () {
  },
  methods: {
    handleEventClick(info) {
      const meeting_id = info.event._def.extendedProps.meeting_id
      this.$router.push({name: 'meeting_info',
        params: {meeting_id: meeting_id}})
    },
    addMeetingsToCalendar() {
      this.meetings.forEach(meeting => {
        if(meeting.real_time_portion != null &&
          meeting.async_portion != null) {
          this.addToCalendar(
            `${meeting.title} (real-time)`,
            meeting.real_time_portion.real_time_start,
            meeting.real_time_portion.real_time_end,
            meeting._id)
          this.addToCalendar(
            `${meeting.title} (async)`,
            meeting.async_portion.async_start,
            meeting.async_portion.async_end,
            meeting._id)
        } else if(meeting.real_time_portion != null) {
          this.addToCalendar(
            meeting.title,
            meeting.real_time_portion.real_time_start,
            meeting.real_time_portion.real_time_end,
            meeting._id)
        } else if(meeting.async_portion != null) {
          this.addToCalendar(
            meeting.title,
            meeting.async_portion.async_start,
            meeting.async_portion.async_end,
            meeting._id)
        }
      })
    },
    addToCalendar(title, start, end, meeting_id) {
      this.calendar_options.events.push({
        title: title,
        start: start,
        end: end,
        meeting_id: meeting_id
      })
    }
  }
}
</script>

<style scoped>
.course-meetings-for-month-container {
  margin-top: 3rem;
}

.month {
  font-size: 1.5rem;
}

.meeting-cards {
  width: 97%;
  margin: auto;
}

.no-meetings-text {
  margin-top: 3rem;
  text-align: center;
}
</style>
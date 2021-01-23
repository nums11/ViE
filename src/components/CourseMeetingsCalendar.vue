<template>
  <FullCalendar class="mt-3"
  :options="calendar_options" />
</template>

<script>
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
        editable: true,
        fixedWeekCount: false,
      }
    }
  },
  async created () {
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
</style>
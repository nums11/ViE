<template>
  <div id="mobile-meeting-info" class="center-text">
    <h1 class="wrap-text">{{ meeting.title }}</h1>
    <h3 class="wrap-text">
      {{ meeting_course.name }}
    </h3>
    <h4 class="wrap-text">
      {{ meeting_course.dept }}
      {{ meeting_course.course_number }}
      Section
      <span v-if="meeting.sections.length > 1">s</span>
      <span v-for="(section,index) in meeting.sections">
        {{ section.section_number }}
        <span v-if="index !== meeting.sections.length-1">,</span>
      </span>
    </h4>
    <div class="mt-2">
      <sui-icon name="graduation cap" />
      <p class="inline-block" id="instructor-name">
        {{ meeting_course.instructor.first_name }}
        {{ meeting_course.instructor.last_name }}
      </p>
    </div>
    <div class="portion-dropdown mt-2" @click="toggleList(true)">
      <div class="portion-text inline-block float-left bold">
        Real-Time Portion
      </div>
      <div v-if="meeting.real_time_portion != null"
      class="portion-times inline-block">
        {{ meeting.real_time_portion.real_time_start | moment("M/D h:mm a") }}
        - {{ meeting.real_time_portion.real_time_end | moment("M/D h:mm a") }}
      </div>
      <div v-else class="portion-times inline-block">
        No Real-Time Portion
      </div>
      <sui-icon :name="real_time_caret_name"
      class="caret-icon float-right" />
    </div>
    <div v-if="show_real_time_list && meeting.real_time_portion != null">
      <MeetingTaskCard
      v-for="(qr_scan, index) in meeting.real_time_portion.qr_scans"
      task_type="qr_scan" :portion="meeting.real_time_portion"
      :task="qr_scan" :index="index" />
    </div>
    <div class="portion-dropdown mt-2" @click="toggleList(false)"">
      <div class="portion-text inline-block float-left bold">
        Async Portion
      </div>
      <div v-if="meeting.async_portion != null"
      class="portion-times inline-block">
        {{ meeting.async_portion.async_start | moment("M/D h:mm a") }}
        - {{ meeting.async_portion.async_end | moment("M/D h:mm a") }}
      </div>
      <div v-else class="portion-times inline-block">
        No Async Portion
      </div>
      <sui-icon :name="async_caret_name"
      class="caret-icon float-right" />
    </div>
    <div v-if="show_async_list && meeting.async_portion != null">
      <MeetingTaskCard
      v-for="(video, index) in meeting.async_portion.videos"
      task_type="video" :portion="meeting.async_portion"
      :task="video" :index="index" />
    </div>
  </div>
</template>

<script>
import MeetingTaskCard from '@/components/MeetingTaskCard'

export default {
  name: 'MobileCourseInfo',
  props: {
    meeting: {
      type: Object,
      required: true
    },
    meeting_course: {
      type: Object,
      required: true
    },
  },
  components: {
    MeetingTaskCard
  },
  data () {
    return {
      show_real_time_list: true,
      show_async_list: true,
      real_time_caret_name: "caret down",
      async_caret_name: "caret down",
    }
  },
  mounted () {
  },
  methods: {
    toggleList(is_real_time) {
      if(is_real_time) {
        this.show_real_time_list = !this.show_real_time_list
        if(this.show_real_time_list)
          this.real_time_caret_name = "caret down"
        else
          this.real_time_caret_name = "caret up"
      } else {
        this.show_async_list = !this.show_async_list
        if(this.show_async_list)
          this.async_caret_name ="caret down"
        else
          this.async_caret_name = "caret up"
      }
    }
  }
}
</script>

<style scoped>
#mobile-meeting-info {
  /*border: green solid;*/
  width: 95%;
  margin: auto;
  margin-top: 1rem;
}

#instructor-name {
  margin-left: 0.5rem;
}

.portion-dropdown {
  border: #c7c7c7 solid thin;
  border-radius: 3px;
  height: 3rem;
  padding-left: 0.5rem;
  padding-right: 0.25rem;
}

.portion-text {
  /*font-size: 1.15rem;*/
  text-align: left;
  margin-top: 0.75rem;
  /*border: black solid;*/

}

.portion-times {
  font-size: 0.95rem; 
  margin-top: 0.75rem;
}

.caret-icon {
  /*border: blue solid;*/
  /*margin-left: 1rem;*/
  margin-top: 0.7rem;
}
</style>
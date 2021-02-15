<template>
  <div class="new-meeting-portion-container">
    <div v-if="portionTimesSet"
    @click="$emit('clear-portion', is_real_time)"
    class="inline-block clear-btn-container">
      <sui-button content="clear" size="mini" />
    </div>
    <div class="inline-block">
      <h4>{{ portion_label }}</h4>
    </div>
    <p class="mt-1" v-if="portionTimesSet">
      <span v-if="is_real_time">
        {{ portion.real_time_start | moment("M/D, h:mm a") }}
        - {{ portion.real_time_end | moment("M/D, h:mm a") }}
      </span>
      <span v-else>
        {{ portion.async_start | moment("M/D, h:mm a") }}
        - {{ portion.async_end | moment("M/D, h:mm a") }}
      </span>
    </p>
    <p class="mt-1" v-else>{{ no_portion_message }}</p>
    <div v-if="is_real_time">
      <NewMeetingTaskCard v-for="(task, index) in portion.qr_scans"
      task_type="qr_scan" :index="index" :task="task"
      v-on:remove-task="$emit('remove-task','qr_scan',index)" />
      <NewMeetingTaskCard v-for="(task, index) in portion.quizzes"
      task_type="quiz" :index="index" :task="task"
      v-on:remove-task="$emit('remove-task','quiz',index)" />
    </div>
    <div v-else>
      <NewMeetingTaskCard v-for="(task, index) in portion.videos"
      task_type="video" :index="index" :task="task"
      v-on:remove-task="$emit('remove-task','video',index)" />
    </div>
  </div>
</template>

<script>
import NewMeetingTaskCard from '@/components/NewMeetingTaskCard.vue';

export default {
  name: 'NewMeetingPortionContainer',
  props: {
    portion: {
      type: Object,
      required: true
    },
    is_real_time: {
      type: Boolean,
      required: true
    }
  },
  components: {
    NewMeetingTaskCard
  },
  data () {
    return {
      portion_label: "",
      no_portion_message: "",
      portion_start: null,
      portion_end: null
    }
  },
  computed: {
    portionTimesSet() {
      if(this.is_real_time){
        return (this.portion.real_time_start != null
          && this.portion.real_time_end != null)
      } else {
        return (this.portion.async_start != null
          && this.portion.async_end != null)
      }
    }
  },
  created() {
    this.setValuesBasedOnPortion()
  },
  methods: {
    setValuesBasedOnPortion() {
      let label_prefix = ""
      if(this.is_real_time)
        label_prefix = "Real-Time"
      else
        label_prefix = "Async"
      this.portion_label = `${label_prefix} Portion`
      this.no_portion_message =
        `No ${label_prefix.toLowerCase()} portion`
    }
  }
}
</script>

<style scoped>
.new-meeting-portion-container {
  float: right;
  width: 100%;
  margin-top: 3rem;
  text-align: right;
}

.clear-btn-container {
  margin-right: 2rem;
}

</style>
<template>
  <div class="new-meeting-portion-container">
    <div v-if="portionTimesSet" @click="clearPortion"
    class="inline-block clear-btn-container">
      <sui-button content="clear" size="mini" />
    </div>
    <div class="inline-block">
      <h4>{{ portion_label }}</h4>
    </div>
    <p class="mt-1" v-if="portionTimesSet">
      <span v-if="is_real_time">
        {{ real_time_portion.real_time_start | moment("M/D, h:mm a") }}
        - {{ real_time_portion.real_time_end | moment("M/D, h:mm a") }}
      </span>
      <span v-else>
        {{ async_portion.async_start | moment("M/D, h:mm a") }}
        - {{ async_portion.async_end | moment("M/D, h:mm a") }}
      </span>
    </p>
    <p class="mt-1" v-else>{{ no_portion_message }}</p>
    <NewMeetingTaskCard v-for="(task, index) in portion_tasks"
    :is_qr="is_real_time" :key="index" :index="index" :task="task"
    :portion="is_real_time ? real_time_portion :async_portion"
    v-on:remove-task="$emit('remove-task',index)" />
  </div>
</template>

<script>
import NewMeetingTaskCard from '@/components/NewMeetingTaskCard.vue';

export default {
  name: 'NewMeetingPortionContainer',
  props: {
    real_time_portion: Object,
    async_portion: Object
  },
  components: {
    NewMeetingTaskCard
  },
  data () {
    return {
      is_real_time: Boolean,
      portion_label: "",
      no_portion_message: "",
      portion_tasks: []
    }
  },
  computed: {
    portionTimesSet() {
      if(this.is_real_time){
        return (this.real_time_portion.real_time_start != null
          && this.real_time_portion.real_time_end != null)
      } else {
        return (this.async_portion.async_start != null
          && this.async_portion.async_end != null)
      }
    }
  },
  created () {
    this.is_real_time = this.real_time_portion != null
    this.setValuesBasedOnPortion()
  },
  methods: {
    setValuesBasedOnPortion() {
      let label_prefix = ""
      if(this.is_real_time){
        label_prefix = "Real-Time"
        this.portion_tasks = this.real_time_portion.qr_scans
      } else{
        label_prefix = "Async"
        this.portion_tasks = this.async_portion.videos
      }
      this.portion_label = `${label_prefix} Portion`
      this.no_portion_message =
        `No ${label_prefix.toLowerCase()} portion`
    },
    clearPortion() {
      this.$emit('clear-portion', this.is_real_time)
      if(this.is_real_time)
        this.portion_tasks = this.real_time_portion.qr_scans
      else
        this.portion_tasks = this.async_portion.videos
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
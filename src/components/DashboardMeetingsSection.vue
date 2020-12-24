<template>
  <div class="dashboard-meeting-section">
    <h2 class="meeting-section-header">
      <sui-popup :content="popup_text" position="bottom center" inverted basic>
        <div slot="trigger">
          {{ section_header }} 
          <span class="meeting-count">({{ meetings.length}})</span>
        </div>
      </sui-popup>
    </h2>
    <div class="meeting-list-container">
      <div v-if="meetings.length > 0">
        <DashboardMeetingCard v-for="meeting in meetings"
        :key="meeting._id" :meeting="meeting"
        v-on:change-route="changeRoute" />
      </div>
      <p v-else class="no-meetings">{{ no_meetings_text }}</p>
    </div>
  </div>
</template>

<script>
import DashboardMeetingCard from '@/components/DashboardMeetingCard.vue'

export default {
  name: 'Dashboard',
  props: {
    section_type: {
      type: String,
      required: true
    },
    meetings: {
      type: Array,
      required: true
    }
  },
  components: {
    DashboardMeetingCard
  },
  data(){
    return {
      section_header: "",
      popup_text: "",
      no_meetings_text: ""
    }
  },
  async created() {
    this.assignValuesBasedOnSectionType()
  },
  methods: {
    assignValuesBasedOnSectionType() {
      if(this.section_type === 'real_time') {
        this.section_header = "Real-Time"
        this.popup_text = "Meetings that are ongoing in real-time"
        this.no_meetings_text = "No ongoing real-time meetings."
      } else if(this.section_type === 'recent_real_time') {
        this.section_header = "Recent Real-Time"
        this.popup_text = "Meetings whose real-time portions ended" +
        " within the last 24 hrs"
        this.no_meetings_text = "No meetings whose real-time portions" +
        " ended within the last 24 hours."
      } else if(this.section_type === 'async') {
        this.section_header = "Asynchronous"
        this.popup_text = "Meetings with ongoing asynchronous tasks"
        this.no_meetings_text = "No meetings with ongoing asynchronous" +
        " tasks."
      }
    },
    changeRoute(route_name, params) {
      this.$router.push({name: route_name, params: params})
    }
  }
}
</script>

<style scoped>
.dashboard-meeting-section {
  /*border: yellow solid;*/
  display: inline-block;
  vertical-align: top;
  width: 33.3%;
  text-align: center;
}

.meeting-section-header {
/*border: black solid;*/
}

.meeting-count {
  font-weight: normal;
  font-size: 1.5rem;
  margin-left: 0.25rem;
}

.meeting-list-container {
  max-height: 20rem;
  padding-left: 1rem;
  padding-right: 1rem;
  overflow-y: auto;
}

.no-meetings {
  font-size: 1.25rem;
  margin-top: 3rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Tablets */
@media (max-width: 1128px) {
  .dashboard-meeting-section {
    display: block;
    width: 80%;
    margin: auto;
    margin-top: 3rem;
  }

}

/* Phones */
@media (max-width: 744px) {
  .dashboard-meeting-section {
    width: 95%;
  }
}

</style>

<template>
  <div id="meeting-info">
    <SideBar header="Meeting 1"
    :sub_headers="['Data Structures', 'Sections 1,2']"
    :links="links"
    v-on:show-section="showSection" />

    <div class="inline-block" id="main">
      <transition name="fade" mode="out-in">
        <div v-if="active_section === 'Real-Time Portion'" 
        key="real-time portion">
          <div id="section-header">Real-Time Portion</div>
          <div>
            <div class="inline-block" id="portion-times">
              12/2, 2p - 12/4, 4a
            </div>
            <sui-button animated size="small"
              style="background-color:#00b80c; color:white;
              float:right;">
              <sui-button-content visible>
                Add Real-Time Tasks
              </sui-button-content>
              <sui-button-content hidden>
                <sui-icon name="podcast" />
              </sui-button-content>
            </sui-button>
          </div>
          <MeetingTasksContainer task_type="qr_scan"
          :tasks="qr_tasks"/>
        </div>
        <div v-else-if="active_section === 'Async Portion'"
        key="async portion">
          <h1>Coming Soon</h1>
        </div>
        <div v-else-if="active_section === 'Statistics'"
        key="statistics">
          <h1>Coming Soon</h1>
        </div>
        <div v-else-if="active_section === 'Settings'"
        key="settings">
          <h1>Coming Soon</h1>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import SideBar from '@/components/SideBar'
import MeetingTasksContainer from 
'@/components/MeetingTasksContainer'

export default {
  name: 'MeetingInfo',
  mixins: [],
  components: {
    SideBar,
    MeetingTasksContainer
  },
  data () {
    return {
      active_section: "Real-Time Portion",
      links: [
        {
          link_name: "Real-Time Portion",
          icon_name: "podcast"
        },
        {
          link_name: "Async Portion",
          icon_name: "clock"
        },
        {
          link_name: "Statistics",
          icon_name: "chart bar"
        },
        {
          link_name: "Settings",
          icon_name: "cog"
        }
      ],
      qr_tasks: [
        {
          code: "abcdefg",
        },
        {
          code: "hijklmnop",
          reminder_time: new Date()
        },
        {
          code: "hijklmnop",
          reminder_time: new Date()
        }
      ]
    }
  },
  async created () {

  },
  methods: {
    showSection(section_name) {
      this.active_section = section_name
    }
  }
}
</script>

<style scoped>
#meeting-info {
  margin-top: 3rem;
  /*border: blue solid;*/
  min-height: 47rem;
  padding-left: 5rem;
  padding-right: 5rem;
  padding-bottom: 2rem;
}

#main {
  /*border: red solid;*/
  padding-top: 0.5rem;
  width: 78%;
  height: 100%;
}

#section-header {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}
</style>
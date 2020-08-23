<template>
  <div class="task-info-modal-instructor-expanded task-attendance-info-mode">
    <div class="header-area">
      <div class="left-side">
        <div class="title-area">
          <h4 v-if="is_qr">QR Submission</h4>
          <h4 v-else>Recording</h4>
        </div>
      </div>
      <div class="right-side">
        <div class="icon-area">
          <!-- SPACE AVAILABLE -->
        </div>
      </div>
    </div>

    <!-- Body Area -->
    <div class="body-area">
      <div class="student-attendance-list">
        <ul v-if="is_qr">
          <li v-for="submission in task.qr_checkin_submissions" :key="i" >
            <p>Student {{i}}</p>
            <sui-label v-if="i%2 == 0" size="small" class="venue-green">
                Has Attended
            </sui-label>
            <sui-label v-if="i%2 == 1" size="small" class="venue-red">
                Has Not Attended
            </sui-label>
          </li>
        </ul>
      </div>
    </div>

    <!-- Footer Area -->
    <div class="footer-area">
      <div class="left-side">
        <sui-button 
          compact icon="left arrow" 
          label-position="left" 
          @click="cancelTask"
          content="Back" />
      </div>
      <div class="center-area">
        <ProgressBar :value="0.8" />
      </div>
      <div class="right-side">
          <!-- RIGHT FOOTER PLACEHOLDER -->
      </div>
    </div>
  </div>
</template>

<script>

import ProgressBar from "@/components/ProgressBar.vue";

export default {
    name: 'TaskAttendanceList',
    components: {
        ProgressBar
    },
    props: {
        task: Object,
        is_qr: Boolean,
        cancelTask: Function
    },
    methods: {
        getTaskName () {
            return this.taskInfo.taskName
        }
    }
}
</script>
<style lang="scss">

.task-attendance-info-mode {
    
    .student-attendance-list {
        
        ul {
            list-style: none;
            margin: 0;
            padding: 0;

            li {
                height: 35px;
            }
        }
    }
}

.task-info-modal-instructor-expanded {
    border-radius: 3px;
    margin-bottom: 30px;

    .header-area {
        display: flex;
        box-sizing: border-box;
        padding: 10px 15px;

        .left-side {
            flex-grow: 1;

            display: flex;
            .title-area {
                margin-right: 10px;
            }
        }
    }

    .body-area {
        min-height: 450px;
        box-sizing: border-box;
        padding: 10px 15px;

        .body-contents {
            text-align: center;
        }
    }

    .footer-area {
        box-sizing: border-box;
        padding: 10px 15px;
        display: flex;
        align-items: center;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .center-area {
            flex-grow: 1;
            text-align: center;
        }
    }

}

.light-mode {
    .task-info-modal-instructor-expanded {
        background-color: white;
        border: 1px solid rgba(0, 0, 0, 0.25);
            box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

        .footer-area {
            background-color: #E3EBF2;
        }
    }
}

.dark-mode {
    // 282c36
    .task-info-modal-instructor-expanded {
        background-color: #282c36;

        .footer-area {
            background-color: #313440;
        }
    }
}

</style>
<template>
  <div class="manage-students-area">
    <div>
      <div class="action-row">
        <div class="left-side">
          <div v-if="is_qr" :style="{fontSize: '1.2rem'}">{{ task.submissions.length }} Submission</div>
          <div v-else :style="{fontSize: '1.2rem'}">{{ task.video_submissions.length }} Submission</div>
        </div>
      </div>
      <div class="student-list">
        <div class="student-row-header">
          <div class="checkbox-area">
              <sui-checkbox />
          </div>
          <div class="first-name-area">First Name</div>
          <div class="last-name-area">Last Name</div>
          <div class="email-area">User ID</div>
        </div>
          <div v-if="is_qr">
            <div v-for="submission in task.submissions" :key="submission._id" class="student-row">
              <div class="checkbox-area">
                  <sui-checkbox />
              </div>
              <div class="first-name-area">{{ submission.submitter.first_name }}</div>
              <div class="last-name-area">{{ submission.submitter.last_name }}</div>
              <div class="email-area">{{ submission.submitter.user_id }}</div>
            </div>
          </div>
          <div v-else>
            <div v-for="submission in task.video_submissions" :key="submission._id" class="student-row">
              <div class="checkbox-area">
                  <sui-checkbox />
              </div>
              <div class="first-name-area">{{ submission.submitter.first_name }}</div>
              <div class="last-name-area">{{ submission.submitter.last_name }}</div>
              <div class="email-area">{{ submission.submitter.user_id }}</div>
            </div>
          </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'StudentSubmissions',
    props: {
      task: Object,
      is_qr: Boolean
    }
}
</script>
<style lang="scss">
.manage-students-area {
  margin-bottom: 3rem;
  .action-row {
    height: 50px;
    display: flex;
    align-items: center;
    .left-side {
        flex-grow: 1;
        div {
            display: inline-block;
            margin-right: 20px;
        }
    }
    .right-side {
    }
  }
.student-list {
    .student-row-header {
        display: flex;
        align-items: center;
        height: 35px;
        .checkbox-area {
            width: 100px;
            text-align: center;
        }
        .first-name-area {
            width: 20%;
        }
        .last-name-area {
            width: 20%;
        }
        .email-area {
        }
    }
    .student-row {
        transition: background-color 0.25s;
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 35px;
        .checkbox-area {
            width: 100px;
            text-align: center;
        }
        .first-name-area {
            width: 20%;
        }
        .last-name-area {
            width: 20%;
        }
        .email-area {
        }
    }
    .student-row.active {
        
    }
  }
}
.dark-mode {
    .manage-students-area {
        .student-list {
            .student-row-header {
                background-color: #0e0f12;
            }
            .student-row:hover {
                background-color: #22252e;
            }
            .student-row.active {
                background-color: #2f3340;
            }
        }
    }
}
.light-mode {
    .manage-students-area {
        .student-list {
            .student-row-header {
                background-color: rgba(0, 0, 0, 0.1);
            }
            .student-row:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
            .student-row.active {
                background-color: rgba(0, 0, 0, 0.07);
            }
        }
    }
}
</style>
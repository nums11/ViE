<template>
  <div class="manage-students-area">
    <div v-for="section in course.sections" :key="section._id"
    class="section-info">
      <h2>Section {{ section.section_number }}</h2>
      <p v-if="section.has_open_enrollment">Open Enrollment</p>
      <p v-else>Closed Enrollment</p>
      <p>Join Code: {{ section.join_code }}</p>
      <h5>Students</h5>
      <div class="student-list">
        <div class="student-row-header">
          <div class="checkbox-area">
              <sui-checkbox />
          </div>
          <div class="first-name-area">First Name</div>
          <div class="last-name-area">Last Name</div>
          <div class="email-area">User ID</div>
        </div>
          <div v-for="student in section.students" :key="student._id" class="student-row">
            <div class="checkbox-area">
                <sui-checkbox />
            </div>
            <div class="first-name-area">{{ student.first_name }}</div>
            <div class="last-name-area">{{ student.last_name }}</div>
            <div class="email-area">{{ student.user_id }}</div>
          </div>
      </div>
    </div>
<!--     <div v-if="course">
      <div class="action-row">
        <div class="left-side">
            <div :style="{fontSize: '1.2rem'}">{{ course.students.length }} Students</div>
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
          <div v-for="student in course.students" :key="student._id" class="student-row">
            <div class="checkbox-area">
                <sui-checkbox />
            </div>
            <div class="first-name-area">{{ student.first_name }}</div>
            <div class="last-name-area">{{ student.last_name }}</div>
            <div class="email-area">{{ student.user_id }}</div>
          </div>
      </div>
    </div> -->
<!--     <div v-else>
      <div class="action-row">
        <div class="left-side">
            <div :style="{fontSize: '1.2rem'}">{{ org.board_members.length }} Board Members</div>
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
          <div v-for="member in org.board_members" :key="member._id" class="student-row">
            <div class="checkbox-area">
                <sui-checkbox />
            </div>
            <div class="first-name-area">{{ member.first_name }}</div>
            <div class="last-name-area">{{ member.last_name }}</div>
            <div class="email-area">{{ member.user_id }}</div>
          </div>
      </div>
      <div class="action-row">
        <div class="left-side">
            <div :style="{fontSize: '1.2rem'}">{{ org.general_members.length }} General Members</div>
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
          <div v-for="member in org.general_members" :key="member._id" class="student-row">
            <div class="checkbox-area">
                <sui-checkbox />
            </div>
            <div class="first-name-area">{{ member.first_name }}</div>
            <div class="last-name-area">{{ member.last_name }}</div>
            <div class="email-area">{{ member.user_id }}</div>
          </div>
      </div>
    </div> -->
  </div>
</template>
<script>
export default {
  name: 'ManageStudents',
  props: {
    course:  {
      type: Object,
      required: true
    },
    org: Object
  },
  created() {
    console.log("course", this.course)
  }
}
</script>
<style lang="scss">
.manage-students-area {
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

.section-info:not(:first-child) {
  margin-top: 2rem;
}
</style>
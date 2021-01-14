<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Invite Students
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
      <div id="content-container">
      <div v-if="sending_email" id="loader-container">
        <sui-loader size="medium"
        class="workaround" inline>
          Sending Email(s)
        </sui-loader>
      </div>
      <div v-else>
        <sui-form
        @submit.prevent="inviteStudents([invite_email])"
        class="invite-form">
          <div style="margin-bottom:2rem;">
            Send an email that contains the section join code
          </div>
          <sui-form-field>
            <label class="form-label">Student Email</label>
            <input class="invite-input" v-model="invite_email"
            type="email" placeholder="student@email.com">
            <sui-button :disabled="disableInviteBtn"
              animated size="small"
              style="background-color:#00b80c; color:white;">
              <sui-button-content visible>
                Invite
              </sui-button-content>
              <sui-button-content hidden>
                <sui-icon name="envelope open" />
              </sui-button-content>
            </sui-button>
          </sui-form-field>
        </sui-form>
        <p class="mt-2">Or</p>
        <p class="mt-2 bold">Invite Students via CSV</p>
        <input type="file" id="file-input" @change="selectFile"
        accept=".csv">
        <p v-if="file != null">
          {{ file.name }}
          <sui-popup content="Remove File" position="top center"
          inverted basic>
            <span slot="trigger" class="x-btn"
            @click="removeFile">X</span>
          </sui-popup>
        </p>
        <sui-button @click="showSelectorOrInviteStudents"
          animated size="small"
          style="background-color:#00b80c; color:white;">
          <sui-button-content visible>
            {{ btnText }}
          </sui-button-content>
          <sui-button-content hidden>
            <sui-icon :name="btnIcon" />
          </sui-button-content>
        </sui-button>
        <div v-if="file == null" class="mt-1">
          <p>
            CSV must have 1 column with emails placed on each row.
            See example image below:
            <div class="mt-2">
              <img src="@/assets/csv_pic.png" id="csv-img" />
            </div>
          </p>
        </div>
        <div id="table-container" v-if="email_statuses.length > 0">
          <sui-table basic celled>
            <sui-table-header>
              <sui-table-row>
                <sui-table-header-cell>
                  Student Email
                </sui-table-header-cell>
                <sui-table-header-cell>
                  Email Status
                </sui-table-header-cell>
              </sui-table-row>
            </sui-table-header>
            <sui-table-body>
              <sui-table-row v-for="email_status in email_statuses">
                <sui-table-cell>
                  {{ email_status.value }}
                </sui-table-cell>
                <sui-table-cell>
                  <sui-icon v-if="email_status.status === 'fulfilled'"
                  name="check" color="green" />
                  <sui-icon v-else name="x" color="red" />
                </sui-table-cell>
              </sui-table-row>
            </sui-table-body>
          </sui-table>
        </div>
      </div>
     </div>
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button @click="hideModal"
      style="background-color:#00B3FF; color:white;">
        Done
      </sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
import EmailAPI from '@/services/EmailAPI'
import Papa from 'papaparse'

export default {
  name: 'InviteModal',
  props: {
    course: {
      type: Object,
      required: true
    },
    section: {
      type: Object,
      required: true
    }
  },
  components: {

  },
  data () {
    return {
      invite_email: "",
      sending_email: false,
      show_modal: false,
      file: null,
      email_statuses: []
    }
  },
  computed: {
    disableInviteBtn() {
      return this.invite_email.length === 0
        || !this.invite_email.includes('@')
        || !this.invite_email.includes('.')
    },
    btnText() {
      if(this.file == null)
        return "Upload CSV"
      else
        return "Invite"
    },
    btnIcon() {
      if(this.file == null)
        return "upload"
      else
        return "envelope open"
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    async inviteStudents(student_emails) {
      try {
        this.email_statuses = []
        this.sending_email = true
        const course = this.course, section = this.section
        const instructor = course.instructor
        const response = await EmailAPI.sendInviteEmails(
          course.name, course.dept, course.course_number,
          section.section_number, 
          `${instructor.first_name} ${instructor.last_name}`,
          section.join_code, student_emails)
        const email_statuses = response.data
        this.email_statuses = email_statuses
        const num_successful = this.getNumSuccessfulEmails()
        const num_failed = this.email_statuses.length - num_successful
        this.invite_email = ""
        alert(`${num_successful} emails sent, ${num_failed} failed`)
      } catch(error) {
        console.log(error)
        alert("Sorry, something went wrong sending your email")
      }
      this.sending_email = false
    },
    showModal() {
      this.show_modal = true
    },
    hideModal() {
      this.show_modal = false
    },
    showFileSelector() {
      const file_input = this.getFileInput()
      file_input.click()
    },
    selectFile(event) {
      const file_input = this.getFileInput()
      this.file = file_input.files[0]
    },
    getFileInput() {
      return document.getElementById('file-input')
    },
    removeFile() {
      this.file = null
    },
    inviteStudentsFromCSV() {
      const self = this
      Papa.parse(this.file, {
        complete: function(results) {
          const student_emails_two_d = results.data
          const student_emails = self.convertToOneDArray(
            student_emails_two_d)
          self.inviteStudents(student_emails)
        }
      });
    },
    convertToOneDArray(two_d_array) {
      let one_d_array = []
      for(let i = 0; i < two_d_array.length; i++) {
          one_d_array = one_d_array.concat(two_d_array[i]);
      }
      return one_d_array
    },
    showSelectorOrInviteStudents() {
      if(this.file == null)
        this.showFileSelector()
      else
        this.inviteStudentsFromCSV()
    },
    getNumSuccessfulEmails() {
      let num_successful = 0
      this.email_statuses.forEach(email_status => {
        if(email_status.status === 'fulfilled')
          num_successful++
      })
      return num_successful
    }
  }
}
</script>

<style scoped>

#invite-modal-header {
  text-align: center;
}

#content-container {
  width: 60%;
  margin: auto;
}

.invite-form {
  margin-top: 0;
}

.invite-input {
  width: 70%;
  margin-right: 1rem;
}

#file-input {
  display: none;
}

.ui.dimmer .ui.workaround.loader:before {
  border-color: rgba(0,0,0,.1);
  color: black;
}
          
.ui.dimmer .ui.workaround.loader:after {
  border-color: #767676 transparent transparent;
  color: black;
}

#csv-img {
  border-radius: 5px;
  width: 16rem;
}

.x-btn {
  font-weight: bold;
  cursor: pointer;
  margin-left: 0.5rem;
  color: #FF0000;
}

#loader-container {
  height: 30rem;
  padding-top: 12rem;
}

#table-container {
  width: 60%;
  margin: auto;
  margin-top: 2rem;
}

.green {
  color: #00b80c;
}

.red {

}
</style>
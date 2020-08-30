<template>
  <div class="invite-students-page">

    <div class="center-container">
      <div class="header">
        <h3>Invite Students</h3>
      </div>
      <div class="header">
        <h5>Single Invite</h5>
        <p>Invite students to your course by email.</p>
      </div>
      <div class="single-invite">
        <div class="left-side">
          <InputField2 
            v-model="student_email"
            :config="{
              label: 'Student Email',
              width: '100%'
            }"
          />
        </div>
        <div class="right-side">
          <Button2
            text="Invite Student"
            :valid="false"
            :disabled="true"
            :config="{
              width: '100%',
              height: '55px',
              lineHeight: '5px'
            }"
          />
        </div>
      </div>

      
      <div class="header" :style="{marginTop: '30px'}">
        <h5>Excel Sheet</h5>
        <p>Invite a collection of students by import an excel sheet that 
          contains the first name, last name and email of each of the 
          students to be enrolled</p>
      </div>
      <div class="excel-invite">

        <div :class="`excel-sheet-file ${excel_file == null ? '' : 'active'}`" @click="initiateExcelUpload">
          
          <div v-if="excel_file == null">
            Click here to upload an excel sheet.
          </div>
          <div v-else>
            <div class="remove-file" @click="excel_file = null">
              <sui-icon name="close" />
            </div>
            {{ excel_file.name }}
          </div>

          <input type="file" id="excel_import_file" 
            @change="uploadExcel"  
            :style="{display: 'none'}"
          />
        </div>
        <div class="button-area">
          <Button2
            :onClick="inviteStudentsThroughExcel"
            text="Invite Students" 
            :valid="excel_file != null"
            :disabled="excel_file == null"
            :config="{
              width: '100%',
              height: '40px'
            }"
          />
        </div>

      </div>
      <div>
        <Button2 
          :style="{marginTop: '20px', marginRight: '2%'}"
          :onClick="goToDashboard"
          :config="{
            width: '18%',
            iconOnly: true,
            icon: 'arrow left',
            color: 'venue-grey'
          }" />
      </div>
    </div>

    <transition name="fade" mode="out-in">
      <div class="uploading" v-if="uploading">
        <div class="centerer">
          <v-lottie-player 
            name="QR CODE"
            :animationData="require('@/assets/lottie/uploading.json')"
            loop
            width="300px"
            height="300px"
            autoplay
          />
        </div>
      </div>
    </transition>

  </div>
</template>
<script>

import InputField2 from '@/components/InputField2.vue'
import CourseAPI from '@/services/CourseAPI'
import Button2 from '@/components/Button2.vue'
import xlsx from 'xlsx'
import VueLottiePlayer from 'vue-lottie-player'

export default {
  name: 'InviteStudents',
  components: {
    InputField2,
    Button2,
    vLottiePlayer: VueLottiePlayer
  },
  data () {
    return {
      student_email: "",
      invited_students: [],
      excel_file: null,
      excel_binary: null,
      uploading: false
    }
  },
  mounted () {
  },
  methods: {
    goToDashboard () {
      this.$router.push({ name: 'dashboard' })
    },
    inviteStudentsThroughExcel () {

      if (this.excel_binary == null) return;

      // (1) parse the excel file
      let xl_result = xlsx.read(this.excel_binary, {
        type: "binary"
      })
      
      let parsed_user_data = []
      // We will only parse the first sheet
      if (Object.keys(xl_result.Sheets).length == 0) {
        console.error(`Excel file doesn't have any sheets`)
      }

      let main_sheet = xl_result.Sheets[ Object.keys(xl_result.Sheets)[0] ]
      delete main_sheet['!ref']
      let keys_ = Object.keys(main_sheet)
      keys_.sort ()

      console.log(main_sheet)
      console.log(keys_)

      const getCol = (x) => {
        if (!x) return null
        return x.substring(0, 1)
      }
      const getRow = (x) => {
        return x.substring(1)
      }

      const col_map = {}

      let current_col = getCol (null)
      keys_.forEach(key_ => {
        current_col = getCol (key_);

        // must be the column name
        if (!Object.prototype.hasOwnProperty.call(col_map, current_col)) {
          col_map[current_col] = main_sheet[key_].v
        }

        // must be the column value
        else {
          let row_ = getRow (key_)
          while(parsed_user_data.length <= row_) {
            parsed_user_data.push ({})
          }

          parsed_user_data[ row_ ][ col_map[current_col] ] = main_sheet[key_].v
        }

      })

      // get rid of objects in parsed_user_data that have inadequate data
      for(let i = parsed_user_data.length - 1; i >= 0; --i) {
        if (!Object.prototype.hasOwnProperty.call( parsed_user_data[i], 'First Name' )) {
          parsed_user_data.splice(i, 1);
          continue;
        }
        if (!Object.prototype.hasOwnProperty.call( parsed_user_data[i], 'Last Name' )) {
          parsed_user_data.splice(i, 1);
          continue;
        }
        if (!Object.prototype.hasOwnProperty.call( parsed_user_data[i], 'Email' )) {
          parsed_user_data.splice(i, 1);
          continue;
        }
      }

      if (parsed_user_data.length == 0) {
        console.log(`No users to add...`)
        return;
      }

      parsed_user_data = parsed_user_data.map(user => {

        return {
          first_name: user["First Name"],
          last_name:  user["Last Name"],
          email:  user["Email"]
        }
      })

      // invite the students now
      // console.log(this.$router.currentRoute)
      let course_org_id;
      if (this.$router.currentRoute.name == 'course_invite_students') {
        // Course invite
        course_org_id = this.$router.currentRoute.params.course_id
        console.log(`Inviting to course: ${course_org_id}`)

        this.uploading = true

        CourseAPI.inviteStudents(course_org_id, parsed_user_data)
        .then(res => {
          console.log(res)

          this.goToDashboard ()
        })
        .catch(err => {
          console.log(err)
        })

      }
      else {
        // TODO org invite
        console.error(`Org invite has not been implemented yet`)
      }

    },
    uploadExcel (e) {
      let file_ = e.target.files[0]
      
      let accepted_files = ['xlsx', 'xlsm', 'xlsb', 'xltx', 'xlr', 'xla']

      let filename = file_.name.split(".")
      if ( !accepted_files.includes(filename[ filename.length - 1 ]) ) {
        console.error (`Invalid file type ${filename[ filename.length - 1 ]}`)
        return;
      }

      this.excel_file = file_
      let fileReader = new FileReader ()
      fileReader.onload = () => {
        this.excel_binary = fileReader.result
      }
      fileReader.readAsBinaryString(file_)
    },
    initiateExcelUpload () {
      let file_uploader = document.getElementById(`excel_import_file`)
      if (!file_uploader) {
        console.error(`No file uploader found.`)
        return;
      }

      file_uploader.click ()
    }
  }
}
</script>
<style lang="scss">
.dark-mode {
  .invite-students-page, .uploading {
    background-color: #121419;
  }
}

.light-mode {
  .invite-students-page, .uploading {
    background-color: white;
  }
}

.invite-students-page {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 100;

  .uploading {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 101;

    .centerer {
      width: 300px;
      height: 300px;
      margin: 0 auto;
      position: relative;
      top: 30%;
    }
  }

  .center-container {
    width: 500px;
    margin: 0 auto;
    position: relative;
    top: 20%;

    .header {
      margin-bottom: 15px;
    }

    .single-invite {
      display: flex;

      .left-side {
        width: 70%;
        margin-right: 15px;
      }
      .right-side {
        width: 30%;
      }
    }

    .excel-invite {

      .button-area {
        margin-top: 20px;
      }

      .excel-sheet-file {
        border: 2px dashed #eee;
        border-radius: 5px;
        height: 100px;
        text-align: center;
        font-size: 1.2rem;
        cursor: pointer;
        position: relative;

        .remove-file {
          position: absolute;
          bottom: 0;
          right: 10px;
        }

        &.active {
          border: 2px dashed #47C4FC;
        }

        div {
          transform: translateY(30px);
        }
      }
    }
  }
}

</style>
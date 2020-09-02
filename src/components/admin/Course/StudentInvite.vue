<template>

  <div class="admin-student-invite">
    <h3>Admin > Student Invite</h3>

    <div class="field-area">
      <InputField2 
        v-model="course_id"
        :config="{
          label: 'Course ID',
          width: '100%'
        }"
      />
    </div>
    <div class="field-area">
      <div @click="uploadFile" :class="`input-area ${excel_file == null ? '' : 'active'}`">
        <div v-if="excel_file == null">Click to upload file</div>
        <div v-else>{{ excel_file.name }}</div>
        <input type="file" @change="setFile" ref="excelInput" />
      </div>
    </div>

    <div class="field-area">
      <Button2 
        :onClick="inviteStudents"
        text="Invite"
        :valid="fieldsSet()"
        :disabled="!fieldsSet()"
        :config="{
          width: '100%'
        }"
      />
    </div>

    <div class="field-area console">
      <div class="label">console</div>

      <div class="console-body">
        <div class="entry" v-for="(log, i) in console" :key="i">
          <div class="prefix">console log</div>
          {{log.body}}</div>
      </div>
    </div>
  </div>

</template>
<script>

import InputField2 from '@/components/InputField2.vue'
import Button2 from '@/components/Button2.vue'
import CourseAPI from '@/services/CourseAPI'
import xlsx from 'xlsx'
export default {
  name: 'AdminStudentInvite',
  components: {
    InputField2,
    Button2
  },
  data () {
    return {
      course_id: "",
      excel_file: null,
      console: [],
      excel_binary: null,
    }
  },
  created () {
    console.log(`IN STUDENT INVITE`)
  },
  methods: {
    log_(message) {
      this.console.push({
        body: message
      })
    },
    inviteStudents () {
      this.log_(`Inviting students to course ${this.course_id}`)
      if (this.excel_binary == null) {
        this.log_(`No excel binary`)
        return;
      }

      let xl_result = xlsx.read(this.excel_binary, {
        type: "binary"
      })

      if (Object.keys(xl_result.Sheets).length == 0) {
        this.log_(`Excel file doesn't have any sheets`)
      }

      let main_sheet = xl_result.Sheets[ Object.keys(xl_result.Sheets)[0] ]
      delete main_sheet['!ref']
      let keys_ = Object.keys(main_sheet)
      keys_.sort ()

      const getCol = (x) => {
        if (!x) return null
        return x.substring(0, 1)
      }
      const getRow = (x) => {
        return x.substring(1)
      }
      const col_map = {}

      let parsed_user_data = []
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
        if (!Object.prototype.hasOwnProperty.call( parsed_user_data[i], 'User Id' )) {
          parsed_user_data.splice(i, 1);
          continue;
        }
      }

      if (parsed_user_data.length == 0) {
        this.log_(`No users to add...`)
        return;
      }

      parsed_user_data = parsed_user_data.map(user => {
        return {
          first_name: user["First Name"],
          last_name:  user["Last Name"],
          user_id:  user["User Id"]
        }
      })

      console.log(parsed_user_data)
      CourseAPI.inviteStudentsCAS(this.course_id, parsed_user_data)
      .then(res => {
        console.log(`result`)
        console.log(res)

        if (res.data.success) {
          res.data.data.invites.forEach(invite_ => {
            this.log_(invite_.response)
          })
        }
        else {
          this.log_(`Problem occurred inviting students.`)
        }
      })
      .catch(err => {
        console.log(`ERR`)
        console.log(err)
      })
    },
    fieldsSet () {
      return this.course_id != "" && this.excel_file != null
    },
    uploadFile () {
      let ref_ = this.$refs.excelInput
      if (ref_) {
        ref_.click ()
      }
    },
    setFile (e) {
      let allowed_files = [`xlsx`, `xlsm`, `xltx`, `xltm`]
      if (e.target.files.length == 0) {
        console.error(`No file selected`)
        return;
      }

      let file_ext = e.target.files[0].name.split('.')
      if (!allowed_files.includes( file_ext[file_ext.length - 1] )) {
        console.error(`Invalid file type ${file_ext[file_ext.length - 1]}`)
        return;
      }

      this.excel_file = e.target.files[0]
      // try to parse the file
      this.log_(`Parsing [${this.excel_file.name}]`)

      let fileReader = new FileReader ()
      fileReader.onload = () => {
        this.excel_binary = fileReader.result
      }
      fileReader.readAsBinaryString(this.excel_file)

    }
  }
}
</script>
<style lang="scss">

.admin-student-invite {
  width: 400px;
  margin: 0 auto;
  position: relative;
  top: 100px;

  .field-area {
    margin-top: 20px;

    .input-area {
      border: 2px dashed #eee;
      height: 100px;
      border-radius: 5px;
      padding-top: 40px;
      text-align: center;
      cursor: pointer;

      input[type=file] {
        display: none;
      }

      &.active {
        border: 2px dashed #47C4FC;
      }
    }

    &.console {
      border: 1px solid rgba(0, 0, 0, 0.3);
      height: 250px;
      border-radius: 5px;
      position: relative;

      .label {
        position: absolute;
        top: 5px;
        left: 10px;
        text-transform: uppercase;
        font-size: 0.8rem;
        font-weight: 600;
        background-color: white;
        padding: 2px 5px;
        opacity: 0.9;
        box-shadow: 0px 3px 5px rgba(0, 0, 0, 0.15);
        cursor: pointer;
      }

      .console-body {
        padding-top: 40px;
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        padding-left: 15px;
        padding-right: 15px;

        .entry {
          margin-bottom: 10px;
          

          .prefix {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
          }
        }
      }
    }
  }
}

</style>
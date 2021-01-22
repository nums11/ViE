<template>
  <sui-modal v-model="show_modal">
    <sui-modal-header class="center-text">
      Delete Recurring Meeting
    </sui-modal-header>
    <sui-modal-content scrolling class="center-text">
      <sui-form style="margin-top:0;">
        <sui-form-field>
          <div class="ui radio checkbox">
            <input type="radio" name="checked_value"
            checked="checked" @click="selectValue(1)">
            <label>This Meeting</label>
          </div>
        </sui-form-field>
        <sui-form-field>
          <div class="ui radio checkbox">
            <input type="radio" name="checked_value"
            @click="selectValue(2)">
            <label>All meetings</label>
          </div>
        </sui-form-field>
        <div class="mt-2">
          <sui-button @click="deleteMeeting"
            animated size="small"
            style="background-color:#FF0000; color:white;">
            <sui-button-content visible>
              Delete Meeting
            </sui-button-content>
            <sui-button-content hidden>
              <sui-icon name="trash" />
            </sui-button-content>
          </sui-button>
        </div>
      </sui-form>
    </sui-modal-content>
    <sui-modal-actions>
      <sui-button @click="hideModal">
        Cancel
      </sui-button>
    </sui-modal-actions>
  </sui-modal>
</template>

<script>
export default {
  name: 'MeetingDeletionModal',
  props: {

  },
  components: {

  },
  data () {
    return {
      show_modal: false,
      value: 1
    }
  },
  computed: {

  },
  created () {
  },
  mounted () {
  },
  methods: {
    selectValue(value) {
      this.value = value
    },
    showModal() {
      this.show_modal = true
    },
    hideModal() {
      this.show_modal = false
    },
    deleteMeeting() {
      const delete_all_recurring = this.value === 2
      this.$emit('delete-meeting', delete_all_recurring)
      this.hideModal()
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
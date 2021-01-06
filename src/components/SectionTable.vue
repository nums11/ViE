<template>
  <div class="section-table">
    <div class="bold">
      {{ table_name }} ({{ students.length }})
    </div>
    <div class="table">
      <div class="table-wrapper">
        <sui-table v-if="table_name === 'Students' ||
        table_name === 'Pending Approval Students'" striped>
          <sui-table-header>
            <sui-table-row>
              <sui-table-header-cell>First Name</sui-table-header-cell>
              <sui-table-header-cell>Last Name</sui-table-header-cell>
              <sui-table-header-cell>User ID</sui-table-header-cell>
              <sui-table-header-cell>Email</sui-table-header-cell>
              <sui-table-header-cell v-if="table_name === 'Students'">
                Remove
              </sui-table-header-cell>
              <sui-table-header-cell
              v-if="table_name === 'Pending Approval'">
                Approve
              </sui-table-header-cell>
              <sui-table-header-cell
              v-if="table_name === 'Pending Approval'">
                Deny
              </sui-table-header-cell>
            </sui-table-row>
          </sui-table-header>
          <sui-table-body>
            <sui-table-row v-for="student in students"
            :key="student.user_id">
              <sui-table-cell>
                {{ student.first_name }}
              </sui-table-cell>
              <sui-table-cell>
                {{ student.last_name }}
              </sui-table-cell>
              <sui-table-cell>
                {{ student.user_id }}
              </sui-table-cell>
              <sui-table-cell>
                {{ student.email }}
              </sui-table-cell>
              <sui-table-cell v-if="table_name === 'Students'">
                <sui-button class="table-btn" size="mini"
                color="red">
                  <sui-icon name="x"/>
                </sui-button>
              </sui-table-cell>
              <sui-table-cell v-if="table_name === 'Pending Approval'">
                <sui-button class="table-btn" size="mini"
                color="#e83e8c">
                  <sui-icon name="check"/>
                </sui-button>
              </sui-table-cell>
              <sui-table-cell v-if="table_name === 'Pending Approval'">
                <sui-button class="table-btn" size="mini"
                color="red">
                  <sui-icon name="x"/>
                </sui-button>
              </sui-table-cell>
            </sui-table-row>
          </sui-table-body>
        </sui-table>
        <sui-table v-else striped>
          <sui-table-header>
            <sui-table-row>
              <sui-table-header-cell>User ID</sui-table-header-cell>
              <sui-table-header-cell>Cancel Invite</sui-table-header-cell>
            </sui-table-row>
          </sui-table-header>
          <sui-table-body>
            <sui-table-row v-for="student in students"
            :key="student.user_id">
              <sui-table-cell>
                {{ student.user_id }}
              </sui-table-cell>
              <sui-table-cell>
                <sui-button class="table-btn" size="mini"
                color="grey">
                  <sui-icon name="x"/>
                </sui-button>
              </sui-table-cell>
            </sui-table-row>
          </sui-table-body>
        </sui-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionTable',
  props: {
    table_name: {
      type: String,
      required: true
    },
    students: {
      type: Array,
      required: true
    }
  },
  components: {
  },
  data () {
    return {

    }
  },
  async created () {

  },
  mounted () {
  },
  methods: {

  },
}
</script>

<style scoped>
.section-table {
  margin-top: 2rem;
}

.table{
  max-height: 20rem;
  overflow-y: auto;
  margin-top: 1rem;
}

.table-wrapper {
  width: 99%;
}
.table-btn {
  width: 3rem;
}
</style>
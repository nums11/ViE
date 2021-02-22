<template>
  <sui-table celled selectable>
    <sui-table-header>
      <sui-table-row>
        <sui-table-header-cell colspan="1">
          Name
        </sui-table-header-cell>
        <sui-table-header-cell colspan="1">
          User Id
        </sui-table-header-cell>
      </sui-table-row>
    </sui-table-header>
    <sui-table-body>
      <sui-table-row v-for="(student,index) in students"
      style="cursor:pointer;" @click="$emit('select-row',index)">
        <sui-table-cell>{{ student.student_name }}</sui-table-cell>
        <sui-table-cell>{{ student.user_id }}</sui-table-cell>
      </sui-table-row>
    </sui-table-body>
  </sui-table>
</template>

<script>
export default {
  name: 'StudentInsightsTable',
  props: {
    students: {
      type: Array,
      required: true
    }
  }
}
</script>
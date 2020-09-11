<template>
  <div>
    <table class="table table-hover">
        <thead>
        <tr>
          <th>first_name</th>
          <th>last_name</th>
          <th>user_id</th>
        </tr>
        </thead>
        <tbody>
            <tr v-for="instructor in instructors" :key="instructor._id">
              <td>{{ instructor.first_name }}</td>
              <td>{{ instructor.last_name }}</td>
              <td>{{ instructor.user_id }}</td>
              <td><button class="btn btn-secondary" @click.prevent="$emit('select-instructor', instructor)">Select</button></td>
            </tr>
        </tbody>
    </table>
  </div>
</template>

<script>
  import UserAPI from '@/services/UserAPI.js';
	
	export default {
    name: 'Instructors',
		data() {
			return {
				instructors: []
			}
		},
		created() {
     	this.loadInstructors()
		},
		methods: {
      async loadInstructors(){
        const response = await UserAPI.getInstructors()
        this.instructors = response.data
      }
		}
	}

</script>
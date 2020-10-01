<template>
  <div>
    <h1>Redirecting... please wait...</h1>
  </div>
</template>

<script>
  export default {
    async created() {
    	let optional_meeting_id = this.$route.params.optional_meeting_id
    	let optional_code = this.$route.params.optional_code
      await this.$store.dispatch('loginCAS')
  	  if(optional_meeting_id === "null") {
  	  	this.$router.push({name: 'dashboard'})
  	  } else {
  	  	this.$router.push({name: 'attend_checker',
  	  		params: {
  	  			meeting_id: optional_meeting_id,
  	  			code: optional_code
  	  		}
  			})
  	  }
    }
  }
</script>

<style scoped>

</style>

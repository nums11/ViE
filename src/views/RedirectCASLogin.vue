<template>
  <div>
    <h1>Redirecting... please wait...</h1>
  </div>
</template>

<script>
  export default {
    created() {
    	let optional_meeting_id = this.$route.params.optional_meeting_id
    	let optional_code = this.$route.params.optional_code
      this.$store.dispatch('loginCAS').then(() => {
    	  if(optional_meeting_id === "null") {
    	  	console.log("User logged in from regular cas. Optinonal code should be null",
    	  		optional_code)
    	  	console.log("User", this.$store.state.user)
    	  	this.$router.push({name: 'dashboard'})
    	  } else {
    	  	console.log("User logged in from QR Scan. Optional code should be set",
    	  		optional_code)
    	  	this.$router.push({name: 'attend_checker',
    	  		params: {
    	  			meeting_id: meeting_id,
    	  			code: optional_code
    	  		}
    			})
    	  }
      })
    }
  }
</script>

<style scoped>

</style>

<template>
  <div>
    <h1>Redirecting... please wait...</h1>
  </div>
</template>

<script>
  export default {
    async created() {
    	const optional_meeting_id = this.$route.params.optional_meeting_id
      const optional_qr_scan_id = this.$route.params.optional_qr_scan_id
    	const optional_code = this.$route.params.optional_code
      const first_login = this.$route.params.first_login
      await this.$store.dispatch('loginCAS')
  	  if(optional_meeting_id === "null") {
        if(first_login === 'true')
  	  	  this.$router.push({name: 'dashboard', params: {first_login: true}})
        else
          this.$router.push({name: 'dashboard'})
  	  } else {
  	  	this.$router.push({name: 'attend_checker',
  	  		params: {
  	  			meeting_id: optional_meeting_id,
            qr_scan_id: optional_qr_scan_id,
  	  			code: optional_code
  	  		}
  			})
  	  }
    }
  }
</script>

<style scoped>

</style>

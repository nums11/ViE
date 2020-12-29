<template>
  <div id="main">
    <h1 class="form-header">
      {{ is_register ? 'Register Course' : 'Join Course' }}
    </h1>
    <RegisterCourse v-if="is_register"/>
    <JoinCourse v-else />
  </div>
</template>

<script>
import RegisterCourse from '@/components/RegisterCourse'
import JoinCourse from '@/components/JoinCourse'

export default {
  name: 'RegisterJoinCourse',
  components: {
    RegisterCourse,
    JoinCourse
  },
  data () {
    return {
      is_register: Boolean
    }
  },
  created () {
    this.is_register = this.$route.name === 'register_course'
  }
}
</script>

<style scoped>
#main {
  width: 50%;
  margin: auto;
  margin-top: 3rem;
  text-align: center;
  overflow-y: auto;
  padding-bottom: 5rem;
}

/deep/ #btn-container {
  margin-top: 4rem;
}

/* Tablets */
@media (max-width: 1128px) {
  #main {
    width: 95%;
  }
}

</style>
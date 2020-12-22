<template>
  <div class="testimonial-card">
    <div class="card-header">
      <div class="header-text" id="name">{{ instructor_name }}</div>
      <div class="header-text" id="dept">{{ instructor_dept }}</div>
    </div>
    <p class="testimonial">"{{ testimonial }}"</p>
  </div>
</template>

<script>

export default {
  name: 'TestimonialCard',
  props: {
    instructor_name: {
      type: String,
      required: true
    },
    instructor_dept: {
      type: String,
      required: true
    },
    testimonial: {
      type: String,
      required: true
    },
  },
  components: {

  },
  data(){
    return {
    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>
.testimonial-card {
  height: 25rem;
  width: 30rem;
  border: #c7c7c7 solid thin;
  border-radius: 5px;
  display: inline-block;
  vertical-align: top;
  box-shadow: 0px 3px 5px #c7c7c7;
  background-color: white;
  margin-top: 4rem;
}

.card-header {
  height: 4rem;
  width: 90%;
  margin: auto;
  border-bottom: #c7c7c7 solid thin;
}

.header-text {
  display: inline-block;
  vertical-align: top;
  margin-top: 2rem;
}

#name {
  float: left;
  font-weight: bold;
  font-size: 1.25rem;
}

#dept {
  float: right;
}

.testimonial {
  width: 90%;
  margin: auto;
  margin-top: 1.5rem;
}

/* Tablets */
@media (max-width: 1128px) {
  .testimonial-card {
    width: 80%;
  }
  #name {
    font-size: 1.5rem;
  }
  #dept {
    font-size: 1.25rem;
  }
  .testimonial {
    font-size: 1.25rem;
  }
}

@media (max-width: 744px) {
  .testimonial-card {
    width: 90%;
    height: 45rem;
  }
}

</style>
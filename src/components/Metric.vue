<template>
  <div class="metric inline-block center-text">
    <h3 class="navy-blue header">{{ header }}</h3>
    <p>{{ sub_header }}</p>
    <p class="percentage">{{ percentage }}%</p>
  </div>
</template>

<script>
export default {
  name: 'Metric',
  props: {
    header: {
      type: String,
      required: true
    },
    sub_header: {
      type: String,
      required: true
    },
    percentage: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.metric {
  width: 23rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.header {
  height: 3.5rem;
}

.sub-header {
  border: black solid;
  height: 3.1rem;
}

.percentage {
  font-size: 7.5rem;
  font-weight: bold;
  color: #00B3FF;
  margin-bottom: 0;
}
</style>
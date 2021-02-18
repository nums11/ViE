<template>
  <div :class="`metric inline-block center-text ${size}`">
    <h3 :class="`navy-blue header ${size}`">{{ header }}</h3>
    <p class="sub-header" v-if="sub_header != null">
      {{ sub_header }}
    </p>
    <p :class="`percentage ${size}`">{{ percentage }}%</p>
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
      type: String
    },
    percentage: {
      type: String,
      required: true
    },
    size: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.metric {
  width: 100%;
  padding-left: 1rem;
  padding-right: 1rem;
}

.metric.medium {
  width: 23rem;
}

.metric.large {
  width: 35rem;
}

.header {
  height: 3.5rem;
}

.header.small {
  font-size: 1.1rem;
  margin-bottom: 0;
  height: 2rem;
}

.sub-header {
  height: 3.1rem;
}

.percentage {
  font-weight: bold;
  color: #00B3FF;
  margin-bottom: 0;
}

.percentage.small {
  font-size: 5rem;
}

.percentage.medium {
  font-size: 7.5rem;
}

.percentage.large {
  font-size: 10rem;
}
</style>
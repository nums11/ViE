<template>

    <div class="venue-progress-bar">
        <div class="progress-bar-wrapper">
            <div class="progress-bar-filler" :style="{width: `${value * 100}%`}"></div>
        </div>
        <div class="progress-bar-value">{{ getPercent() }} {{ suffix }}</div>
    </div>

</template>
<script>
export default {
    name: 'ProgressBar',
    props: {
        value: Number,
        suffix: String
    },
    methods: {
        getPercent () {
            return `${(this.value * 100).toFixed(2)}%`
        }
    }
}
</script>
<style lang="scss">

.venue-progress-bar {
    display: flex;
    align-items: center;

    .progress-bar-wrapper {
        min-width: 200px;
        height: 6px;
        background-color: white;
        margin-right: 10px;
        border-radius: 10px;

        .progress-bar-filler {
            background-color: #5EFFB4;
            height: 100%;
            border-radius: 10px;
        }
    }

    .progress-bar-value {
        font-size: 0.85rem;
    }
}

</style>
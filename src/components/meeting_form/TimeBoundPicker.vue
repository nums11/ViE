<template>

    <div class="time-bound-picker">
        <div class="left-side">
            <div>Start</div>
            <div>
                <VueCtkDateTimePicker 
                    @input="updateTime($event, 'start_time')"
                    v-model="start_time_local"
                    :min-date="config.min_start_time" />
            </div>
        </div>
        <div class="separator"></div>
        <div class="right-side">
            <div>End</div>
            <div>
                <VueCtkDateTimePicker 
                    @input="updateTime($event, 'end_time')"
                    v-model="end_time_local"
                    :min-date="start_time_local" />
            </div>
        </div>
    </div>

</template>
<script>
export default {
    name: 'TimeBoundPicker',
    props: {
        config: Object,
        updateTime: Function,

        start_time_iso: String,
        end_time_iso: String
    },
    created () {
        this.start_time_local = this.start_time_iso
        this.end_time_local = this.end_time_iso
    },
    updated () {
        this.start_time_local = this.start_time_iso
        this.end_time_local = this.end_time_iso
    },
    data () {
        return {
                start_time_local: String,
                end_time_local: String
            }
        }
}
</script>
<style lang="scss">
.time-bound-picker {
    display: flex;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 20px;

    .left-side {
        width: 150px;
    }
    .separator {
        flex-grow: 1;
    }
    .right-side {
        width: 150px;
        text-align: right;
    }
}
</style>
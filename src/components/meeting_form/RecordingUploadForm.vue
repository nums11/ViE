<template>

    <div>
        <div><h3>Upload Video Recording</h3></div>

        <div class="file-upload-area">
            <input type="file" @change="handleRecordingUpload($event, task_id)" />
        </div>

        <div>
            <TimeBoundPicker 
                :start_time_iso="start_time"
                :end_time_iso="end_time"
                :updateTime="updateTime"
                :config="{
                    min_start_time: (new Date()).toISOString ()
                }"
            />
        </div>

    </div>

</template>
<script>

import TimeBoundPicker from '@/components/meeting_form/TimeBoundPicker.vue'
import '@/libs/uikit/uikit.js';
export default {
    name: 'RecordingUploadForm',
    components: {
        TimeBoundPicker
    },
    props: {
        task_id: Number,
        handleRecordingUpload: Function,
        start_time: String,
        end_time: String,
        updateTimeState: Function
    },
    created () {

    },
    methods: {
        updateTime (new_time, type) {
            this.updateTimeState(this.task_id, new_time, type);
        }
    }
}
</script>
<style lang="scss">

</style>
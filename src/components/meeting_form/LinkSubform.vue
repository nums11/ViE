<template>

    <div class="link-subform">
        <sui-form>

                <div>
                    <TimeBoundPicker
                        :start_time_iso="link_start_time"
                        :end_time_iso="link_end_time"
                        :updateTime="updateTime"
                        :config = "{
                            min_start_time: (new Date()).toISOString ()
                        }"
                    />
                </div>
                
            <sui-form-field>
            <label>Link Title</label>
                <input @input="updateLinkTitle($event, task_id)" />
            </sui-form-field>
            <sui-form-field>
                <input @input="updateLinkURL($event, task_id)" placeholder="URL (https://www.google.com)" />
            </sui-form-field>
        </sui-form>
    </div>

</template>
<script>
import TimeBoundPicker from '@/components/meeting_form/TimeBoundPicker.vue'
export default {
    name: 'LinkSubform',
    components: {
        TimeBoundPicker
    },
    props: {
        updateLinkTitle: Function,
        updateLinkURL: Function,
        task_id: Number,
        updateTimeState: Function
    },
    data () {
        return {
            link_start_time: (new Date()).toISOString(),
            link_end_time: (new Date()).toISOString()
        }
    },
    methods: {
        updateTime (new_time, type) {
            console.log(`Time Updated`)
            if (type == 'start_time') this.link_start_time = new_time
            if (type == 'end_time') this.link_end_time = new_time

            this.updateTimeState (this.task_id, new_time, type)
        }
    }
}
</script>
<style lang="scss">

</style>
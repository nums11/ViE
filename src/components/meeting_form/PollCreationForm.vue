<template>

    <div class="poll-creation-form meeting-subforms">
        <div class="area-title"><h4>New Poll/Quiz</h4></div>
        <div class="subtitle">Create a poll or quiz for your students to answer.</div>

        <TimeBoundPicker
        
            :start_time_iso="poll_start_time"
            :end_time_iso="poll_end_time"
            :updateTime="updateTime"
            :config = "{
                min_start_time: (new Date()).toISOString ()
            }"
        />

        <div class="poll-questions-form">

            <div class="questions-area">
                
                <PollQuestionSubform 
                    v-for="(question, i) in questions" 
                    :key="i"
                    :question_number="i"
                    :question_data="question"
                    :updateQuestion="updateQuestion"
                    :addOption="addOption"
                    :removeOption="removeOption"
                    :updateOption="updateOption"
                />

            </div>

            <div :style="{marginTop: '40px'}">
                <sui-button @click="addQuestion" content="Add Question" icon="plus" label-position="left" class="venue-blue" />
                <sui-button @click="_log">Log</sui-button>
            </div>
        </div>
    </div>

</template>
<script>

import TimeBoundPicker from '@/components/meeting_form/TimeBoundPicker.vue'
import PollQuestionSubform from '@/components/meeting_form/PollQuestionSubform.vue'

export default {
    name: 'PollCreationForm',
    components: {
        TimeBoundPicker,
        PollQuestionSubform
    },
    data () {
        return {
            poll_start_time: (new Date ()).toISOString (),
            poll_end_time: (new Date()).toISOString (),
            questions: []
        }
    },
    methods: {
        _log () {
            console.log(this.questions)
        },
        addOption (question_index) {
            this.questions[question_index].options.push({
                value: ""
            })

            this.$forceUpdate ()
        },
        updateOption (e, question_index, option_index) {
            let new_option_value = e.target.value

            this.questions[question_index].options[option_index].value = new_option_value
        },
        removeOption (question_index, option_index) {
            console.log(`Removing option index ${option_index}`)
            this.questions[question_index].options.splice(option_index, 1)
        },
        updateQuestion (question_index) {
            console.log(`Update question ${question_index}`)
        },
        updateTime (new_time, type) {
            console.log(`Time Updated`)
            if (type == 'start_time') this.poll_start_time = new_time
            if (type == 'end_time') this.poll_end_time = new_time
        },
        addQuestion () {
            this.questions.push({
                question: "",
                options: []
            })
        }
    }
}

</script>
<style lang="scss">

.poll-questions-form {
    margin-top: 10px;
}
</style>
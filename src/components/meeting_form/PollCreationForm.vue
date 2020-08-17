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
                    :removeQuestion="removeQuestion"
                />

            </div>

            <div :style="{marginTop: '40px'}">
                <sui-button @click="addQuestion" content="Add Question" icon="plus" label-position="left" class="venue-blue" />
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
    props: {
        task_id: Number,
        setPollData: Function,
        updateTimeState: Function
    },
    methods: {
        _log () {
            console.log(this.questions)
        },
        removeQuestion (question_index) {
            console.log(`Removing question: ${question_index}`)
            this.questions.splice(question_index, 1)

            this.setPollData(this.task_id, this.questions)
        },
        addOption (question_index) {
            this.questions[question_index].options.push({
                value: ""
            })


            this.setPollData(this.task_id, this.questions)
            this.$forceUpdate ()
        },
        updateQuestion (e, question_index) {
            this.questions[question_index].question = e.target.value

            
            this.setPollData(this.task_id, this.questions)
        },
        updateOption (e, question_index, option_index) {
            let new_option_value = e.target.value

            this.questions[question_index].options[option_index].value = new_option_value
            this.setPollData(this.task_id, this.questions)
        },
        removeOption (question_index, option_index) {
            console.log(`Removing option index ${option_index}`)
            this.questions[question_index].options.splice(option_index, 1)
            
            this.setPollData(this.task_id, this.questions)
        },
        updateTime (new_time, type) {
            console.log(`Time Updated`)
            if (type == 'start_time') this.poll_start_time = new_time
            if (type == 'end_time') this.poll_end_time = new_time

            this.updateTimeState (this.task_id, new_time, type)
        },
        addQuestion () {
            this.questions.push({
                question: "",
                options: []
            })

            
            this.setPollData(this.task_id, this.questions)
        }
    }
}

</script>
<style lang="scss">

.poll-questions-form {
    margin-top: 10px;
}
</style>
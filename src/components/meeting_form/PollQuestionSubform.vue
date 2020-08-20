<template>

    <div class="poll-question-subform">

        <sui-form>
            <sui-form-field>
            <label>Question {{question_number + 1}}
                <div class="remove-question-icon" @click="removeQuestion(question_number)"><i class="close icon"></i></div>
            </label>
            <input
                v-bind:value="question_data.question"
                v-on:input="updateQuestion($event, question_number)"
            />
            </sui-form-field>

            <div class="question-choice-area">
                <div :key="option_index" v-for="(option, option_index) in question_data.options" class="option-choice">
                    <div class="cancel-icon" @click="removeOption(question_number, option_index)">
                        <i class="close icon"></i>
                    </div>
                    <div class="option-input">
                    
                        <sui-form-field>
                            <input 
                                :placeholder="`Option ${option_index + 1}`"
                                v-bind:value="option.value" 
                                v-on:input="updateOption($event, question_number, option_index)" />
                        </sui-form-field>

                    </div>
                </div>
            </div>

            <div class="question-action-area">
                <sui-button @click="addOption(question_number)" content="Add Option" icon="plus" label-position="left" class="venue-blue" />
            </div>
        </sui-form>

    </div>

</template>

<script>
export default {
    name: 'PollQuestionSubform',
    props: {
        question_number: Number,
        question_data: Object,
        updateQuestion: Function,
        addOption: Function,
        removeOption: Function,
        updateOption: Function,
        removeQuestion: Function,
        updateQuestion: Function
    },
    method: {
    }
}
</script>

<style lang="scss">
.poll-question-subform {
    margin-bottom: 30px;

    .remove-question-icon {
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        display: inline-block;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 02.5s;

        &:hover {
            opacity: 0.9;
        }
    }

    .question-choice-area {
        margin-left: 40px;

        .option-choice {
            margin-bottom: 10px;
            display: flex;

            .cancel-icon {
                width: 40px;
                height: 40px;
                line-height: 40px;
                cursor: pointer;
                opacity: 0.7;
                text-align: center;
                transition: opacity 0.25s;

                &:hover {
                    opacity: 0.9;
                }
            }

            .option-input {
                flex-grow: 1;
            }
        }
    }

    .question-action-area {
        margin-left: 40px;
    }
}
</style>
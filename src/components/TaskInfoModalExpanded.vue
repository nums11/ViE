<template>

    <div class="task-info-modal-expanded">

        <!-- Title Area -->
        <div class="title-bar">
            <div class="title">Title Goes Here</div>
            <div class="sibtitle">Subtitle goes here</div>
        </div>

        <!-- Content Area-->
        <div class="content-area">

            <!-- <sui-form>
                <sui-form-fields grouped>
                    <label for="second_fruit" :style="{marginBottom: '20px'}">Place the poll questions here</label>
                    <sui-form-field>
                        <sui-checkbox radio name="answer_1" label="Answer 1" value="Answer 1" />
                    </sui-form-field>
                    <sui-form-field>
                        <sui-checkbox radio name="answer_2" label="Answer 2" value="Answer 2" />
                    </sui-form-field>
                    <sui-form-field>
                        <sui-checkbox radio name="answer_3" label="Answer 3" value="Answer 3" />
                    </sui-form-field>
                    <sui-form-field>
                        <sui-checkbox radio name="answer_4" label="Answer 4" value="Answer 4" />
                    </sui-form-field>
                </sui-form-fields>
            </sui-form> -->

        </div>

        <div class="footer-area">
            <div class="left-side">
                <sui-button @click="cancelTask">Cancel</sui-button>
            </div>
            <div class="right-side">
                <sui-button loading content="Loading" class="venue-blue" />
            </div>
        </div>

    </div>

</template>

<script>
export default {
    name: 'TaskInfoModalExpanded',
    props: {
        taskInfo: Object,
        cancelTask: Function
    }
}
</script>

<style lang="scss">
    .task-info-modal-expanded {
        border-radius: 3px;
        min-height: 550px;
        box-sizing: border-box;
        padding: 10px 20px;
        position: relative;
        .title-bar {
            border-bottom: 1px solid rgba(0, 0, 0, 0.2);
            div {
                display: inline-block;
                margin-right: 12px;
            }
            .title {
                font-size: 1.2rem;
                font-weight: 600;
            }
        }
        .content-area {
            margin-top: 30px;
        }
        .footer-area {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            border-top: 1px solid rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            box-sizing: border-box;
            padding: 0 10px;
            .left-side {
                flex-grow: 1;
            }
        }
    }
    .dark-mode .task-info-modal-expanded {
        background-color: #22252e;
    }
    .light-mode .task-info-modal-expanded {
        background-color: white;
        box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
    }
</style>
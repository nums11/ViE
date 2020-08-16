<template>

    <div class="manage-students-area">
    
        <div class="action-row">
            <div class="left-side">
                <div :style="{fontSize: '1.2rem'}">32 Students</div>
                <div :style="{fontSize: '0.9rem'}">5 students selected</div>
            </div>
            <div class="right-side">
                <sui-button>Actions</sui-button>
                <sui-button class="venue-blue">Invite Students To Course</sui-button>
            </div>
        </div>

        <div class="student-list">
        <div class="student-row-header">
                <div class="checkbox-area">
                    <sui-checkbox />
                </div>
                <div class="first-name-area">First Name</div>
                <div class="last-name-area">Last Name</div>
                <div class="email-area">Email</div>
            </div>
            <div v-for="i in 32" :key="i" :class="'student-row ' + (i == 3 ? 'active' : '')">
                <div class="checkbox-area">
                    <sui-checkbox />
                </div>
                <div class="first-name-area">Jimmy</div>
                <div class="last-name-area">Johns</div>
                <div class="email-area">myemail@email.com</div>
            </div>
        </div>

    </div>

</template>
<script>

export default {
    name: 'ManageStudents'
}

</script>
<style lang="scss">

    .manage-students-area {

        .action-row {
            height: 50px;
            display: flex;
            align-items: center;

            .left-side {
                flex-grow: 1;
                div {
                    display: inline-block;
                    margin-right: 20px;
                }
            }

            .right-side {

            }
        }

        .student-list {

            .student-row-header {
                display: flex;
                align-items: center;
                height: 35px;

                .checkbox-area {
                    width: 100px;
                    text-align: center;
                }

                .first-name-area {
                    width: 20%;
                }

                .last-name-area {
                    width: 20%;
                }

                .email-area {

                }
            }

            .student-row {
                transition: background-color 0.25s;
                cursor: pointer;
                display: flex;
                align-items: center;
                height: 35px;

                .checkbox-area {
                    width: 100px;
                    text-align: center;
                }

                .first-name-area {
                    width: 20%;
                }

                .last-name-area {
                    width: 20%;
                }

                .email-area {

                }
            }

            .student-row.active {
                
            }

        }
    }

    .dark-mode {
        .manage-students-area {

            .student-list {

                .student-row-header {
                    background-color: #0e0f12;
                }

                .student-row:hover {
                    background-color: #22252e;
                }
                .student-row.active {
                    background-color: #2f3340;
                }
            }

        }
    }

    .light-mode {
        .manage-students-area {

            .student-list {

                .student-row-header {
                    background-color: rgba(0, 0, 0, 0.1);
                }

                .student-row:hover {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                .student-row.active {
                    background-color: rgba(0, 0, 0, 0.07);
                }
            }
        }
    }

</style>
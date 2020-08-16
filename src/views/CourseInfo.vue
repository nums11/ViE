<template>

    <div class="course-info">

        <div class="header">

            <!-- Page Title -->
            <div class="page-title">Course Info</div>
            <div class="page-info-area">

                <!-- Meeting Info Side -->
                <div class="left-side">
                    <h2>Data Structures</h2>
                    <div class="details-area">
                        <sui-label :style="{marginBottom: '5px'}">
                            Section
                            <sui-label-detail>1</sui-label-detail>
                        </sui-label>

                        <sui-label class="venue-red" :style="{marginBottom: '5px'}">
                            Dept
                            <sui-label-detail>CSCI 1200</sui-label-detail>
                        </sui-label>

                        <sui-label :style="{marginBottom: '5px'}">
                            Time Block
                            <sui-label-detail>3:00pm - 4:00pm</sui-label-detail>
                        </sui-label>
                    </div>
                </div>

                <div class="right-side">
                  
                  <div class="tabs">
                    <ul>
                      <li @click="activeTab = 'meeting_history'" :class="activeTab == 'meeting_history' ? 'active' : ''">Meeting History</li>
                      <li @click="activeTab = 'statistics'" :class="activeTab == 'statistics' ? 'active' : ''">
                        <div class="icon-box"><span class="icon-bar-chart"></span></div>
                        <div>Statistics</div>
                      </li>
                      <li v-if="showManageStudents" @click="activeTab = 'manage_students'" :class="activeTab == 'manage_students' ? 'active' : ''">Manage Students</li>
                      <li @click="activeTab = 'settings'" :class="activeTab == 'settings' ? 'active' : ''">
                        <div class="icon-box"><span class="icon-gear"></span></div>
                        <div>Settings</div>
                      </li>
                    </ul>
                  </div>

                  <div class="actions">
                    <router-link to="/meeting/new/asmple_section_id">
                      <sui-button
                        class="labeled
                        icon venue-green"
                          icon="plus"
                          button
                        >
                        Create New Meeting
                      </sui-button>
                    </router-link>
                  </div>

                </div>
            </div>
        </div>

        <!-- Sidebar Area -->
        <div class="sidebar-area">
            
            <transition
                name="fade"
                mode="out-in"
              >
              <div class="manage-students-section-selector" key="1" v-if="activeTab == 'manage_students'">
                <ul>
                  <li class="active">Section 1</li>
                  <li>Section 2</li>
                  <li>Section 3</li>
                  <li>Section 4</li>
                </ul>
              </div>
              
              <!-- Sidebar Statistics Controller -->
              <div class="statistics-controller-sidebar" key="2" v-if="activeTab == 'statistics'">
                
                <!-- Sections Selector -->
                <div class="section-selector">
                  <sui-button 
                    :style="{backgroundColor: `${statisticsSections[section].display ? colorSets[index].stroke : '#e8e8e8'}`}"
                    v-for="(section, index) in Object.keys(statisticsSections)" @click="toggleSectionStatistics(section)">Section X</sui-button>
                </div>
              </div>
            </transition>

        </div>

        <div class="top-spacer"></div>
        <div class="content-area-wrapper">
            <div class="left-spacer"></div>

            <!-- Content Area -->
            <div class="content-area">

              <transition
                name="fade"
                mode="out-in"
              >
                <div v-if="activeTab == 'meeting_history'" key="1">
                  <h3>January</h3>
                  <div class="attendance-for-month">
                    <MeetingAttendancePill v-for="i in 20" :key="i" />
                  </div>
                </div>

                <!-- For instructors, show CourseStatistics. -->
                <!-- For students, show StudentStatistics. -->
                <CourseStatistics
                  v-if="activeTab == 'statistics'"
                  key="2"
                  :sections="statisticsSections"
                  :colorSets="colorSets"
                />

                <ManageStudents v-if="activeTab == 'manage_students'" />
              </transition>

            </div>
        </div>

    </div>

</template>

<script>

import MeetingAttendancePill from "@/components/MeetingAttendancePill"
import ManageStudents from "@/components/ManageStudents.vue"
import CourseStatistics from "@/components/CourseStatistics.vue"

export default {
    name: 'CourseInfo',
    components: {
      MeetingAttendancePill,
      ManageStudents,
      CourseStatistics
    },
    data () {
      return {
        activeTab: 'meeting_history',
        showManageStudents: true,
        statisticsSections: {},
        colorSets: [],

        // TODO NUMFOR
        /*
        In this.getMeetingInfo (), store the meeting info into this objecct.
        */
        meeting_info: {}
      }
    },
    methods: {
      // TODO NUMFOR
      getMeetingInfo () {
        // Fetch the meeting info from the server and store it in the data variable `meeting_info`
        
      },
      // END TODO NUMFOR
      disableMobileTabs (e) {
        let width = e.target.outerWidth
        if (width < 950 && this.activeTab == 'manage_students') {
          this.activeTab = 'meeting_history';
          this.showManageStudents = false
        }
        if  (width >= 950 && !this.showManageStudents) this.showManageStudents = true
      },
      toggleSectionStatistics(section) {
        this.statisticsSections[section].display = !this.statisticsSections[section].display
      }
    },
    created () {

      this.getMeetingInfo ();

      this.statisticsSections = {
        1: {
          display: true
        },
        2: {
          display: false
        },
        3: {
          display: true
        },
        4: {
          display: false
        }
      }

      this.colorSets = [{
          fill: 'rgba(255, 94, 94, 0.4)',
          stroke: 'rgba(255, 94, 94, 1)',
      },{
          fill: 'rgba(71, 196, 252, 0.4)',
          stroke: 'rgba(71, 196, 252, 1)'
      },{
          fill: 'rgba(94, 255, 180, 0.4)',
          stroke: 'rgba(94, 255, 180, 1)'
      },{
          fill: 'rgba(252, 149, 71, 0.4)',
          stroke: 'rgba(252, 149, 71, 1)'
      }]

      // attach resize function to window
      window.addEventListener('resize', this.disableMobileTabs)
    }
}

</script>

<style lang="scss">

.course-info {

    // Header, With title and Schedule Slider
    .header {
        position: fixed;
        left: 155px;
        right: 50px;
        z-index: 3;

        .page-title {
            font-weight: 600;
        }

        .page-info-area {
            display: flex;

            .left-side {
                width: 360px;
                min-width: 360px;
            }

            .right-side {
                width: 75%;
                position: relative;

                .actions {
                  text-align: right;
                }

                .tabs {
                  position: absolute;
                  bottom: 0;
                  left: 0;

                  ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;

                    li {
                      display: inline-block;
                      padding: 0 15px;
                      height: 30px;
                      font-weight: 600;
                      cursor: pointer;
                      transition: border 0.25s, border-bottom 0.25s, opacity 0.25s;
                      opacity: 0.7;
                      border-bottom: 2px solid rgba(0, 0, 0, 0);

                      div {
                        display: inline-block;
                      }

                      .icon-box {
                        margin-right: 10px;
                      }
                    }
                    li:hover {
                      opacity: 0.85;
                    }

                    li.active {
                      opacity: 1;
                    }

                    li.active:hover {
                      opacity: 1;
                    }
                  }
                }

            }
        }
    }


    .top-spacer {
        height: 138px;
    }
    .left-spacer {
        width: 360px;
        min-width: 360px;
    }
    // Left Hand Side Area
    .sidebar-area {
        width: 360px;
        // background-color: green;
        position: fixed;
        bottom: 0;
        top: 230px;
        left: 155px;
        right: 50px;
        z-index: 3;

        .manage-students-section-selector {

          margin-top: 30px;
          margin-bottom: 30px;
          text-align: right;

          ul {
            margin: 0;
            padding: 0;
            list-style: none;

            li {
              font-weight: 600;
              cursor: pointer;
              height: 40px;
              line-height: 40px;
              padding-right: 20px;
              border-right: 2px solid rgba(0, 0, 0, 0);
              transition: border 0.25s;
            }
          }
        }

        .statistics-controller-sidebar {
          
          margin-top: 30px;
          margin-bottom: 30px;
          .section-selector {
            
            .ui.button {
              margin-bottom: 10px;
            }
          }
        }
    }

    // Main body area
    .content-area-wrapper {
        display: flex;
    }
    .content-area {
        position: relative;
        width: 72%;
        margin-right: 30px;
        margin-left: 30px;
        box-sizing: border-box;

        .attendance-for-month {
          
        }

        .title {
            margin-top: 10px;
            margin-bottom: 10px;
        }
    }
}

.dark-mode {
    .course-info {

        .page-title {
            background-color: #121419;
        }

        .page-info-area {
            .left-side {
                background-color: #121419;
            }
            .right-side {
                background-color: #121419;
                
                .tabs {

                  ul {
                    li.active {
                      border-bottom: 2px solid white;
                    }
                  }
                }
            }
        }

        .sidebar-area {

          .manage-students-section-selector {
            ul {

              li.active {
                border-right: 2px solid #47C4FC;
              }
              li.active:hover {
                border-right: 2px solid #47C4FC;
              }
              li:hover {
                border-right: 2px solid rgba(255, 255, 255, 0.6);
              }
            }
          }
        }
    }
}

.light-mode {
    .course-info {

        .page-title {
            background-color: white;
        }
        .page-info-area {
            .left-side {
                background-color: white;
            }
            .right-side {
                background-color: white;

                .tabs {
                  ul {
                    li.active {
                      border-bottom: 2px solid black;
                    }
                  }
                }
            }
        }
    }

    .sidebar-area {

      .manage-students-section-selector {
        ul {

          li.active {
            border-right: 2px solid #47C4FC;
          }
          li.active:hover {
            border-right: 2px solid #47C4FC;
          }
          li:hover {
            border-right: 2px solid rgba(0, 0, 0, 0.6);
          }
        }
      }
    }
}

@media only screen and (max-width: 900px) {
  .course-info {

    .header {
        position: relative;
        display: contents;

        
        .page-info-area {
            display: block;

            .left-side {
                width: 100%;
            }

            .right-side {
                width: 100%;
                position: relative;
                margin-top: 80px;
                margin-bottom: 40px;
            }
        }
    }

    .sidebar-area {
        position: static;
        display: contents;
    }

    .top-spacer {
        height: 0px;
    }
    .left-spacer {
        width: 0px;
        min-width: 0px;
    }
    .content-area {
        position: relative;
        width: 100%;
    }
  }
}

</style>
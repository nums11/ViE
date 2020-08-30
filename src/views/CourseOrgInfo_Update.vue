<template>

  <div class="course-info-page">

    <!-- Header Area -->
    <div class="header-area">
      <div class="left-side">
        <div class="title"><h3>Data Structures</h3></div>
      </div>
      <div class="right-side">
        <sui-button 
          compact 
          icon="plus" 
          label-position="left" 
          content="Schedule Meeting" 
          class="venue-green"
        />
      </div>
    </div>

    <!-- Body Area -->
    <div class="body-area">
      <hide-at breakpoint="small">

        <div class="left-navbar">
        
          <div class="navbar-area">
            <div @click="active_tab = 'course_info'" :class="`navbar-option ${active_tab == 'course_info' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="info" /></div>
              <div class="text-area">Course Info</div>
            </div>
            <div @click="active_tab = 'statistics'" :class="`navbar-option ${active_tab == 'statistics' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="chart line" /></div>
              <div class="text-area">Statistics</div>
            </div>
            <div @click="active_tab = 'manage_students'" :class="`navbar-option ${active_tab == 'manage_students' ? 'active' : ''}`">
              <div class="icon-area"><sui-icon name="users" /></div>
              <div class="text-area">Manage Students</div>
            </div>
          </div>

        </div>

      </hide-at>
      <show-at breakpoint="small">

        <div class="mobile-navbar">
          
          <div class="mobile-navbar-container">

            <div class="navbar-area">

              <div @click="active_tab = 'course_info'" :class="`navbar-option ${active_tab == 'course_info' ? 'active' : ''}`">
                <div class="icon-area"><sui-icon name="info" /></div>
                <div class="navbar-label-area">Course Info</div>
              </div>

              <div @click="active_tab = 'statistics'" :class="`navbar-option ${active_tab == 'statistics' ? 'active' : ''}`">
                <div class="icon-area"><sui-icon name="chart line" /></div>
                <div class="navbar-label-area">Statistics</div>
              </div>

              <div @click="active_tab = 'manage_students'" :class="`navbar-option ${active_tab == 'manage_students' ? 'active' : ''}`">
                <div class="icon-area"><sui-icon name="users" /></div>
                <div class="navbar-label-area">Manage Students</div>
              </div>

            </div>

          </div>

        </div>

      </show-at>
      <div class="content">

        <transition name="fade" mode="out-in">

          <!-- Course Info -->
          <div class="section" :key="1" v-if="active_tab == 'course_info'">
            <div class="title-area"><h4>Course Info</h4></div>
          </div>

          <!-- Statistics -->
          <div class="section" :key="2" v-if="active_tab == 'statistics'">
            <div class="title-area"><h4>Statistics</h4></div>
          </div>
          
          <!-- Manage Students -->
          <div class="section" :key="3" v-if="active_tab == 'manage_students'">
            <div class="title-area"><h4>Manage Students</h4></div>
          </div>

        </transition>
      </div>
    </div>
  </div>

</template>
<script>
import {showAt, hideAt} from 'vue-breakpoints'
export default {
  name: 'CourseOrgInfo',
  components: {
    showAt, hideAt
  },
  data () {
    return {
      active_tab: 'course_info'
    }
  },
  methods: {

  }
}
</script>
<style lang="scss">
.course-info-page {

  .header-area {
    margin-bottom: 20px;
    display: flex;
    align-items: center;

    .left-side {
      flex-grow: 1;
    }
  }

  .body-area {
    display: flex;
    flex-wrap: wrap;

    .mobile-navbar {
      display: block;
      width: 100%;
      height: 60px;
      margin-bottom: 20px;

      .navbar-area {
        border-radius: 5px;
        overflow: hidden;
        cursor: pointer;
        display: flex;
        text-align: center;
        width: 370px;
        margin: 0 auto;
        height: 60px;

        .navbar-option {
          width: 200px;
          padding-top: 10px;
          transition: background 0.25s;

          .icon-area {
            font-size: 1.3rem;
            margin-bottom: 5px;
          }

          .navbar-label-area {
            font-size: 0.65em;
            text-transform: uppercase;
          }
        }
      }
    }

    .left-navbar {
      width: 300px;
      min-width: 300px;
      margin-right: 25px;

      .navbar-area {
        padding: 15px 15px;
        border-radius: 5px;
        box-sizing: border-box;

        .navbar-option {
          border-radius: 5px;
          margin-bottom: 15px;
          display: flex;
          height: 35px;
          align-items: center;
          cursor: pointer;
          transition: background 0.25s, transform 0.25s;
          transform: scale(1);

          &:active {
            transform: scale(0.95);
          }

          &:last-child {
            margin-bottom: 0;
          }

          .icon-area {
            width: 55px;
            min-width: 55px;
            text-align: center;
          }

          .text-area {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
          }
        }
      }
    }
    .content {
      flex-grow: 1;
      border: 1px solid purple;

      .section {

        .title-area {

        }
      }
    }
  }
}

.light-mode {
  .navbar-area {
    background-color: #D5EFFF;

    .navbar-option {
      background-color: rgba(0, 0, 0, 0);
      &:hover {
        background-color: #ade0ff;
      }

      &.active {
        background-color: #A2DCFF;
      }
    }
  }
}

.dark-mode {
  .navbar-area {
    background-color: #282c36;

    .navbar-option {
      background-color: rgba(0, 0, 0, 0);
      &:hover {
        background-color: #3c414d;
      }

      &.active {
        background-color: #494e5c;
      }
    }
  }
}
</style>
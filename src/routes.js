import Vue from 'vue'
import VueRouter from 'vue-router';
import Home from './components/Home.vue';
import AdminUsers from './components/admin/User/AdminUsers.vue';
import AdminEditUser from './components/admin/User/AdminEditUser.vue';
import AdminInstructors from './components/admin/User/AdminInstructors.vue';
import AdminStudents from './components/admin/User/AdminStudents.vue';
import AdminCourse from './components/admin/Course/AdminCourse.vue';
import AdminEditCourse from './components/admin/Course/AdminEditCourse.vue';
import AdminNewCourse from './components/admin/Course/AdminNewCourse.vue';
import AdminCourses from './components/admin/Course/AdminCourses.vue';
import AdminMeetings from './components/admin/Meeting/AdminMeetings.vue';
import AdminSections from './components/admin/Section/AdminSections.vue';
import AdminEditSection from './components/admin/Section/AdminEditSection.vue';
import AdminNewSection from './components/admin/Section/AdminNewSection.vue';
import AdminNewUser from './components/admin/User/AdminNewUser.vue';
import AdminEditRecording from './components/admin/Recording/AdminEditRecording.vue';
import AdminEditQRCheckin from './components/admin/QRCheckin/AdminEditQRCheckin.vue';
import OnboardUser from './views/OnboardUser.vue';
import AdminNewOrg from './components/admin/Organization/AdminNewOrg.vue';
import AdminOrgs from './components/admin/Organization/AdminOrgs.vue';
import AdminEditOrg from './components/admin/Organization/AdminEditOrg.vue';
import AdminEditMeeting from './components/admin/Meeting/AdminEditMeeting.vue';
import NewMeeting from './views/NewMeeting.vue';
import AdminNewEvent from './components/admin/Event/AdminNewEvent.vue';
import AdminEvents from './components/admin/Event/AdminEvents.vue';
import AdminEditEvent from './components/admin/Event/AdminEditEvent.vue';
import AdminGlobalCommands from './views/AdminGlobalCommands.vue';
import NewSubmission from './components/admin/Submission/NewSubmission.vue';
import Submissions from './components/admin/Submission/Submissions.vue';
import AdminStudentInvite from './components/admin/Course/StudentInvite.vue';
import LandingPage from './views/LandingPage.vue';
import SetPermanentPassword from './views/SetPermanentPassword.vue';
import Signup from './components/Signup.vue';
import Dashboard from './views/Dashboard.vue';
import CourseList from './components/CourseList.vue';
import CourseOrgInfo from './views/CourseOrgInfo.vue';
import NewEvent from './views/NewEvent.vue';
import EventInfo from './views/EventInfo.vue';
import LecturePlayback from './views/LecturePlayback.vue';
import WebexTest from './views/WebexTest.vue';
import NewLecture from './views/NewLecture.vue';
import LectureInfo from './views/LectureInfo.vue';
import MeetingInfo from './views/MeetingInfo.vue';
import Settings from './views/Settings.vue';
import RedirectCASLogin from './views/RedirectCASLogin.vue';
import Statistics from './views/Statistics.vue';
import WatchRecording from './views/WatchRecording.vue';
import AttendChecker from './views/AttendChecker.vue';
import LoginView from './views/LoginView.vue';
import AddRecording from './views/AddRecording.vue';

Vue.use(VueRouter);

const router = new VueRouter({
  // mode: 'history',
  routes: [
    {
      name: 'login',
      path: '/login',
      component: LoginView,
      meta: {
        title: 'Venue - Login',
        requiresNoLogin: true
      }
    },
    {
      name: 'landing_page',
      path: '/',
      component: LandingPage,
      meta: { requiresNoLogin: true }
    },
    {
      name: 'settings',
      path: '/settings',
      component: Settings,
      meta: {
        title: "Venue - Settings",
        requiresAuth: true
      }
    },
    {
      name: 'admin_new_user',
      path: '/admin/new_user',
      component: AdminNewUser,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_users',
      path: '/admin/users',
      component: AdminUsers,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_student_invite',
      path: '/admin/course_invite',
      component: AdminStudentInvite,
      meta: {
        requiresAdmin: true,
        requiresAuth: true
      }
    },
    {
      name: 'admin_edit_user',
      path: '/admin/edit_user/:id',
      component: AdminEditUser,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'onboard_user',
      path: '/admin/onboard_user',
      component: OnboardUser,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_instructors',
      path: '/admin/instructors',
      component: AdminInstructors,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_students',
      path: '/admin/students',
      component: AdminStudents,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_new_course',
      path: '/admin/new_course',
      component: AdminNewCourse,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_course',
      path: '/admin/course',
      component: AdminCourse,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_edit_course',
      path: '/admin/edit_course/:id',
      component: AdminEditCourse,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_edit_recording',
      path: '/admin/edit_recording/:recording_id',
      component: AdminEditRecording,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_edit_qr_checkin',
      path: '/admin/edit_qr_checkin/:qr_checkin_id',
      component: AdminEditQRCheckin,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_courses',
      path: '/admin/courses',
      component: AdminCourses,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_sections',
      path: '/admin/sections',
      component: AdminSections,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_edit_section',
      path: '/admin/edit_section/:id',
      component: AdminEditSection,
      meta: {
        requiresAuth: true,
        requiresadmIn: true
      }
    },
    {
      name: 'admin_new_section',
      path: '/admin/new_section',
      component: AdminNewSection,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_new_event',
      path: '/admin/new_event',
      component: AdminNewEvent,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_events',
      path: '/admin/events',
      component: AdminEvents,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_edit_event',
      path: '/admin_edit_event/:id',
      component: AdminEditEvent,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'new_submission',
      path: '/new_submission',
      component: NewSubmission,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'submissions',
      path: '/admin/submissions',
      component: Submissions,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'meetings',
      path: '/admin/meetings',
      component: AdminMeetings,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'signup',
      path: '/signup',
      component: Signup,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'dashboard',
      path: '/dashboard',
      component: Dashboard,
      meta: {
        title: "Venue - Dashboard",
        requiresAuth: true
      }
    },
    // {
    //   name: 'user_courses',
    //   path: '/user_courses',
    //   component: CourseList,
    //   meta: {
    //     title: "Venue - Courses",
    //     requiresAuth: true
    //   }
    // },
    {
      name: 'course_info',
      path: '/course_info/:id',
      component: CourseOrgInfo,
      meta: {
        title: "Venue - Course Info",
        requiresAuth: true
      }
    },
    {
      name: 'org_info',
      path: '/org_info/:id',
      component: CourseOrgInfo,
      meta: {
        title: "Venue - Org Info",
        requiresAuth: true
      }
    },
    {
      name: 'new_event',
      path: '/new_event/:course_id',
      component: NewEvent,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'event_info',
      path: '/event_info/:event_id',
      component: EventInfo,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'webex_test',
      path: '/webex_test',
      component: WebexTest,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'lecture_playback',
      path: '/lecture_playback/:lecture_id',
      component: LecturePlayback,
      meta: {
        title: "Venue - Lecture Playback",
        requiresAuth: true,
      }
    },
    {
      name: 'watch_recording',
      path: '/watch_recording/:recording_id',
      component: WatchRecording,
      meta: {
        title: "Venue - Watch Recording",
        requiresAuth: true,
      }
    },
    {
      name: 'new_lecture',
      path: '/new_lecture/:course_id',
      component: NewLecture,
      meta: {
        title: "Venue - New Lecture",
        requiresAuth: true,
        requiresInstructor: true
      }
    },
    {
      name: 'lecture_info',
      path: '/lecture_info/:lecture_id',
      component: LectureInfo,
      meta: {
        title: "Venue - Lecture Info",
        requiresAuth: true,
      }
    },
    {
      name: 'meeting_info',
      path: '/meeting_info/:meeting_id',
      component: MeetingInfo,
      meta: {
        title: "Venue - Meeting Info",
        requiresAuth: true,
      }
    },
    {
      name: 'set_permanent_password',
      path: '/set_permanent_password/:user_id',
      component: SetPermanentPassword,
      meta: {
        requiresNoLogin: true
      }
    },
    {
      name: 'redirect_cas_login',
      path: '/redirectCASLogin/:optional_meeting_id/:optional_code',
      component: RedirectCASLogin,
      meta: {
        title: "Venue - Redirecting",
        requiresNoLogin: true
      }
    },
    {
      name: 'statistics',
      path: '/statistics',
      component: Statistics,
      meta: {
        title: "Venue - Statistics",
        requiresAuth: true,
        requiresInstructor: true
      }
    },
    {
      name: 'admin_new_org',
      path: '/admin/new_org',
      component: AdminNewOrg,
      meta: {
        requiresAuth: true,
        requireAdmin: true
      }
    },
    {
      name: 'admin_orgs',
      path: '/admin/orgs',
      component: AdminOrgs,
      meta: {
        requiresAuth: true,
        requireAdmin: true
      }
    },
    {
      name: 'admin_edit_org',
      path: '/admin/edit_org/:id',
      component: AdminEditOrg,
      meta: {
        requiresAuth: true,
        requireAdmin: true
      }
    },
    {
      name: 'admin_edit_meeting',
      path: '/admin/edit_meeting/:meeting_id',
      component: AdminEditMeeting,
      meta: {
        requiresAuth: true,
        requireAdmin: true
      }
    },
    {
      name: 'admin_global_commands',
      path: '/admin/global_commands',
      component: AdminGlobalCommands,
      meta: {
        requiresAuth: true,
        requireAdmin: true
      }
    },
    {
      name: 'course_new_meeting',
      path: '/course_new_meeting/:course_id',
      component: NewMeeting,
      meta: {
        requiresAuth: true,
        requireAdmin: false
      }
    },
    {
      name: 'org_new_meeting',
      path: '/org_new_meeting/:org_id',
      component: NewMeeting,
      meta: {
        requiresAuth: true,
        requiresAdmin: false
      }
    },
    {
      name: 'add_recording',
      path: '/add_recording/:meeting_id',
      component: AddRecording,
      meta: {
        requiresAuth: true,
        requireAdmin: false
      }
    },
    {
      name: 'attend_checker',
      path: '/attend/:meeting_id/:code',
      component: AttendChecker,
    }
  ]
})

router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('user')

  if (to.matched.some(record => record.meta.requiresAuth)) {

    if (loggedIn) {

      const user_data = JSON.parse(loggedIn)

      if(to.matched.some(record => record.meta.requiresAdmin)) {

        if (user_data.current_user.is_admin) {
          next()
        } else {
          next('/dashboard')
        }

      } else if (to.matched.some(record => record.meta.requiresInstructor)) {

        if (user_data.current_user.is_instructor) {
          next()
        } else {
          next('/dashboard')
        }

      } else {
        next()
      }

    } else {
      next('/')
    }

  } else if (to.matched.some(record => record.meta.requiresNoLogin)) {

    if (loggedIn) {
      next('/dashboard')
    } else {
      next()
    }

  } else {
    next()
  }
})

export default router

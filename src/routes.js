import Vue from 'vue'
import VueRouter from 'vue-router';
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
import AdminEditVideo from './components/admin/Video/AdminEditVideo.vue';
import AdminEditQRScan from './components/admin/QRScan/AdminEditQRScan.vue';
import OnboardUser from './views/OnboardUser.vue';
import AdminEditMeeting from './components/admin/Meeting/AdminEditMeeting.vue';
import NewMeeting from './views/NewMeeting.vue';
import AdminGlobalCommands from './views/AdminGlobalCommands.vue';
import AdminNotificationJobs from './components/admin/Notification/AdminNotificationJobs.vue';
import AdminUpdatedAuthHeaders from './components/admin/User/AdminUpdatedAuthHeaders.vue';
import AdminStudentInvite from './components/admin/Course/StudentInvite.vue';
import LandingPage from './views/LandingPage.vue';
import SetPermanentPassword from './views/SetPermanentPassword.vue';
import LoginSignupCreate from './views/LoginSignupCreate.vue';
import Dashboard from './views/Dashboard.vue';
import CourseList from './components/CourseList.vue';
import CourseOrgInfo from './views/CourseOrgInfo.vue';
import CourseInfo from './views/CourseInfo.vue';
import WebexTest from './views/WebexTest.vue';
import MeetingInfo from './views/MeetingInfo.vue';
import Settings from './views/Settings.vue';
import RedirectCASLogin from './views/RedirectCASLogin.vue';
import WatchVideo from './views/WatchVideo.vue';
import AttendChecker from './views/AttendChecker.vue';
import LoginView from './views/LoginView.vue';
import AddVideo from './views/AddVideo.vue';
import RegisterJoinCourse from './views/RegisterJoinCourse.vue'
import InviteStudentRedirect from './views/InviteStudentRedirect.vue'
import SuccessfulInviteRedirect from './views/SuccessfulInviteRedirect.vue'
import DevLogin from './views/DevLogin.vue'

Vue.use(VueRouter);

const router = new VueRouter({
  // mode: 'history',
  routes: [
    // {
    //   name: 'login',
    //   path: '/login',
    //   component: LoginView,
    //   meta: {
    //     title: 'Venue - Login',
    //     requiresNoLogin: true
    //   }
    // },
    {
      name: 'landing_page',
      path: '/',
      component: LandingPage,
      meta: {
        title: 'ViE',
        requiresNoLogin: true
      }
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
        requiresAdmin: true
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
        requiresAdmin: true
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
        requiresAdmin: true
      }
    },
    {
      name: 'admin_edit_video',
      path: '/admin/edit_video/:video_id',
      component: AdminEditVideo,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_edit_qr_scan',
      path: '/admin/edit_qr_scan/:qr_scan_id',
      component: AdminEditQRScan,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_courses',
      path: '/admin/courses',
      component: AdminCourses,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
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
        requiresAdmin: true
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
      name: 'admin_notifiacation_jobs',
      path: '/admin/notification_jobs',
      component: AdminNotificationJobs,
      meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
      name: 'admin_updated_auth_headers',
      path: '/admin/updated_auth_headers',
      component: AdminUpdatedAuthHeaders,
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
      path: '/signup/:user_exists?',
      component: LoginSignupCreate,
      meta: {
        title: 'ViE - Sign up',
        requiresNoAuth: true,
      }
    },
    {
      name: 'login',
      path: '/login/:user_does_not_exist?',
      component: LoginSignupCreate,
      meta: {
        title: 'ViE - Log in',
        requiresNoAuth: true,
      }
    },
    {
      name: 'create_user',
      path: '/create_user/:user_id/:optional_invited_section_id?'
      + '/:optional_invite_code?',
      component: LoginSignupCreate,
      meta: {
        requiresNoAuth: true,
      }
    },
    {
      name: 'dashboard',
      path: '/dashboard',
      component: Dashboard,
      meta: {
        title: "ViE - Dashboard",
        requiresAuth: true
      }
    },
    {
      name: 'course_info',
      path: '/course_info/:id',
      component: CourseInfo,
      meta: {
        title: "ViE - Course Info",
        requiresAuth: true
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
      name: 'watch_video',
      path: '/watch_video/:video_id',
      component: WatchVideo,
      meta: {
        title: "Venue - Watch Video",
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
        requireAdmin: false,
        requiresInstructor: true
      }
    },
    {
      name: 'add_video',
      path: '/add_video/:meeting_id',
      component: AddVideo,
      meta: {
        requiresAuth: true,
        requireAdmin: false
      }
    },
    {
      name: 'attend_checker',
      path: '/attend/:meeting_id/:qr_scan_id/:code',
      component: AttendChecker,
    },
    {
      name: 'register_course',
      path: '/register_course',
      component: RegisterJoinCourse,
      meta: {
        requiresAuth: true,
        requiresInstructor: true
      }
    },
    {
      name: 'join_course',
      path: '/join_course',
      component: RegisterJoinCourse,
      meta: {
        requiresAuth: true,
        requireAdmin: false,
      }
    },
    {
      name: 'invite_student_redirect',
      path: '/invite/:section_id/:student_id/:invite_code',
      component: InviteStudentRedirect,
    },
    {
      name: 'successful_invite_redirect',
      path: '/successful_invite',
      component: SuccessfulInviteRedirect,
    },
    {
      name: 'dev_login',
      path: '/dev_login',
      component: DevLogin,
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

<template>

   
    <div class="course-statistics">

        <h3>Chart Title Goes Here</h3>
        <VenueChart 
            :chartData="chartData"
            :chartOptions="chartOptions"
            :labels="labels"
            :style="{height: '400px'}"
        />

    </div>
</template>

<script>

let User = 
{
    first_name: String,
	last_name: String,
	user_id: String,
	email: String,
	temp_password: String,
	password: String,
	instructor_courses: [],
	student_courses: [],
	user_orgs: [],
	meetings: [],
	live_submissions: [],
	async_submissions: [],
	connect_sid: String,
	is_admin: false,
	is_instructor: false
}

let Course = 
{
	name: String,
	dept: String,
	course_number: Number,
	instructor: String,
	students: [],
	meetings: []
}
let LiveSubmission = {
	submitter: null,
	live_submission_time: Date,
	is_qr_checkin_submission: false,
	qr_checkin: [],
	poll: '',
	poll_answers: ''
}
let QRCheckin = 
{
    code: String,
    qr_checkin_start_time: Date,
    qr_checkin_end_time: Date,
    qr_checkin_submissions: []
}
let users = []
let qrs = []
let instructor = 
{ 
    first_name: "Stone",
    last_name: "McLaren",
    user_id: "mclars2",
    email: "venue@rpi.edu",
    password: "nimda",
    is_instructor: true,
    is_admin: true,
    instructor_courses: [],
    student_courses: [],
    users_orgs: [],
    meetings: [],
    live_submissions: [],
    async_submissions: [],
}

for(let i=0;i<7;i++) {  // 2-27 (a-z)
    var chr = String.fromCharCode(97 + i);
    users.push({
        first_name: "Student",
        last_name: chr,
        user_id: "student" + chr,
        email: "student"+chr+"@rpi.edu",
        password: "password",
        is_instructor: false,
        is_admin: false,
        instructor_courses: [],
        student_courses: [],
        users_orgs: [],
        meetings: [],
        live_submissions: [],
        async_submissions: [],
    })
}

let course = 
{ 
    name: "RCOS",
    dept: "CSCI",
    course_number: 2961,
    instructor: users[0]._id,
    students: [users[0], users[1], users[2], users[3], users[4],  users[5],  users[6]],
    meetings: []
}

instructor.instructor_courses.push(course)
users[0].student_courses.push(course)
users[1].student_courses.push(course)
users[2].student_courses.push(course)
users[3].student_courses.push(course)
users[4].student_courses.push(course)
users[5].student_courses.push(course)
users[6].student_courses.push(course)

let live_subs = []
for(let i = 0; i < 7; i++){
    live_subs.push({
	submitter: users[i],
	live_submission_time: new Date(2020, 5, 11, 12, 30, 0),
	is_qr_checkin_submission: true,
	qr_checkin: [],
	poll: '',
	poll_answers: ''
} )
}


qrs.push({ 
    code: "BigDrip",
    qr_checkin_start_time: new Date(2020, 5, 11, 12, 30, 0),
    qr_checkin_end_time: new Date(2020, 5, 11, 12, 35, 0),
    qr_checkin_submissions: [live_subs[4], live_subs[3], live_subs[2]]
})

qrs.push({ 
    code: "BigPebble",
    qr_checkin_start_time: new Date(2020, 5, 11, 12, 50, 0),
    qr_checkin_end_time: new Date(2020, 5, 11, 12, 55, 0),
    qr_checkin_submissions: [live_subs[6],live_subs[2],live_subs[4],live_subs[0]]
})

qrs.push({ 
    code: "rock",
    qr_checkin_start_time: new Date(2020, 5, 11, 1, 30, 0),
    qr_checkin_end_time: new Date(2020, 5, 11, 1, 35, 0),
    qr_checkin_submissions: [live_subs[5]]
})

qrs.push({ 
    code: "done",
    qr_checkin_start_time: new Date(2020, 5, 11, 2, 0, 0),
    qr_checkin_end_time: new Date(2020, 5, 11, 2, 5, 0),
    qr_checkin_submissions: [live_subs[0],live_subs[1],live_subs[2],live_subs[4],live_subs[5],live_subs[6],live_subs[3]]
})

let percent_there = (qrs[0].qr_checkin_submissions.length / course.students.length) * 100
let not_there = 100 - percent_there
import  VenueChart  from "@/components/VenueChart.vue"
/*
export default {
    name: 'CourseStatistics',
    components: {
        VenueChart
    },
    props: {
        sections: {},
        colorSets: []
    },
    data () {
        return {
            chartData: {},
            chartOptions: {}
        }
    },
    created () {
        this.chartData = {
            labels: ['January', 'February', 'March'],
            datasets: Object.keys(this.sections).map((key_, i) => {
                return this.sections[key_].display ? {
                    label: `Data ${i}`,
                    backgroundColor: this.colorSets[i].fill,
                    borderColor: this.colorSets[i].stroke,
                    data: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
                }: {
                    label: `Data ${i}`,
                    backgroundColor: `rgba(0, 0, 0, 0)`,
                    borderColor: `rgba(0, 0, 0, 0)`,
                    data: [0, 0, 0]
                }
            })
        }
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            }
        }
        setInterval(() => {
            this.chartData = {
                labels: ['January', 'February', 'March'],
                datasets: Object.keys(this.sections).map((key_, i) => {
                    return this.sections[key_].display ? {
                        label: `Data ${i}`,
                        backgroundColor: this.colorSets[i].fill,
                        borderColor: this.colorSets[i].stroke,
                        data: [Math.random() * 100, Math.random() * 100, Math.random() * 100]
                    }: {
                        label: `Data ${i}`,
                        backgroundColor: `rgba(0, 0, 0, 0)`,
                        borderColor: `rgba(0, 0, 0, 0)`,
                        data: [0, 0, 0]
                    }
                })
            }
        }, 1500)
    }
}
*/


export default {
    components: {
        VenueChart
    },
    props: {
        sections: {},
        colorSets: []
    },
    data () {
        return {
            chartData: {},
            chartOptions: {}
        }
    },
    created () {
        this.chartData = {
            labels: ['Present', 'Absent'],
            datasets:[ { 
            backgroundColor: ['#6ecaff','#fe7073'],
            data: [percent_there,not_there]
            }]
        },
        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: true
            }
        }
    }
}


</script>


<style>

</style>

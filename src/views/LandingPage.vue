<template>
  <div id="landing-page">
    <ExternalNavbar />
    <div id="main">
      <div id="attention-grabber">
        <p class="attention-grabber-paragraph">Make your online, hybrid, or in-person course</p>
        <!-- <p class="attention-grabber-paragraph">online course</p> -->
        <p class="attention-grabber-paragraph">
          <span class="blue-text">more </span> 
          <span class="pink-text">engaging</span>
        </p>
      </div>
      <hide-at breakpoint="mediumAndBelow">
        <div id="sub-text">
          <p>Use QR Codes, video tracking, and polls to engage</p>
          <p> your students in real time and asynchronously</p>
        </div>
      </hide-at>
      <show-at breakpoint="mediumAndBelow">
        <div id="sub-text">
          <p>Use QR Codes, video tracking, and polls to engage 
          your students in real time and asynchronously</p>
        </div>
      </show-at>
      <div id="signupbutton-container">
        <Button route_name="signup" text="Sign up" color="blue"
        size="large" invert_colors/>
      </div>
    </div>
    <div id="video">
      <div id="video-img-container">
        <div id="filter"></div>
        <div id="watch-video-btn">
          <div @click="showVideoModal">
            <Button text="Watch video" color="pink"
            size="large" invert_colors wide />
          </div>
        </div>
        <img src="@/assets/vie_video_img.png" id="video-img" />
        <sui-modal v-model="show_video_modal">
          <sui-modal-content image>
            <iframe id="youtube-video" width="860" height="483"
            src="https://www.youtube.com/embed/CKhnfsnYl2M" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media;
            gyroscope; picture-in-picture" allowfullscreen>
            </iframe>
          </sui-modal-content>
        </sui-modal>
      </div>
    </div>
    <div id="explanatory-section">
      <div id="what-is-vie">
        <h1 id="question">What is ViE?</h1>
        <div id="answer-container">
          <p id="answer">The 
            <span class="blue-text">Virtual </span>
            <span class="pink-text">Engagement </span> Platform
          </p>
          <p id="answer-sub-header">
            <span class="blue-text mr-2">Vi - virtual </span>
            <span class="pink-text">E - engagement</span>
          </p>
          <p id="catchphrase">It's as easy as 1, 2, 3</p>
        </div>
      </div>
      <div id="three-steps-container">
        <div class="step-container">
          <h1 class="step-header">1 - Prepare</h1>
          <img class="step-img" id="prepare-img" src="@/assets/prepare.jpg">
          <p class="step-explanation" id="prepare-explanation">
            Schedule your course meetings with ease.
            <br/><br/>
            Add pre-recorded class videos for your students to watch, quizzes
            for your students to answer during class, or qr scans to verify
            students attendance.  
          </p>
        </div>
        <div class="step-container">
          <h1 class="step-header">2 - Engage</h1>
          <img class="step-img" id="engage-img" src="@/assets/engage.jpg">
          <p class="step-explanation" id="engage-explanation">
            During your class, get notified in real-time with QR codes 
            that your students scan to verify engagement or quizzes for
            your students to answer.
            <br/><br/>
            Upload videos before or after class for students to watch 
            asynchronously without being able to skip through.
            <br/><br/>
            Make your videos interactive by adding questions at different
            timestamps throughout videos. Students won't be able to skip past
            these questions so they will test engagement and comprehension.
          </p>
        </div>
        <div class="step-container">
          <h1 class="step-header">3 - Analyze</h1>
          <img class="step-img" id="analyze-img" src="@/assets/analyze.jpg">
          <p class="step-explanation" id="analyze-explanation">
            See which students scanned qr codes or how students performed on
            quizzes during class.
            <br/><br/>
            View the percentage of videos that students watched and their
            answers to quiz questions within those videos.
            <br/><br/>
            Get stats about a particular meeting or your class at large 
            to see how well your students are being engaged by your 
            course material.
          </p>
        </div>
      </div>
    </div>
    <div id="testimonials">
      <h1 id="built-for-instructors">Built For Instructors</h1>
      <TestimonialCard instructor_name="Omar El-Shafee"
      instructor_dept="Engineering"
      testimonial="After switching to online teaching. One of the challenges was to find a reliable way to take attendance in my classes. ViE provided an easy to implement and efficient way of taking attendance during live lectures. More important, the asynchronous attendance done via watching the lecture video during a specified time window conquered the time zone difference issue and made my students less stressed about missing my live lecture for some reason. All in all I recommend ViE given my great experience using it, and as I know the ViE team is working on adding more features to the application for the upcoming semesters."
      class="testimonial-card inline-block" />
      <TestimonialCard instructor_name="Charles Martin"
      instructor_dept="Astronomy"
      testimonial="ViE made measuring course engagement quick and easy. Through the QR codes I was able to keep track of students who were attending the live classes. Through the uploaded class recordings, I could ensure students who weren't coming to live classes were still keeping up with the material. In this way I was able to actively measure student participation rather than just looking at homework submissions to LMS."
      class="testimonial-card inline-block" />
      <TestimonialCard instructor_name="Helen Zhou"
      instructor_dept="Language"
      testimonial="ViE is a valuable tool not only useful for taking attendance but also for checking student attention and participation. The flexibility of random checking at any point of the class period keeps students attentive to the synchronous sessions. I highly recommend using ViE."
      class="testimonial-card inline-block" />
    </div>
    <div id="bottom-container">
      <h1 id="bottom-container-header">Make your course more engaging today</h1>
      <div id="second-signup-button">
        <Button route_name="signup" text="Sign up" color="blue"
        size="large" invert_colors/>
        <div id="or">Or</div>
        <p id="contact">Contact us at <span class="bold">viengagecontact@gmail.com</span>
         for more information or to schedule a demo.</p>
      </div>
    </div>
    <div>{{ stopVideoWhenClosingModal }}</div>
  </div>
</template>

<script>
import ExternalNavbar from '@/components/ExternalNavbar'
import Button from '@/components/Button'
import TestimonialCard from '@/components/TestimonialCard'

export default {
  name: 'LandingPage',
  components: {
    ExternalNavbar,
    Button,
    TestimonialCard
  },
  data(){
    return {
      show_video_modal: false
    }
  },
  computed: {
    stopVideoWhenClosingModal() {
      if(this.show_video_modal === false) {
        const youtube_video = document.getElementById('youtube-video')
        if(youtube_video != null){
          youtube_video.src = youtube_video.src
        }
      }
    }
  },
  created() {

  },
  methods: {
    showVideoModal() {
      this.show_video_modal = true
    }
  }
}
</script>

<style scoped>
#main {
  text-align: center;
  margin: auto;
  margin-top: 5rem;
  width: 55%;
  /*height: 30rem;*/
}

#attention-grabber {
  font-size: 5rem;
  font-weight: bold;
}

.attention-grabber-paragraph {
  margin-bottom:0;
}

#sub-text {
  width: 80%;
  margin: auto;
  margin-top: 5rem;
  font-size: 2rem;
}

#signupbutton-container {
  margin-top: 4rem;
}

#video {
  margin-top: 5rem;
}

#video-img-container {
  width: 50rem;
  margin: auto;
  position: relative;
}

#filter {
  position: absolute;
  width: 50rem;
  height: 100%;
  background-color: #dedede;
  opacity: 0.4;
}

#video-img {
  margin: auto;
  width: 100%;
}

#watch-video-btn {
  position: absolute;
  margin-left: 36%;
  margin-top: 26%;
}

#explanatory-section {
  /*border: black solid;*/
  margin-top: 5rem;
  /*background-color: black;*/
  /*color: white;*/
  text-align: center;
}

#what-is-vie {
  background-color: black;
  color: white;
  padding-top: 3rem;
  padding-bottom: 4rem;
}

#question {
  font-size: 6rem;
}

#answer-container {
  width: 50%;
  margin: auto;
  margin-top: 2rem;
}

#answer {
  font-size: 3.5rem;
  margin-bottom: 2rem;
}

#answer-sub-header {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.mr-2 {
  margin-right: 2rem;
}

#catchphrase {
  font-size: 2rem;
}

#three-steps-container {
  width: 90%;
  margin: auto;
  margin-top: 2rem;
}

.step-container {
  border: white solid;
  display: inline-block;
  vertical-align: top;
  width: 33%;
  /*height: 10rem;*/
}

.step-img {
  margin-top: 2rem;
}

#prepare-img {
  width: 20rem;
}

#engage-img {
  width: 30rem;
  margin-top: 3.5rem;
}

#analyze-img {
  width: 15rem;
}

.step-explanation {
  font-size: 1.5rem;
  width: 95%;
  margin: auto;
  margin-top: 1.5rem;
}

#prepare-explanation {
  margin-top: 2rem;
}

#engage-explanation {
  margin-top: 4rem;
}

#testimonials {
  margin: auto;
  margin-top: 5rem;
  /*padding-left: 10rem;*/
  /*padding-right: 10rem;*/
  background-color: #f0f2f5;
  overflow: auto;
  text-align: center;
  padding-top: 3rem;
  padding-bottom: 4rem;
  /*border: red solid;*/
}

#built-for-instructors {
  font-size: 3rem;
}

#bottom-container {
  padding-top: 2rem;
  padding-bottom: 2rem;
  text-align: center;
}

#bottom-container-header {
  font-size: 2.5rem;
}

#second-signup-button {
  margin-top: 2rem;
}

#or {
  margin-top: 2rem;
  font-size: 1.25rem;
}

#contact {
  width: 100%;
  margin: auto;
  margin-top: 1.5rem;
  font-size: 1.25rem;
}
.testimonial-card {
  /*border: black solid;*/
}

/* Tablets */
@media (max-width: 1128px) {
  #main {
    margin-top: 4rem;
  }
  #attention-grabber {
    font-size: 4rem;
  }
  #sub-text {
    font-size: 1.5rem;
    margin-top: 4rem;
  }
  #answer-container {
    width: 70%;
  }
  #answer-sub-header {
    font-size: 2rem;
  }
  #testimonials {
    padding-left: 0;
    padding-right: 0;
  }
  .testimonial-card {
    float: none;
    display: block;
    margin: auto;
    margin-top: 4rem;
  }
}

/* Phones */
@media (max-width: 744px) {
  #main {
    margin-top: 3rem;
  }
  #attention-grabber {
    font-size: 3rem;
  }
  #sub-text {
    font-size: 1.25rem;
    margin-top: 3rem;
  }
  #video-img-container, #filter {
    width: 100%;
  }
  #watch-video-btn {
    margin-left: 25%;
    margin-top: 25%;
  }
  #what-is-vie {
    padding-left: 0;
  }
  #question {
    font-size: 4rem;
  }
  #answer-container {
    margin-top: 1rem;
    text-align: center;
    width: 100%;
  }
  #answer-sub-header {
    font-size: 1.25rem;
    margin: auto;
  }
  #catchphrase {
    margin: auto;
    margin-top: 1rem;
  }
  .step-container {
    width: 100%;
    display: block;
  }
  .step-container:not(:first-child) {
    margin-top: 2rem;
  }
  #engage-img {
    width: 90%;
  }
  .step-explanation {
    font-size: 1.25rem;
  }
  #built-for-instructors {
    font-size: 2.5rem;
  }
  #bottom-container-header {
    font-size: 2rem;
  }
}
</style>
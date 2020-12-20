<template>
  <div id="landing-page">
    <ExternalNavbar />
    <div id="main">
      <div id="attention-grabber">
        <p class="attention-grabber-paragraph">Make your online course</p>
        <!-- <p class="attention-grabber-paragraph">online course</p> -->
        <p class="attention-grabber-paragraph">
          <span class="blue-text">more </span> 
          <span class="pink-text">engaging</span>
        </p>
      </div>
      <div id="sub-text">
        <p>Use QR Codes, video tracking, and polls to engage</p>
        <p> your students in real time and asynchronously</p>
      </div>
      <div id="signupbutton-container">
        <Button text="Sign up" color="blue" size="large" invert_colors/>
      </div>
    </div>
    <div id="video">
      <div id="video-img-container">
        <div id="filter"></div>
        <div id="watch-video-btn">
          <Button text="Watch video" color="pink" size="large"
          invert_colors wide/>
        </div>
        <img src="@/assets/venue_video_img.png" id="video-img" />
      </div>
    </div>
    <div id="explanatory-section">
      <div id="qa-container">
        <h1 id="question">What is ViE?</h1>
        <div id="answer-container">
          <p id="answer">
            <span class="blue-text mr-2">Vi - virtually </span>
            <span class="pink-text">E - engage</span>
          </p>
          <p id="catchphrase">It's as easy as 1, 2, 3</p>
        </div>
      </div>
      <div id="three-steps-container">
        <div class="step-container">
          <h1 class="step-header">1 - Prepare</h1>
          <img class="step-img" id="prepare-img" src="@/assets/prepare.jpg">
          <p class="step-explanation" id="prepare-explanation">
            Schedule your course meetings with ease, specifying what times 
            you want your students to scan QR codes.
          </p>
        </div>
        <div class="step-container">
          <h1 class="step-header">2 - Engage</h1>
          <img class="step-img" id="engage-img" src="@/assets/engage.jpg">
          <p class="step-explanation" id="engage-explanation">
            During your class, get notified in real-time with QR codes 
            that your students scan to verify engagement.
            <br/><br/>
            Upload videos before or after class for students to watch 
            asynchronously without being able to skip through.
            <br/><br/>
            Add polls to these videos 
            that test engagement and comprehension.
          </p>
        </div>
        <div class="step-container">
          <h1 class="step-header">3 - Analyze</h1>
          <img class="step-img" id="analyze-img" src="@/assets/analyze.jpg">
          <p class="step-explanation" id="analyze-explanation">
            Track the students who scanned QR codes during class and the 
            percentage of videos students watch as well as the answers to 
            any asynchronous polls.
            <br/><br/>
            Get stats about a particular meeting or your class at large 
            to see how well your students are being engaged by your 
            course material.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExternalNavbar from '@/components/ExternalNavbar'
import Button from '@/components/Button'

export default {
  name: 'LandingPage',
  components: {
    ExternalNavbar,
    Button
  },
  data(){
    return {
    }
  },
  created() {

  },
  methods: {

  }
}
</script>

<style scoped>
#landing-page {
  padding-bottom: 5rem;
}

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
  margin-top: 30%;
}

#explanatory-section {
  /*border: black solid;*/
  margin-top: 5rem;
  /*background-color: black;*/
  /*color: white;*/
  text-align: center;
}

#qa-container {
  background-color: black;
  color: white;
  padding-top: 3rem;
  padding-bottom: 3rem;
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
  font-size: 4rem;
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

</style>
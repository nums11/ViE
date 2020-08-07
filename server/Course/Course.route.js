const express = require('express');
const courseRoutes = express.Router();

let Course = require('./Course.model');
let Section = require('../Section/Section.model');
let User = require('../User/User.model');

courseRoutes.route('/add').post(function (req, res) {
  let course = new Course(req.body.course);
  course.save()
    .then(() => {
      User.findByIdAndUpdate(course.instructor,
      {$push: {instructor_courses: course}},
      (error,user) => {
        if(error || user == null) {
          console.log("<ERROR> Updating user while trying to add course:",course)
        } else {
          console.log("<SUCCESS> Adding course:",course)
          res.status(200).json(course);
        }
      });
    })
    .catch(() => {
      console.log("<ERROR> Adding course:",course)
      res.status(400).send("unable to save course to database");
    });
});

courseRoutes.route('/add_section/:course_id').post(function (req, res) {
	let course_id = req.params.course_id
  let section = new Section(req.body.section);
  console.log("course id", req.params.course_id)
  section.save()
    .then(() => {
    	Course.updateOne(
    		{_id: course_id},
    	  {$push: {sections: [section]}},
    	  function (err, course) {
    	    if (err || course == null) {
    	      console.log("<ERROR> Adding section to course with ID:",course_id)
    	      res.json(err);
    	    } else {
    	      console.log("<SUCCESS> Adding section to course with ID:",course_id,)
    	      res.json(course);
    	    }
    	  }
    	);
    })
    .catch(() => {
      console.log("<ERROR> Creating section to add to course with id:",course_id)
      res.status(400).send("unable to add section to course");
    });
});

courseRoutes.route('/').get(function (req, res) {
  Course.find(function (err, courses) {
    if (err || courses == null) {
      console.log("<ERROR> Getting all courses")
      res.json(err);
    } else {
      console.log("<Success> Getting all courses")
      res.json(courses);
    }
  });
});

courseRoutes.route('/get/:id').get(function (req, res) {
  let id = req.params.id;
  Course.findById(id).
  populate('instructor').
  populate('sections').
  exec((error,course) => {
    if(error || course == null){
      console.log("<ERROR> Getting course with ID:",id)
      res.status(404).json(err);
    } else {
      console.log("<SUCCESS> Getting course by ID:",id)
      res.json(course)
    }
  })
});

courseRoutes.route('/update/:id').post(function (req, res) {
  let id = req.params.id;
  let updated_course = req.body.updated_course;
  Course.findByIdAndUpdate(id,
    {
      name: updated_course.name,
      dept: updated_course.dept,
      course_number: updated_course.course_number,
      instructor: updated_course.instructor,
    },
    function (err, course) {
      if (err || course == null) {
        console.log("<ERROR> Updating course by ID:",id,"with:",updated_course)
        res.status(404).send("course not found");
      } else {
        console.log("<SUCCESS> Updating course by ID:",id,"with:",updated_course)
        res.json(course);
      }
    }
  );
});

courseRoutes.route('/delete/:id').delete(function (req, res) {
  Course.findByIdAndRemove({ _id: req.params.id }, function (err) {
    if (err) {
      console.log("<ERROR> Deleting course with ID:",req.params.id)
      res.json(err);
    } else {
      console.log("<SUCCESS> Deleting course with ID:",req.params.id)
      res.json('Successfully removed');
    }
  });
});

//Todo: change the id being passed to just be the instructor id
//and search for the instructor or remove this function entirely and use
//the userapis get user function
courseRoutes.route('/getInstructor/:id').get(function (req, res) {
  let id = req.params.id;
  Course.findById(id, function (err, course) {
    if (err || course == null) {
      console.log("<ERROR> Getting course with ID:",id)
      res.json(err);
    } else {
      let instructor_id = course.instructor;
      User.findById(instructor_id, function (error, instructor) {
        if (error || instructor == null) {
          console.log("<ERROR> Getting user with ID:",instructor_id)
          res.json(error);
        } else {
          console.log("<SUCCESS> Getting instructor for course with ID:",id)
          res.json(instructor);
        }
      });
    }
  });
});

courseRoutes.route('/get_instructor_courses/:user_id').get(function (req, res) {
  let user_id = req.params.user_id;
  Course.find({instructor: user_id}, function(err, instructor_courses) {
    if(err || instructor_courses == null) {
      console.log("<ERROR> Getting course by instructor with ID:",user_id)
      res.json(err)
    } else {
      console.log("<SUCCESS> Getting course by instructor with ID:",user_id)
      res.json(instructor_courses)
    }
  })
});

module.exports = courseRoutes;


/*
    MeetingTransform:
    
    @desc Transform the structure of the new meeting data from the frontend to the expected structure
    of _meeting_ in MeetinAPI.addMeeting ( _meeting_ ) API call.

    @params
    new_meeting: The meeting object from the frontend data

    @returns
    Returns an array of size 2.
        Index 1 is a boolean that is true if the transform was successful
        Index 2 is the transformed meeting object if the transform was successful, or the error
        object if otherwise.

    Error
        message: String                 -- The message of the error

    -----------------------------------------------------------------------------------------
    Frontend meeting data structure:
    meta: Object                        -- Basic description of the general meeting information
        course_id: String               -- The id of the course this meeting is for
        instructors_note: String        -- A note from the instructor
        meeting_name: String            -- The name of the meeting
        online_meeting_link: String     -- A link to the online meeting, if it exists
        start_time: Date                -- The start time of the live portion of the meeting
        end_time: Date                  -- The end time of the live portion of the meeting
        for_course: Boolean             -- Returns whenther or not this meeting is for a course
        course_org_id: ID               -- If for_course is true, this id is for course. Otherwise its for org

    live: Object                        -- A description of each task provided for the live portion of a meeting
        k in Object.keys(live)
            live[k]: Object             -- A single task for the live portion of a meeting

                type: String            -- Describes the type of task (qr-code, poll, link)
                start_time: Date        -- The start time of the meeting for a section (applies to type: qr-code, poll, link)
                end_time: Date          -- The end time of the task (applies to type: qr-code, poll, link)
                qr_start_time: Date     -- The start time of the qr task
                qr_end_time: Date       -- The end time of the qr task

                questions: [Question: Object]   -- A list of questions (applies only to type: poll)
                    Question
                        question: String -- The question string
                        options: [String] -- List of strings for possible answers
                        correct_answer: Number -- index of the option that is the correct answer

    -----------------------------------------------------------------------------------------
    Backend meeting data structure:
    title: String                       -- The name of the meeting
    start_time: Date                    -- The datetime for the start of the meeting
    end_time: Date                      -- The datetime for the end of the meeting
    for_course: Boolean                 -- Whether the meeting is for a course or not
    course: ID                          -- The id of the course this meeting is for
    org: ID                             -- The id of the organization this meeting is for
    has_live_attendance: Boolean        -- Whether or not there is a live portion for this meeting
    has_async_attendance: Boolean       -- Whether or not there is an async portion for this meeting
    qr_checkins: [QRCode: Object]       -- List of QR code objects that describe a QR code entry
        QRCode
            code: String                -- The string for the QR code
            qr_checkin_start_time: Date -- The datetime for the start of the QR code task
            qr_checkin_end_time: Date   -- The datetime for the end of the QR code task
    recordings: [Recording: Object]     -- List of recording objects
        Recording
            video_url: String           -- url of the video redording
            recording_polls: ID         -- id of the polls for the recording
            recording_submission_start_time -- allowed start time for the recording
            recording_submission_end_time   -- allowed end time for the recording
*/

import MeetingAPI from "@/services/MeetingAPI"

const MeetingTransform = async (new_meeting) => {

    let meeting_ = {}

    // Update the meta data for the meeting
    meeting_.title = new_meeting.meta.meeting_name ? new_meeting.meta.meeting_name : '(untitled)'
    meeting_.for_course = new_meeting.meta.for_course
    if (meeting_.for_course)    meeting_.course = new_meeting.meta.course_org_id
    else                        meeting_.org = new_meeting.meta.course_org_id
    // If there is a live portion of the meeting, there should be a QR portion of the
    if (hasProperty( new_meeting, 'live' )) {

        // assumption: we only have 1 section (backend does not handle multiple sections currently)
        // if we are adding section support, this data needs to be updated.
        let qr_code_tasks = filterObj (new_meeting.live, (a) => a.type && a.type == 'qr-code')
        let qr_code_keys = Object.keys(qr_code_tasks)
        if (Object.keys(qr_code_tasks).length == 0) {
            return [false, MeetingTransformError('Meeting has live section, but no qr-code type is attached.')]
        }

        // set the meeting time as the meeting time set in the qr-code section
        console.log(qr_code_tasks)
        console.log(qr_code_keys)
        console.log(qr_code_keys[0])
        console.log(qr_code_tasks[ qr_code_keys[0] ])
        meeting_.start_time = qr_code_tasks[ qr_code_keys[0] ].start_time
        meeting_.end_time = qr_code_tasks[ qr_code_keys[0] ].end_time

        meeting_.has_live_attendance = true
        // qr_checkins = [QRCodeObj (new_meeting.live[qr_code_index])]
        let qr_checkins = []
        qr_code_keys.forEach(qr_key => {
            qr_checkins.push( QRCodeObj( qr_code_tasks[qr_key] ) )
        })

        meeting_.qr_checkins = qr_checkins
        
    }

    if (hasProperty( new_meeting, 'async' )) {

        meeting_.has_async_attendance = true;

        // Loop through each task and handle based on its type
        let recording_upload_queue = []
        Object.keys(new_meeting.async).forEach(task_id => {

            let task = new_meeting.async[task_id]
            console.log(task)
            if (task.type == 'recording') {

                // upload to GC
                recording_upload_queue.push({
                    video: task.video_blob,
                    start_time: task.start_time,
                    end_time: task.end_time
                })
            }

        })

        // upload all the videos from the upload queue to google cloud!
        if (recording_upload_queue.length > 0) meeting_.recordings = []
        let upload_response = await MeetingAPI.saveRecordingVideosToGCS(recording_upload_queue)
        console.log('upload response', upload_response)
        upload_response.data.forEach((upload_url, q) => {

            meeting_.recordings.push({
                video_url: upload_url,
                recording_submission_start_time: recording_upload_queue[q].start_time,
                recording_submission_end_time: recording_upload_queue[q].end_time
            })
        })
        
    }

    return [true, meeting_];

}

const QRCodeObj = (qr_obj) => {
    return {
        code: generateRandomCode(),
        qr_checkin_start_time: qr_obj.qr_start_time,
        qr_checkin_end_time: qr_obj.end_time
    }
}

const RecordingObjQueue = (recording_obj)  => {
    return {
        recording_file: recording_obj.video_blob,
        start: recording_obj.start_time,
        end: recording_obj.end_time
    }
}

const RecordingObj = (recording_obj, new_url)  => {
    return {
        video_url: new_url,
        recording_submission_start_time: recording_obj.start_time,
        recording_submission_end_time: recording_obj.end_time
    }
}

const hasProperty = (a, b) => {
    return Object.prototype.hasOwnProperty.call(a, b)
}

const filterObj = (obj, func_) => {
    let filtered_ = {}
    let keys_ = Object.keys(obj)
    
    for (let i = 0; i < keys_.length; ++i) {
        if (func_( obj[ keys_[i] ] )) {
            filtered_[ keys_[i] ] = obj[ keys_[i] ]
        }
    }

    return filtered_
}

const MeetingTransformError = (error_message) => {
    return {
        message: error_message
    }
}

const generateRandomCode = () => {
    const alnums = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 4; i > 0; --i) {
        result += alnums[Math.floor(Math.random() * alnums.length)];
    }
    return result;
}

export default MeetingTransform
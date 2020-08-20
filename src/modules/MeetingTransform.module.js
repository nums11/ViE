
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

    live: Object                        -- A description of each task provided for the live portion of a meeting
        k in Object.keys(live)
            live[k]: Object             -- A single task for the live portion of a meeting

                type: String            -- Describes the type of task (qr-code, poll, link)
                start_time: Date        -- The start time of the task (applies to type: qr-code, poll, link)
                end_time: Date          -- The end time of the task (applies to type: qr-code, poll, link)
                
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
*/

const MeetingTransform = (new_meeting) => {

    let meeting_ = {}

    // Update the meta data for the meeting
    meeting_.title = new_meeting.meta.meeting_name ?? '(untitled)'
    // If there is a live portion of the meeting, there should be a QR portion of the
    if (hasProperty( new_meeting, 'live' )) {

    }

    return [true, meeting_];

}

const hasProperty = (a, b) => {
    return Object.prototype.hasOwnProperty.call(a, b)
}

const MeetingTransformError = (error_message) => {
    return {
        message: error_message
    }
}

export default MeetingTransform
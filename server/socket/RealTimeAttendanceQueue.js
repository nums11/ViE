

/*
RealTimeAttendanceQueue:

  @info In order for our application to provide real time attendance submission data,
  we must communicate who attends each event through websockets at the instant that we have
  knowledge of their attendance.
  To do so, we must emit a function to our websocket to the connected client to tell them
  the updated attendance information. This requires us to be able to our socket from outside the
  io.on('connection') function, and thus, we must feed our socket the information by targeting
  to the correct connected socket_id.

  This module is meant to bridge the connection between our api routes and our open socket.
  When a client (frontend) requests live attendance information, we will add their socket_id to the
  queue. Once any student submits an attend API call, we find the socket_id that is associated with
  the same meeting and task that the student just submitted for, and update the client with 
  information about the newly attended user.



*/

const has = (a, b) => { return Object.prototype.hasOwnProperty.call(a, b) }
class RealTimeAttendanceQueue  {

  constructor () {
    this.socketQueue = {}
  }

  /*
    addToQueue (socket_id, meeting_id, task_id)
    @params
      socket_id:  The id of the client requesting the attendance information
      task_id:    The task in which the client wants the attendance information for

    @desc
    Add the socket_id to the queue and associate it with the
    meeting_id and task_id
  */
  addToQueue (socket_id, task_id) {
    if (!socket_id || !task_id) {
      console.error(`<socket.RealTimeAttendanceQueue.addToQueue> Invalid parameteres provided.`)
      return false;
    }


    if (!has(this.socketQueue, task_id))
      this.socketQueue[task_id] = new Set ()

    // add the socket to the meeting id and task id
    this.socketQueue[task_id].add(socket_id)
    return true
  }

  getQueue () {
    return this.socketQueue
  }

  removeFromQueue (socket_id) {
    if (!socket_id) {
      console.error(`<socket.RealTimeAttendanceQueue.removeFromQueue> Invalid parameteres provided.`)
      return false;
    }

    // TODO find a way to remove socket_id from any task pool it may exist in
    Object.keys(this.socketQueue).forEach(task_id => {
      if (this.socketQueue[task_id].has(socket_id)) {
        this.socketQueue[task_id].delete(socket_id)
      }
    })
  }

  /*
    For a given meeting and task, return the array of connected client sockets that
    are waiting to get real time attendance data.
  */
  getSockets (task_id) {
    if (!task_id) {
      throw new Error(`No meeting id or task id provided\n\t(task_id: ${task_id})`)
    }

    if (!has(this.socketQueue, task_id)) return []
    return this.socketQueue[task_id]
  }

}

module.exports = RealTimeAttendanceQueue
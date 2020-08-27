import API from '@/services/API'

export default {
  getRecordings() {
    return API().get('recordings')
  },
  getRecording(id) {
    return API().get('recordings/get/' + id)
  },
  updateRecording(id, recording){
    return API().post('recordings/update/' + id, {
      updated_recording: recording
    })
  },
  deleteRecording (id) {
    return API().delete('recordings/delete/' + id)
  },
}

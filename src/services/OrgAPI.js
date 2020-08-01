import API from '@/services/API'

export default {
  getOrgs() {
    return API().get('orgs')
  },
  addOrg(org) {
    return API().post('orgs/add', {
      org: org
    })
  },
  getOrg(id) {
    return API().get('orgs/get/' + id)
  },
  updateOrg(id, org){
    return API().post('orgs/update/' + id, {
      updated_org: org
    })
  },
  deleteOrg (id) {
    return API().delete('orgs/delete/' + id)
  }
}

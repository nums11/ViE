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
  addBoardMemberToOrg(org_id, user_id, is_general_member) {
    return API().post('orgs/add_board_member/'
      + org_id + '/' + user_id + '/' + is_general_member, {})
  },
  addGeneralMemberToOrg(org_id, user_id, is_board_member) {
    return API().post('orgs/add_general_member/'
      + org_id + '/' + user_id + '/' + is_board_member, {})
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

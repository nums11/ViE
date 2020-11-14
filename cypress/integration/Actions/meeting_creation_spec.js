import 'cypress-file-upload'

/*
if(some_var) {
  load small seed file
} else if (some other var) {
  load med seed file
} else {
  load large seed file
}
*/
before(() => {
  console.log("hmmm")
  cy.log('Seed size', Cypress.env('seed_size'))
  let seed_size = Cypress.env('seed_size')
  if(seed_size === "small")
    cy.log('Seed size was small')
  else
    cy.log('Seed size was NOT small')
  cy.task("log","Will this print")
})


describe('Meeting Creation', () => {

//   // Begin each test from the NewMeeting view
//   beforeEach(() => {
//     cy.visit('/')
//     cy.contains('Dev Login').click()
//     cy.get('#user-id').type('mbizin')
//       .should('have.value', 'mbizin')
//     cy.get('#password').type('nimda')
//     cy.contains('Login').click()
//     cy.url().should('eq', 'http://localhost:8080/#/dashboard')
//     cy.contains('RCOS').click({force: true})
//     cy.contains('Schedule Meeting').click()
//   })
it('does nothing', () => {
  cy.task("log","In test")

})

// Still need to add test for uploading large video file

//   it('Can create a meeting with a live task', () => {
//     cy.get('#meeting-title').type('Meeting with live task')
//       .should('have.value', 'Meeting with live task')
//     cy.get('#qr-checkbox').click()
//     cy.get('#meeting_start').click()
//     cy.get('.left-side-area').click()
//     cy.get('#qr_checkin_start').click()
//     cy.get('.left-side-area').click()
//     cy.contains('Create New Meeting').click()
//     cy.url().should('contain', 'meeting_info')
//     cy.get('#meeting-title-header').should('contain','Meeting with live task')
//     cy.get('#course-name-label').should('contain','RCOS')
//     cy.get('#course-dept-label').should('contain', 'CSCI 2961')
//     cy.contains('(1) Live Tasks')
//     cy.get('.task-info-container').should('contain', 'QR Submission')
//     cy.contains('Dashboard').click({force: true})
//     cy.get('#live-section .meeting-info-pill').should('contain','Meeting with live task')
//       .and('contain', 'CSCI 2961').and('contain', 'RCOS')
//     cy.contains('RCOS').click({force: true})
//     cy.get('.meeting-attendance-pill').contains('Meeting with live task')
//   })

//   it('Can create a meeting with an async task',() => {
//     cy.get('#meeting-title').type('Meeting with async task')
//       .should('have.value', 'Meeting with async task')
//     cy.get('#recording-checkbox').click()
//     cy.get('#recording_submission_start').click()
//     cy.get('.left-side-area').click()
//     cy.fixture('sample1.mp4').then(file_content => {
//       cy.get('#recording-upload-input').attachFile({
//           fileContent: file_content.toString(),
//           fileName: 'sample1.mp4',
//           mimeType: 'video/mp4'
//       })
//     })
//     cy.contains('Create New Meeting').click()
//     cy.url({timeout: 5000}).should('contain', 'meeting_info')
//     cy.get('#meeting-title-header').should('contain','Meeting with async task')
//     cy.get('#course-name-label').should('contain','RCOS')
//     cy.get('#course-dept-label').should('contain', 'CSCI 2961')
//     cy.contains('(1) Asynchronous Tasks')
//     cy.get('.task-info-container').should('contain', 'Recording')
//     cy.contains('Dashboard').click({force: true})
//     cy.get('#async-section .meeting-info-pill').should('contain','Meeting with async task')
//       .and('contain', 'CSCI 2961').and('contain', 'RCOS')
//     cy.contains('RCOS').click({force: true})
//     cy.get('.meeting-attendance-pill').contains('Meeting with async task')
//   })

//   it('Can create a meeting with both a live task and an async task',
//     () => {
//       cy.get('#meeting-title').type('Meeting with live and async task')
//         .should('have.value', 'Meeting with live and async task')
//       cy.get('#qr-checkbox').click()
//       cy.get('#meeting_start').click()
//       cy.get('.left-side-area').click()
//       cy.get('#qr_checkin_start').click()
//       cy.get('.left-side-area').click()
//       cy.get('#recording-checkbox').click()
//       cy.get('#recording_submission_start').click()
//       cy.get('.left-side-area').click()
//       cy.fixture('sample1.mp4').then(file_content => {
//         cy.get('#recording-upload-input').attachFile({
//             fileContent: file_content.toString(),
//             fileName: 'sample1.mp4',
//             mimeType: 'video/mp4'
//         })
//       })
//       cy.contains('Create New Meeting').click()
//       cy.url({timeout: 5000}).should('contain', 'meeting_info')
//       cy.get('#meeting-title-header')
//         .should('contain','Meeting with live and async task')
//       cy.get('#course-name-label').should('contain','RCOS')
//       cy.get('#course-dept-label').should('contain', 'CSCI 2961')
//       cy.contains('(1) Live Tasks')
//       cy.contains('(1) Asynchronous Tasks')
//       cy.get('.task-info-container').should('contain', 'QR Submission')
//         .and('contain', 'Recording')
//       cy.contains('Dashboard').click({force: true})
//       cy.get('#live-section .meeting-info-pill')
//         .should('contain','Meeting with live and async task')
//         .and('contain', 'CSCI 2961').and('contain', 'RCOS')
//       cy.get('#async-section .meeting-info-pill')
//         .should('contain','Meeting with live and async task')
//         .and('contain', 'CSCI 2961').and('contain', 'RCOS')
//       cy.contains('RCOS').click({force: true})
//       cy.get('.meeting-attendance-pill')
//         .contains('Meeting with live and async task')
//     }
//   )

})


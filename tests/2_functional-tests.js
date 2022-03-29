const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Test POST requests', function() {
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      const issue = {
        issue_title: 'Test issue with every field',
        issue_text: 'This issue is to test that every field is filled',
        created_by: 'test_user',
        assigned_to: 'test_user',
        status_text: 'pending'
      }

      chai.request(server)
        .post('/api/issues/:project')
        .send(issue)
        .end((err, res) => {
          if (err) console.error(err)

          const body = res.body

          assert.exists(body._id)
          assert.exists(body.created_on)
          assert.exists(body.updated_on)
          assert.equal(body.issue_title, issue.issue_title)
          assert.equal(body.issue_text, issue.issue_text)
          assert.equal(body.created_by, issue.created_by)
          assert.equal(body.assigned_to, issue.assigned_to)
          assert.isTrue(body.open)
          assert.equal(body.status_text, issue.status_text)
          done()
        })
    })

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      const issue  = {
        issue_title: 'Test issue with only required field',
        issue_text: 'This issue is to test that only the required fields are filled',
        created_by: 'test_user',
        assigned_to: '',
        status_text: ''
      }

      chai.request(server)
        .post('/api/issues/:project')
        .send(issue)
        .end((err, res) => {
          if (err) console.error(err)

          const body = res.body

          assert.exists(body._id)
          assert.exists(body.updated_on)
          assert.equal(body.issue_title, issue.issue_title)
          assert.equal(body.issue_text, issue.issue_text)
          assert.equal(body.created_by, issue.created_by)
          assert.exists(body.assigned_to)
          assert.isTrue(body.open)
          assert.exists(body.status_text)
          done()
        })
    })

    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
      const issue = {
        issue_title: '',
        issue_text: '',
        created_by: '',
        assigned_to: '',
        status_text: ''
      }

      chai.request(server)
        .post('/api/issues/:project')
        .send(issue)
        .end((err, res) => {
          if (err) console.error(err)

          const body = res.body

          assert.exists(body.errors)
          done()
        })
    })
  })
});

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

  suite('Test GET requests', function() {
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      chai.request(server)
        .get('/api/issues/:project')
        .end((err, res) => {
          if (err) console.error(err)

          const body = res.body

          assert.isArray(body)

          if (body.length > 0) {
            body.forEach(issue => {
              assert.isObject(issue)
              assert.property(issue, '_id')
              assert.property(issue, 'issue_title')
              assert.property(issue, 'issue_text')
              assert.property(issue, 'created_on')
              assert.property(issue, 'updated_on')
              assert.property(issue, 'created_by')
              assert.property(issue, 'assigned_to')
              assert.property(issue, 'open')
              assert.property(issue, 'status_text')
            })
          }
          done()
        })
    })

    suite('View issues on a project with one filter: GET request to /api/issues/{project}', function() {
      test('?issue_title=Test 1', function(done) {
        const issue_title = 'Test 1'

        // Create a test issue
        chai.request(server)
          .post('/api/issues/:project')
          .send({
            issue_title,
            issue_text: 'This is to test GET request with one filter',
            created_by: 'me',
            assigned_to: 'me',
            status_text: 'pending'
          })
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/:project?issue_title=${issue_title}`)
              .end((err, res) => {
                if (err) console.error(err)

                const body = res.body

                assert.isArray(body)
                assert.isNotEmpty(body)

                body.forEach(issue => {
                  assert.equal(issue.issue_title, issue_title)
                })
                done()
              })
          })
      })

      test('?issue_text=This is to test a GET request with one filter', function(done) {
        const issue_text = 'This is to test a GET request with one filter'

        // Create a test issue
        chai.request(server)
          .post('/api/issues/:project')
          .send({
            issue_title: 'Test 2',
            issue_text,
            created_by: 'me',
            assigned_to: 'me',
            status_text: 'pending'
          })
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/:project?issue_text=${issue_text}`)
              .end((err, res) => {
                if (err) console.error(err)

                const body = res.body

                assert.isArray(body)
                assert.isNotEmpty(body)

                body.forEach(issue => {
                  assert.equal(issue.issue_text, issue_text)
                })
                done()
              })
          })
      })

      test('?created_by=me', function(done) {
        const created_by = 'me'

        // Create a test issue
        chai.request(server)
          .post('/api/issues/:project')
          .send({
            issue_title: 'Test 3',
            issue_text:  'This is to test GET request with one filter',
            created_by,
            assigned_to: 'me',
            status_text: 'pending'
          })
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/:project?created_by=${created_by}`)
              .end((err, res) => {
                if (err) console.error(err)

                const body = res.body

                assert.isArray(body)
                assert.isNotEmpty(body)

                body.forEach(issue => {
                  assert.equal(issue.created_by, created_by)
                })
                done()
              })
          })
      })

      test('?assigned_to=me', function(done) {
        const assigned_to = 'me'

        // Create a test issue
        chai.request(server)
          .post('/api/issues/:project')
          .send({
            issue_title: 'Test 4',
            issue_text:  'This is to test GET request with one filter',
            created_by: 'me',
            assigned_to,
            status_text: 'pending'
          })
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/:project?assigned_to=${assigned_to}`)
              .end((err, res) => {
                if (err) console.error(err)

                const body = res.body

                assert.isArray(body)
                assert.isNotEmpty(body)

                body.forEach(issue => {
                  assert.equal(issue.assigned_to, assigned_to)
                })
                done()
              })
          })
      })

      test('?open=false', function(done) {
        const open = false

        // Create a test issue
        chai.request(server)
          .post('/api/issues/:project')
          .send({
            issue_title: 'Test 5',
            issue_text:  'This is to test GET request with one filter',
            created_by: 'me',
            assigned_to: 'me',
            open,
            status_text: 'pending'
          })
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/:project?open=${open}`)
              .end((err, res) => {
                if (err) console.error(err)

                const body = res.body

                assert.isArray(body)
                assert.isNotEmpty(body)

                body.forEach(issue => {
                  assert.isFalse(issue.open)
                })
                done()
              })
          })
      })

      test('?status_text=closed', function(done) {
        const status_text = 'closed'

        // Create a test issue
        chai.request(server)
          .post('/api/issues/:project')
          .send({
            issue_title: 'Test 6',
            issue_text:  'This is to test GET request with one filter',
            created_by: 'me',
            assigned_to: 'me',
            open: false,
            status_text
          })
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/:project?status_text=${status_text}`)
              .end((err, res) => {
                if (err) console.error(err)

                const body = res.body

                assert.isArray(body)
                assert.isNotEmpty(body)

                body.forEach(issue => {
                  assert.equal(issue.status_text, status_text)
                })
                done()
              })
          })
      })
    })

    suite('View issues on a project with multiple filters: GET request to /api/issues/{project}', function() {
      test('?created_by=me&open=false', function(done) {
        const created_by = 'me'
        const open = false

        chai.request(server)
          .get(`/api/issues/:project?created_by=${created_by}&open=${open}`)
          .end((err, res) => {
            if (err) console.error(err)

            const body = res.body

            assert.isArray(body)
            assert.isNotEmpty(body)

            body.forEach(issue => {
              assert.equal(issue.created_by, created_by)
              assert.equal(issue.open, open)
            })
            done()
          })
      })
    })
  })
});

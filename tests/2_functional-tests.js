const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Test POST requests', function() {
    this.timeout(5000)
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
      setTimeout(done, 3000)
      const issue = {
        issue_title: 'Test issue with every field',
        issue_text: 'This issue is to test that every field is filled',
        created_by: 'me',
        assigned_to: 'me',
        status_text: 'pending'
      }

      chai.request(server)
        .post('/api/issues/apitest')
        .send(issue)
        .end((err, res) => {
          if (err) console.error(err)

          assert.include(res.body, issue)
        })
    })

    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
      setTimeout(done, 3000)
      const issue  = {
        issue_title: 'Test issue with only required field',
        issue_text: 'This issue is to test that only the required fields are filled',
        created_by: 'me',
        assigned_to: '',
        status_text: ''
      }

      chai.request(server)
        .post('/api/issues/apitest')
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
        .post('/api/issues/apitest')
        .send(issue)
        .end((err, res) => {
          if (err) console.error(err)

          assert.deepEqual(res.body, { error: 'required field(s) missing' })
          done()
        })
    })
  })

  suite('Test GET requests', function() {
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
      this.timeout(5000)
      setTimeout(done, 2000)
      chai.request(server)
        .get('/api/issues/apitest')
        .end((err, res) => {
          if (err) console.error(err)

          const body = res.body

          assert.isArray(body)

          if (body.length > 0) {
            const issue = body[body.length - 1]

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
          }
        })
    })

    suite('View issues on a project with one filter: GET request to /api/issues/{project}', function() {
      test('?issue_title=Test 1', function(done) {
        const issue_title = 'Test 1'

        // Create a test issue
        chai.request(server)
          .post('/api/issues/apitest')
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
              .get(`/api/issues/apitest?issue_title=${issue_title}`)
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
          .post('/api/issues/apitest')
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
              .get(`/api/issues/apitest?issue_text=${issue_text}`)
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
          .post('/api/issues/apitest')
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
              .get(`/api/issues/apitest?created_by=${created_by}`)
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
        const newIssue = {
          issue_title: 'Test 4',
          issue_text:  'This is to test GET request with one filter',
          created_by: 'me',
          assigned_to,
          status_text: 'pending'
        }

        // Create a test issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            // View filtered issues
            chai.request(server)
              .get(`/api/issues/apitest?assigned_to=${assigned_to}`)
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
          .post('/api/issues/apitest')
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
              .get(`/api/issues/apitest?open=${open}`)
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
          .post('/api/issues/apitest')
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
              .get(`/api/issues/apitest?status_text=${status_text}`)
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
          .get(`/api/issues/apitest?created_by=${created_by}&open=${open}`)
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

  suite('Test PUT request', function() {
    suite('Update one field on an issue: PUT request to /api/issues/{project}', function() {
      test('issue_title = Updated title', function(done) {
        const newIssue = {
          issue_title: 'Title to be updated',
          issue_text:  'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a test issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const issue_title = 'Updated title'
            const updatedIssue = {
              _id,
              issue_title,
              issue_text: '',
              created_by: '',
              assigned_to: '',
              status_text: '',
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, updatedIssue.issue_text)
                    assert.equal(doc.created_by, updatedIssue.created_by)
                    assert.equal(doc.assigned_to, updatedIssue.assigned_to)
                    assert.equal(doc.status_text, updatedIssue.status_text)
                    assert.isAbove(Date.parse(doc.updated_on), Date.parse(doc.created_on))

                    done()
                  })
              })
          })
      })

      test('issue_text = Updated text', function(done) {
        const newIssue = {
          issue_title: 'Issue text to be updated',
          issue_text:  'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const issue_text = 'Updated text'
            const updatedIssue = {
              _id,
              issue_title: '',
              issue_text,
              created_by: '',
              assigned_to: '',
              status_text: ''
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, issue_text)
                    assert.equal(doc.created_by, updatedIssue.created_by)
                    assert.equal(doc.assigned_to, updatedIssue.assigned_to)
                    assert.equal(doc.status_text, updatedIssue.status_text)
                    assert.isAbove(Date.parse(doc.updated_on), Date.parse(doc.created_on))

                    done()
                  })
              })
          })
      })

      test('created_by = you', function(done) {
        const newIssue = {
          issue_title: 'Update owner',
          issue_text:   'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const created_by = 'you'
            const updatedIssue = {
              _id,
              issue_title: '',
              issue_text: '',
              created_by,
              assigned_to: '',
              status_text: ''
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, updatedIssue.issue_text)
                    assert.equal(doc.created_by, created_by)
                    assert.equal(doc.assigned_to, updatedIssue.assigned_to)
                    assert.equal(doc.status_text, updatedIssue.status_text)

                    done()
                  })
              })
          })
      })

      test('assigned_to = you', function(done) {
        const newIssue = {
          issue_title: 'Update assignee',
          issue_text: 'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const assigned_to = 'you'
            const updatedIssue = {
              _id,
              issue_title: '',
              issue_text: '',
              created_by: '',
              assigned_to: 'you',
              status_text: ''
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, updatedIssue.issue_text)
                    assert.equal(doc.created_by, updatedIssue.created_by)
                    assert.equal(doc.assigned_to, assigned_to)
                    assert.equal(doc.status_text, updatedIssue.status_text)

                    done()
                  })
              })
          })
      })

      test('open = false', function(done) {
        const newIssue = {
          issue_title: 'Update status text',
          issue_text: 'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const open = false
            const updatedIssue = {
              _id,
              issue_title: '',
              issue_text: '',
              created_by: '',
              assigned_to: '',
              open,
              status_text: ''
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, updatedIssue.issue_text)
                    assert.equal(doc.created_by, updatedIssue.created_by)
                    assert.equal(doc.assigned_to, updatedIssue.assigned_to)
                    assert.equal(doc.open, open)
                    assert.equal(doc.status_text, updatedIssue.status_text)

                    done()
                  })
              })
          })
      })

      test('status_text = closed', function(done) {
        const newIssue = {
          issue_title: 'Update status text',
          issue_text: 'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const status_text = 'closed'
            const updatedIssue = {
              _id,
              issue_title: '',
              issue_text: '',
              created_by: '',
              assigned_to: '',
              status_text: 'closed'
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, updatedIssue.issue_text)
                    assert.equal(doc.created_by, updatedIssue.created_by)
                    assert.equal(doc.assigned_to, updatedIssue.assigned_to)
                    assert.equal(doc.status_text, status_text)

                    done()
                  })
              })
          })
      })
    })

    suite('Update multiple fields on an issue: PUT request to /api/issues/{project}', function() {
      test('Update every field', function(done) {
        const newIssue = {
          issue_title: 'Update multiple fields on an issue',
          issue_text: 'This is to test PUT request for one field',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const updatedIssue = {
              _id,
              issue_title: 'Update multiple fields',
              issue_text: 'Every fields have been updated',
              created_by: 'you',
              assigned_to: 'you',
              open: false,
              status_text: 'closed'
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })

                chai.request(server)
                  .get(`/api/issues/apitest?_id=${_id}`)
                  .end((err, res) => {
                    if (err) console.error(err)

                    const doc = res.body[0]

                    assert.equal(doc._id, _id)
                    assert.equal(doc.issue_title, updatedIssue.issue_title)
                    assert.equal(doc.issue_text, updatedIssue.issue_text)
                    assert.equal(doc.created_by, updatedIssue.created_by)
                    assert.equal(doc.assigned_to, updatedIssue.assigned_to)
                    assert.equal(doc.status_text, updatedIssue.status_text)

                    done()
                  })
              })
          })
      })
    })

    suite('Update an issue with missing _id: PUT request to /api/issues/{project}', function() {
      test('Missing _id should return an error', function(done) {
        const updatedIssue = {
          issue_title: 'Missing _id',
          issue_text: 'No issue will be updated',
          created_by: 'you',
          assigned_to: 'you',
          open: false,
          status_text: 'closed'
        }
        chai.request(server)
          .put('/api/issues/apitest')
          .send(updatedIssue)
          .end((err, res) => {
            if (err) console.error(err)

            assert.deepEqual(res.body, { error: 'missing _id' })
            done()
          })
      })
    })

    suite('Update an issue with no fields to update: PUT request to /api/issues/{project}', function() {
      test('Empty fields updated', function (done) {
        const newIssue = {
          issue_title: 'Empty fields updated',
          issue_text: 'Fields will be emptied',
          created_by: 'you',
          assigned_to: 'you',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const updatedIssue = {
              _id,
              issue_title: '',
              issue_text: '',
              created_by: '',
              assigned_to: '',
              status_text: ''
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { result: 'successfully updated', _id })
                done()
              })
          })
      })
    })

    suite('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function() {
      test('An invalid _id should return an error', function(done) {
        const _id = 'THIS ID IS CERTAINLY NOT VALID'
        const updatedIssue = {
          _id,
          issue_title: 'No field to updated',
          issue_text: 'Every field should remain the same',
          created_by: 'you',
          assigned_to: 'you',
          status_text: 'pending'
        }

        // Update the issue
        chai.request(server)
          .put('/api/issues/apitest')
          .send(updatedIssue)
          .end((err, res) => {
            if (err) console.error(err)

            assert.deepEqual(res.body, { error: 'could not update', _id })
            done()
          })
      })
    })

    suite('The PUT request sent to /api/issues/{projectname} does not include update fields', function() {
      test('Missing update field', function(done) {
        const newIssue = {
          issue_title: 'Missing update fields',
          issue_text: 'One of more fields are missing in the PUT request',
          created_by: 'me',
          assigned_to: 'me',
          status_text: 'pending'
        }

        // Create a new issue
        chai.request(server)
          .post('/api/issues/apitest')
          .send(newIssue)
          .end((err, res) => {
            if (err) console.error(err)

            const { _id } = res.body
            const updatedIssue = {
              _id
            }

            // Update the issue
            chai.request(server)
              .put('/api/issues/apitest')
              .send(updatedIssue)
              .end((err, res) => {
                if (err) console.error(err)

                assert.deepEqual(res.body, { error: 'no update field(s) sent', _id })
                done()
              })
          })
      })
    })
  })

  suite('Test DELETE request', function() {
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
      const newIssue = {
        issue_title: 'Delete issue',
        issue_text: 'This issue should be deleted right after its creation',
        created_by: 'me',
        assigned_to: 'me',
        status_text: 'pending'
      }

      // Create a new issue
      chai.request(server)
        .post('/api/issues/apitest')
        .send(newIssue)
        .end((err, res) => {
          if (err) console.error(err)

          const { _id } = res.body

          // Delete the issue
          chai.request(server)
            .delete('/api/issues/apitest')
            .send({ _id })
            .end((err, res) => {
              if (err) console.error(err)

              assert.include(res.body, { result: 'successfully deleted', _id })
              done()
            })
        })
    })

    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
      const _id = { _id: 'a bunch of non sense' }

      // Delete issue
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({ _id })
        .end((err, res) => {
          if (err) console.error(err)

          assert.deepEqual(res.body, { error: 'could not delete', _id })
          done()
        })
    })

    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
      // Delete issue
      chai.request(server)
        .delete('/api/issues/apitest')
        .send({ foo: 'bar' })
        .end((err, res) => {
          if (err) console.error(res)

          assert.deepEqual(res.body, { error: 'missing _id' })
          done()
        })
    })
  })
});

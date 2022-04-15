'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose
const MONGO_URI = process.env.MONGO_URI

module.exports = function (app) {

  let Issue
  const models = {}
  const issueSchema = new Schema({
    issue_title: String,
    issue_text: String,
    created_on: Date,
    updated_on: Date,
    created_by: String,
    assigned_to: String,
    open: Boolean,
    status_text: String
  }, {
    versionKey: false
  })

  mongoose.connect(MONGO_URI)

  app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        open,
        status_text
      } = req.query

      // Choose model
      try {
        Issue = mongoose.model(project, issueSchema)
        models[project] = Issue
      } catch(e) {
        // console.log('Current model: ' + project)
      } finally {
        Issue = models[project]
      }

      Issue.find((err, docs) => {
        if (err) console.error(err)

        let result = [...docs]
        if (_id) {
          result = result.filter(doc => doc._id.toString() === _id)
        }
        if (issue_title) {
          result = result.filter(doc => doc.issue_title === issue_title)
        }
        if (issue_text) {
          result = result.filter(doc => doc.issue_text === issue_text)
        }
        if (created_by) {
          result = result.filter(doc => doc.created_by === created_by)
        }
        if (assigned_to) {
          result = result.filter(doc => doc.assigned_to === assigned_to)
        }
        if (open) {
          result = result.filter(doc => doc.open === JSON.parse(open))
        }
        if (status_text) {
          result = result.filter(doc => doc.status_text === status_text)
        }

        res.send(result)
      })
    })

    .post(function (req, res){
      let project = req.params.project
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        open,
        status_text
      } = req.body

      // Empty required field
      if (!issue_title || !issue_text || !created_by) {
        return res.send({ error: 'required field(s) missing' })
      }

      // Choose model
      try {
        Issue = mongoose.model(project, issueSchema)
        models[project] = Issue
      } catch(e) {
        // console.log('Current model: ' + project)
      } finally {
        Issue = models[project]
      }


      // Instantiate a new issue
      const date = new Date()
      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_on: date,
        updated_on: date,
        created_by,
        assigned_to: assigned_to === undefined ? '' : assigned_to,
        open: open === undefined ? true : open,
        status_text: status_text === undefined ? '' : status_text
      })

      newIssue.save()
        .then(response => res.send(response))
        .catch(err => res.send({ error: 'required field(s) missing' }))
    })

    .put(function (req, res){
      let project = req.params.project
      const { _id } = req.body

      // Empty _id input
      if(!_id) return res.send({ error: 'missing _id' })

      // Choose model
      try {
        Issue = mongoose.model(project, issueSchema)
        models[project] = Issue
      } catch(e) {
        // console.log('Current model: ' + project)
      } finally {
        Issue = models[project]
      }

      const updatedIssue = {}

      for (const key in req.body) {
        if (key && key !== '_id') {
          updatedIssue[key] = req.body[key]
        }
      }

      // Check when no field is sent
      if (Object.keys(updatedIssue).length === 0) return res.send({ error: 'no update field(s) sent', _id })

      // Update updated_on
      updatedIssue.updated_on = new Date()

      Issue.findByIdAndUpdate(_id, { $set: updatedIssue }, { new: true }, (err, doc) => {
        if (err || !doc) return res.send({ error: 'could not update', _id })

        res.send({ result: 'successfully updated', _id })
      })
    })

    .delete(function (req, res){
      let project = req.params.project
      const { _id } = req.body

      // Missing _id
      if (!_id) return res.send({ error: 'missing _id' })

      // Choose model
      try {
        Issue = mongoose.model(project, issueSchema)
        models[project] = Issue
      } catch(e) {
        //console.log('Current model: ' + project)
      } finally {
        Issue = models[project]
      }

      Issue.findByIdAndDelete(_id, (err, doc) => {
        // Invalid _id format
        if (err || !doc) return res.send({ error: 'could not delete', _id })

        res.send({ result: 'successfully deleted', _id })
      })
    });
};

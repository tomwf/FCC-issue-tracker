'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose
const MONGO_URI = process.env.MONGO_URI

module.exports = function (app) {

  let Issue
  const models = {}
  const issueSchema = {
    issue_title: {
      type: String,
      required: true
    },
    issue_text: {
      type: String,
      required: true
    },
    created_on: Date,
    updated_on: Date,
    created_by: {
      type: String,
      required: true
    },
    assigned_to: String,
    open: Boolean,
    status_text: String
  }

  mongoose.connect(MONGO_URI)

  app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project
      const {
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
        console.log('Current model: ' + project)
      } finally {
        Issue = models[project]
      }

      Issue.find((err, docs) => {
        if (err) console.error(err)

        let result = docs
        if (issue_title) {
          result = result.filter(issue => issue.issue_title === issue_title)
        }
        if (issue_text) {
          result = result.filter(issue => issue.issue_text === issue_text)
        }
        if (created_by) {
          result = result.filter(issue => issue.created_by === created_by)
        }
        if (assigned_to) {
          result = result.filter(issue => issue.assigned_to === assigned_to)
        }
        if (open) {
          result = result.filter(issue => issue.open === JSON.parse(open))
        }
        if (status_text) {
          result = result.filter(issue => issue.status_text === status_text)
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
      const date = new Date()

      // Choose model
      try {
        Issue = mongoose.model(project, issueSchema)
        models[project] = Issue
      } catch(e) {
        console.log('Current model: ' + project)
      } finally {
        Issue = models[project]
      }

      // Instantiate a new issue
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

    .put(function (req, res, next){
      let project = req.params.project ? req.params.project : 'apitest';

      if (!models.hasOwnProperty(project)) {
        models[project] = mongoose.model(project, issueSchema)
      }

      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body

      Issue = models[project]
      Issue.findById(_id, (err, issue) => {
        if (err) console.error(err)

        try {
          if (issue_title) issue.issue_title = issue_title
          if (issue_text) issue.issue_text = issue_text
          if (created_by) issue.created_by = created_by
          if (assigned_to) issue.assigned_to = assigned_to
          if (status_text) issue.status_text = status_text
          if (open !== undefined) issue.open = open

          issue.save()
            .then(response => res.send(response))
            .catch(err => res.send(err))
        } catch(err) {
          next(err)
        }
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

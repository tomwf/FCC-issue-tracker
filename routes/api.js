'use strict';

const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI

//Issue model
const Issue = mongoose.model('Issue', {
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
})

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        open,
        status_text
      } = req.query

      mongoose.connect(MONGO_URI)

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

        res.json(result)
      })
    })

    .post(function (req, res){
      let project = req.params.project;
      const body = req.body
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        open,
        status_text
      } = req.body
      const date = new Date().toISOString()

      mongoose.connect(MONGO_URI)

      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_on: date,
        updated_on: date,
        created_by,
        assigned_to,
        open: open === undefined ? true : open,
        status_text
      })

      newIssue.save()
        .then(response => res.send(response))
        .catch(err => res.send(err))
    })

    .put(function (req, res){
      let project = req.params.project;

    })

    .delete(function (req, res){
      let project = req.params.project;

    });

};

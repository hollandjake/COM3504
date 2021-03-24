const express = require('express');
const router = express.Router();

const jobs = require("../controllers/job");

router.get('/list',  async function(req, res) {
    res.send(await jobs.getAll());
});

router.get('/:jobId',  async function( req, res) {
    res.render('job', {title: `Job`});
})

router.get('/:jobId/list',  async function( req, res) {
    res.send(await jobs.get(req.params['jobId']));
})


module.exports = router;
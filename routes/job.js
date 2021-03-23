const express = require('express');
const router = express.Router();

const jobs = require("../controllers/job");

router.get('/list',  async function(req, res) {
    res.send(await jobs.getAll());
});

router.get('/:jobId',  async function( req, res) {
    let job = await jobs.get(req.params['jobId']);
    res.render('job', {title: `Job - ${job.name}`,job: job});
})


module.exports = router;
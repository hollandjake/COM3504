const express = require('express');
const router = express.Router();

const jobs = require("../controllers/job");

router.get('/list',  async function(req, res) {
    res.send(await jobs.getAll());
});

module.exports = router;
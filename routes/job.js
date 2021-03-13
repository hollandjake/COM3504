const express = require('express');
const router = express.Router();

const jobs = require("../controllers/job");

router.get('/list',  jobs.getAll);

module.exports = router;
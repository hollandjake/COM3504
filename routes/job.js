const express = require('express');
const router = express.Router();

const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()});

const jobController = require("../controllers/job");
const imageController = require('../controllers/image');

router.get('/list', async function (req, res) {
    if ("id" in req.query) {
        let foundJob = await jobController.get(req.query['id']);
        if (foundJob) res.json({status: 200, job: foundJob});
        else res.status(404).json({
            status: 404,
            error: 'Job not found'
        })
    } else {
        res.send(await jobController.getAll());
    }
});

router.post('/create', upload.any(), async function (req, res) {
    try {
        let jobImage = imageController.parseImage(req);
        if (!jobImage) {
            res.status(400).json({
                status: 400,
                error: 'Failed to create Job - No image file specified',
                job: req.body
            });
            return;
        }
        let job = await jobController.addJob({
            name: req.body['job_name'],
            creator: req.body['job_creator'],
            imageSequence: [jobImage]
        });

        require('../bin/www').io.of('/job').emit('newJob', job);
        res.json({
            status: 200,
            job: job
        })
    } catch (e) {
        res.status(400).json({
            status: 400,
            error: 'Failed to create Job',
            job: req.body
        });
    }
})

router.get('/', async function (req, res) {
    if ("id" in req.query) {
        res.render('job', {title: `Job`, jobID: req.query['id']});
    } else {
        res.render('job', {title: `Job`, jobID: null});
    }
})

router.post('/add-image', upload.any(), async function (req, res) {
    try {
        let jobImage = imageController.parseImage(req);
        if (!jobImage) {
            res.status(400).json({
                status: 400,
                error: 'Failed to add Image - No image file specified',
                image: req.body
            });
            return;
        }
        let image = await jobController.addImage(req.query['id'], jobImage);
        require('../bin/www').io.of('/job').in(req.query['id']).emit('newImage', image._id);
        res.json({
            status: 200,
            image: image
        })
    } catch (e) {
        res.status(400).json({
            status: 400,
            error: 'Failed to add image',
            image: req.body
        });
    }
})


module.exports = router;
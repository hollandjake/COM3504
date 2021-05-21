const express = require('express');
const router = express.Router();

const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()});

const jobController = require("../controllers/job");
const imageController = require('../controllers/image');

/*
List all available jobs (used with the idb to preload all images in the background)
with optional filter to get data for a specific job
*/
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

/* Create a new job including the initial image */
router.post('/create', upload.any(), async function (req, res) {
    try {
        let jobImage = await imageController.parseImage(req);
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
            error: `Failed to create Job:\n${Object.values(e.errors).map(e => `- ${e.message}`).join("\n")}`,
            job: req.body
        });
    }
})

/* GET the rendered view for a job */
router.get('/', async function (req, res) {
    if ("id" in req.query) {
        res.render('job', {title: `Job`, jobID: req.query['id']});
    } else {
        res.render('job', {title: `Job`, jobID: null});
    }
})

/*
add an image to a job

Also triggers the socket event to inform people of a new Image
*/
router.post('/add-image', upload.any(), async function (req, res) {
    try {
        let jobImage = await imageController.parseImage(req);
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
            error: `Failed to add Image:\n${Object.values(e.errors).map(e => `- ${e.message}`).join("\n")}`,
            image: req.body
        });
    }
})


module.exports = router;
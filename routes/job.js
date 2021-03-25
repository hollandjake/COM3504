const express = require('express');
const router = express.Router();

const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()});

const jobs = require("../controllers/job");

router.get('/list', async function (req, res) {
    res.send(await jobs.getAll());
});

router.post('/create', upload.any(), async function (req, res) {
    try {
        let jobImage = {
            title: req.body.image_title,
            author: req.body.image_author,
            description: req.body.image_description,
        };
        if (req.files && req.files.length > 0) {
            let imageData = req.files[0].buffer.toString('base64');

            jobImage.imageUrl = `data:image/png;base64,${imageData}`;
        } else if (req.body.image_url) {
            jobImage.imageUrl = req.body.image_url;
        } else {
            res.status(400).json({
                status: 400,
                error: 'Failed to create Job - No image file specified',
                job: req.body
            });
            return;
        }
        let job = await jobs.addJob({
            name: req.body.name,
            creator: req.body.creator,
            imageSequence: [jobImage]
        });

        console.log("New Job Created: " + job.name);

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

router.get('/:jobId', async function (req, res) {
    res.render('job', {title: `Job`});
})

router.get('/:jobId/list', async function (req, res) {
    res.send(await jobs.get(req.params['jobId']));
})


module.exports = router;
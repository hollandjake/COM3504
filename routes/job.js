const express = require('express');
const router = express.Router();

const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()});

const jobController = require("../controllers/job");
const imageController = require('../controllers/image');

router.get('/list', async function (req, res) {
    res.send(await jobController.getAll());
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

router.get('/:jobId', async function (req, res) {
    res.render('job', {title: `Job`, jobID: req.params['jobId']});
})

router.post('/:jobId/add-image', upload.any(), async function (req, res) {
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
        let image = await jobController.addImage(req.params['jobId'],jobImage);
        // req.socket.broadcast.in(req.params['jobId']).emit('newImage', image);
        require('../bin/www').io.of('/job').in(req.params['jobId']).emit('newImage', {
            status: 200,
            image: image
        });
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

router.get('/:jobId/list', async function (req, res) {
    res.send(await jobController.get(req.params['jobId']));
})


module.exports = router;
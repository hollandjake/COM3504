const express = require('express');
const router = express.Router();

const multer = require('multer')
const upload = multer({storage: multer.memoryStorage()});

const imageController = require('../controllers/image');

/* Get all available images (used with the idb to preload all images in the background) */
router.get('/list', async function (req, res) {
    res.send(await imageController.getAll());
});

/* Create a new image */
router.post('/create', upload.any(), async function (req, res) {
    try {
        let image = await imageController.parseImage(req);
        if (!image) {
            res.status(400).json({
                status: 400,
                error: 'Failed to create Image - No image file specified'
            });
            return;
        }
        imageController.addImage(image);
        res.json({
            status: 200,
            image: image
        })
    } catch (e) {
        res.status(400).json({
            status: 400,
            error: 'Failed to create Image'
        });
    }
})

/* Fetches a single image */
router.get('/', async function (req, res) {
    if ("id" in req.query) {
        const image = await imageController.get(req.query['id']);
        if (image) {
            res.json({
                status: 200,
                image: image
            })
        } else {
            res.status(404).json({
                status: 404,
                error: 'Image not found'
            })
        }
    } else {
        res.json({
            status: 400,
            error: 'No image id specified try "/image?id=someid"'
        })
    }
})

module.exports = router;
var express = require('express');
var router = express.Router();
const multer = require('multer');
const multerS3 = require("multer-s3");
const mongoose = require('mongoose');
const fs = require('fs');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
})

const upload = multer({ storage }).single('file');

router.get('/', async (req, res) => {
    if (!req.user) {
        res.redirect('/users/login');
    }
    else {
        var courses = await Subject.find({});
        var sendInfo = Array();
        for (let course of courses) {
            var ele = {};
            ele._id = course._id;
            ele.courseCode = course.courseCode;
            ele.courseName = course.courseName;
            var arrBooks = Array();
            var arrPapers = Array();
            var materials = await Material.find({ courseId: course._id });

            for (let material of materials) {
                if (material.isBook == true) {
                    arrBooks.push(material);
                }
                else {
                    arrPapers.push(material);
                }
            }
            ele.books = arrBooks;
            ele.papers = arrPapers;
            sendInfo.push(ele);
        }
        res.render('library', { title: 'VITdost - Library', courses: sendInfo });
    }
});


router.post('/:id/upload', upload, async (req, res) => {
    const file = req.file;
    const myFile = file.originalname;
    const course = await Subject.findOne({ courseCode: req.params.id });
    if (!course) {
        res.redirect('/error');
    }
    else {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${myFile}`,
            Body: req.file.buffer
        }
        s3.upload(params, async (error, data) => {
            if (error) {
                res.redirect('/error');
            }
            var newMaterial = new Material({
                courseId: course._id,
                location: data.Location,
                uploadedBy: req.user._id,
                title: req.body.name,
            });
            if (req.body.bookOrPaper == "1") {
                newMaterial.isBook = true;
                await newMaterial.save();
                res.redirect('/library');
            }
            else {
                newMaterial.isPaper = true;
                await newMaterial.save();
                res.redirect('/library');
            }
        })
    }
});


// Upload File

//   var newAttempt = new Project({
//     isVideoInterview : true,
//     title : ques.category,
//     videoInterviewQuestion : req.body.questionid,
//     videoFile: `${process.env.AWS_URI}${req.files[0].originalname}`,
//     createdAt: new Date(),
//     createdBy: req.user._id
//   });

//   newAttempt.save(function (err, data) {
//     if (err) console.log(err);
//   });

router.post('/addnewcourse', async (req, res) => {
    var newCourse = new Subject({
        courseCode: req.body.coursecode,
        courseName: req.body.coursename
    });

    await newCourse.save();
    res.redirect('/library');
})


module.exports = router;

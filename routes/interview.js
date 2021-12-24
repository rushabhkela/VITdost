var express = require('express');
var router = express.Router();
const multer = require('multer');
const multerS3 = require("multer-s3");
const upload = multer();
const fs = require('fs');
const mongoose = require('mongoose');

// Take an interview
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

router.get('/', async (req, res) => {
    res.render('interviewhome', { title: 'VITdost - Take an Interview' });
})

router.get('/error', async (req, res) => {
    res.render('nointerview', { title: 'VITdost' });
})

router.get('/takeinterview/:type', async (req, res) => {
    if (!req.user) {
        res.redirect('/users/login');
    }
    else {
        const questions = await Question.find({ domain: req.params.type });
        var quesToSend = "";
        for (let ques of questions) {
            var attempt = await Attempt.findOne({ ofUser: req.user._id, questionId: ques._id });
            if (!attempt) {
                quesToSend = ques;
                break;
            }
        }
        if (quesToSend == "") {
            res.redirect('/interviews/error');
        }
        else {
            res.render('interview', { title: 'VITdost - Interview', question: quesToSend, layout: 'empty' });
        }
    }
})

router.get('/fail/:id', async (req, res) => {
    var newAttempt = new Attempt({
        ofUser: req.user._id,
        questionId: req.params.id,
        videoLink: "fail",
        timestamp: new Date(),
        isFailed: true
    });
    await newAttempt.save();
    res.redirect('/interviews/submit');
})

router.get('/submit', async (req, res) => {
    res.render('interviewsubmit', { title: 'VITdost - Finish Interview' });
});


router.post('/finish', upload.any(), async (req, res) => {
    console.log(req.files);
    console.log(req.body.question);

    const question = await Question.findOne({ question: req.body.question });
    const temp = await Attempt.findOne({ questionId: question._id, ofUser: req.user._id });
    if (temp != null) {
        res.redirect('/error');
    }
    else {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${question._id}-${req.user._id}.webm`,
            Body: req.files[0].buffer
        }
        s3.upload(params, async (error, data) => {
            if (error) {
                res.redirect('/error');
            }
            var newAttempt = new Attempt({
                ofUser: req.user._id,
                questionId: question._id,
                videoLink: data.Location,
                timestamp: new Date()
            });
            await newAttempt.save();
            res.status(200).json({ "message": "uploaded" });
        })
    }
})



// Interview Feed

router.get('/feed', async (req, res) => {
    if (!req.user) {
        res.redirect('/users/login');
    }
    else {
        const interviews = await Attempt.find({ isFailed: false });
        var data = Array();
        for (let interview of interviews) {
            var d = {};
            var user = await User.findOne({ _id: interview.ofUser });
            d.id = (interview._id).toString();
            d.username = user.name;
            d.videoLink = interview.videoLink;
            d.comments = Array();
            for (let c of interview.comments) {
                user = await User.findOne({ _id: c.user });
                d.comments.push({
                    name: user.name,
                    comment: c.comment
                });
            }
            data.push(d);
        }
        console.log(data[0].comments);
        res.render('interviewfeed', { title: 'VITdost - Interviews', interviews: data });
    }
})

router.post('/addcomments', async (req, res) => {
    var interview = await Attempt.findOne({ _id: mongoose.Types.ObjectId(req.body.id) });
    var temp = interview.comments;
    temp.push({
        user: req.user._id,
        comment: req.body.message,
        timestamp: new Date()
    });
    interview.comments = temp;
    await interview.save();
    res.status(200).json({ "message": "success" });
})

// router.get('/test', async(req, res) => {
//     var techquestions = [
//         'Relate as many OS concepts as you can in a traffic light system scenario?',
//         'Explain ACID properties in DBMS.',
//         'Why do we need normalization of databases?',
//         'What are the advantages of DBMS over a File System Storage?',
//         'Explain in short the OSI model.',
//         'Differentiate between TCP and UDP.',
//         'Explain Multithreading with an example.',
//         'How are linked lists more efficient than arrays?',
//         'Which data structures are used for implementing LRU cache?',
//     ];
//     var hrquestions = [
//         'Describe a situation when you worked with others on a project and your teammates disagreed with your ideas. How did you respond? What were some of your (collective) challenges and how did you resolve them?',
//         'Describe a project you previously worked on with a team. What made the team successful?',
//         'How would you coach someone else on building trust?',
//         'Tell me about a time when you had a positive impact on a project. How did you measure your success?',
//         'Tell me about a time when you were confused about details of a request. What steps did you take to clarify things?',
//         'Have you ever had a project not go according to plan? What happened? What did you do to get it back on track?',
//         'Give an introduction of yourself.'
//     ];

//     for(let ques of techquestions) {
//         var newQuestion = new Question({
//             question: ques,
//             domain: "technical"
//         });
//         await newQuestion.save();
//     }
//     for(let ques of hrquestions) {
//         var newQuestion = new Question({
//             question: ques,
//             domain: "hr"
//         });
//         await newQuestion.save();
//     }
// })



module.exports = router;

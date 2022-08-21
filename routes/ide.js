var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
var dotenv = require('dotenv');
dotenv.config({ path: "../.env" });

const sgMail = require('@sendgrid/mail');
const collabSchema = require('../models/collabSchema');
sgMail.setApiKey(process.env.TWILIO_SENDGRID_API_KEY)

router.get('/', async (req, res) => {
    if (!req.user) {
        res.render('ide', { title: "VITdost - Collaborative IDE" });
    }
    else {
        const rooms = await Code.find({ createdBy: req.user._id });
        const collabrooms = await Collab.find({userid : req.user._id});
        if (rooms.length > 0 && collabrooms.length > 0) {
            res.render('ide', { title: "VITdost - Collaborative IDE", rooms: rooms, collabroom : collabrooms});
        }
        else if (rooms.length > 0) {
            res.render('ide', { title: "VITdost - Collaborative IDE", rooms: rooms});
        }
        else if (collabrooms.length > 0) {
            res.render('ide', { title: "VITdost - Collaborative IDE", collabroom : collabrooms});
        }
        else {
            res.render('ide', { title: "VITdost - Collaborative IDE" });
        }
    }
})

router.post('/createTask', async (req, res) => {
    if(!req.user) {
        res.redirect('/users/login');
    }
    else {
        var newTask = new Code({
            createdBy: req.user._id,
            name: req.body.roomname
        });
        newTask.save(function (err, data) {
            if (err) {
                console.log(err);
                res.render('error');
            } else {
                res.redirect('/ide/code/' + data._id);
            }
        })
    }
});

router.route('/code/:id')
    .get(async (req, res) => {
        if (!req.user) {
            res.redirect('/');
        }
        else {
            if (req.params.id) {
                const data = await Code.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
                if (data) {
                    res.render('editor', {
                        content: data.content,
                        title: 'VITdost',
                        input: data.lastInput,
                        output: data.lastOutput,
                        timeused: data.lastTimeUsed,
                        memused: data.lastMemUsed,
                        roomId: data.id
                    });
                } else {
                    res.redirect('/error');
                }

            } else {
                res.redirect('/error');
            }
        }
    })

    .post(async (req, ress) => {
        if (!req.user) {
            ress.redirect('/');
        }
        else {
            var code = req.body.codes;
            var inp = req.body.input;
            var lang = req.body.langs;

            var runCode = {};
            runCode.time_limit = 5;
            runCode.memory_limit = 323244;
            runCode.source = code;
            runCode.input = inp;
            runCode.lang = lang;

            var resp;
            var flag = 0;
            const res = await axios.post('https://api.hackerearth.com/v4/partner/code-evaluation/submissions/', runCode, {
                headers: {
                    'content-type': 'application/json',
                    'client-secret': process.env.HACKEREARTH_API_KEY
                }
            })
                .then(async (response) => {
                    var urlOfCode = response.data.status_update_url;
                    var k = response.data.request_status.code;
                    while (k != 'REQUEST_COMPLETED' && k != 'REQUEST_FAILED') {
                        console.log(k);
                        await axios.get(urlOfCode, {
                            headers: {
                                'client-secret': process.env.HACKEREARTH_API_KEY
                            }
                        })
                            .then(response => {
                                k = response.data.request_status.code;
                                resp = response;
                            })
                            .catch(err => console.log(err));

                        if (resp.data.result.run_status.time_used > 5) {
                            flag = 1;
                            break;
                        }
                        if (resp.data.result.run_status.status == 'TLE' || resp.data.result.run_status.status == 'OLE' || resp.data.result.run_status.status == 'MLE' || resp.data.result.run_status.status == 'RE') {
                            flag = 1;
                            break;
                        }
                        if (resp.data.request_status.code == 'CODE_COMPILED') {
                            if (resp.data.result.compile_status != 'OK') {
                                flag = 1;
                                break;
                            }
                        }
                    }
                    if (k == 'REQUEST_FAILED') {
                        ress.redirect('/error');
                    }
                    else {
                        if(flag == 0) {
                            const data = await Code.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
                            data.lastInput = inp;
                            await axios.get(resp.data.result.run_status.output)
                                .then(respo => {
                                    data.lastOutput = respo.data;
                                })
                                .catch(err => console.log(err));
                            data.lastTimeUsed = resp.data.result.run_status.time_used;
                            data.lastMemUsed = resp.data.result.run_status.memory_used;
                            await data.save();
                            ress.redirect('/ide/code/' + req.params.id);
                        }
                        else {
                            const data = await Code.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
                            data.lastInput = inp;
                            if(resp.data.result.compile_status != 'OK') {
                                data.lastOutput = resp.data.result.compile_status;
                            }
                            else {
                                data.lastOutput = resp.data.result.run_status.status_detail;
                            }
                            data.lastTimeUsed = resp.data.result.run_status.time_used;
                            data.lastMemUsed = resp.data.result.run_status.memory_used;
                            await data.save();
                            ress.redirect('/ide/code/' + req.params.id);
                        }
                    }

                })
                .catch(err =>
                    console.log(resp.data)
                );
        }
    });


router.route('/mail')
    .post(async (req, res) => {
        const msg = {
            to: req.body.friends.split(", "),
            from: 'help.vitdost@gmail.com',
            subject: 'VITdost IDE Collaboration',
            html: `<h1>Hello, User!</h1>
          <h4>You have been invited to VITdost IDE for collaborative coding with your friends. Kindly join using the link given below. </h4>
          <h2>https://vitdost.herokuapp.com/ide/code/` + req.body.roomId1 + `</h2>
          <h4>Thank You</h4>
          <h4>VITdost Team</h4>
          `
        }
        sgMail
            .send(msg)
            .then(() => {
                console.log('Email sent');
                res.redirect('/ide/code/' + req.body.roomId1);
            })
            .catch((error) => {
                res.redirect('/error');
            })
        
        var temp = req.body.friends.split(",");
        for(let user of temp) {
            var u = await User.findOne({email : user.trim()});
            var w = await Code.findOne({_id : mongoose.Types.ObjectId(req.body.roomId1)});
            var check = await Collab.findOne({workspaceid: mongoose.Types.ObjectId(req.body.roomId1), userid: u._id});
            if(check)
                continue;
            var newCollab = new Collab({
                workspaceid : mongoose.Types.ObjectId(req.body.roomId1),
                workspace : w.name,
                userid : u._id
            });
            await newCollab.save();
        }
    });
module.exports = router;
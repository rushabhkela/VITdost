var express = require('express');
var router = express.Router();


router.get('/', async (req, res) => {
    const ques = await AptiQuestions.find({}).skip(0).limit(10);
    for(let q of ques) {
        q._id = q._id.toString();
    }
    res.render('aptitude', { title : 'VITdost - Aptitude', ques: ques});
});

router.get('/:num', async (req, res) => {
    const ques = await AptiQuestions.find({}).skip(10*(req.params.num - 1)).limit(10);
    for(let q of ques) {
        q._id = q._id.toString();
    }
    if(ques.length > 0)
        res.render('aptitude', { title : 'VITdost - Aptitude', ques: ques});
    else
        res.render('aptitude', { title : 'VITdost - Aptitude', ques: ques, nomoreques: 1});
});

module.exports = router;

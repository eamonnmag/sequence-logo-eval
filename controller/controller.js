/**
 * Created by eamonnmaguire on 06/03/2014.
 */


var Survey = require('../model/survey');

exports.post = function(req, res) {
    console.log(res)
    var survey = new Survey({sex: req.body.sex, area: req.body.area,
    level:req.body.level,
        q1:req.body.q1, q2:req.body.q2, q3:req.body.q3, q4:req.body.q4,
        q5:req.body.q5, q6:req.body.q6, q7:req.body.q7, q8:req.body.q8,
        q9:req.body.q9, q9reason:req.body["q9-reason"],
        q10:req.body.q10, q10reason:req.body["q10-reason"],
        q11:req.body.q11,
        q12:req.body.q12,
        q13:req.body.q13,
        q14:req.body.q14


    });
    survey.save(function (err) {
        if (err) throw err;
        console.log('Survey saved.');
        res.send('Thanks for participating in the evaluation.');
    });
}

exports.list = function(req, res) {
    Survey.find(function(err, surveys) {
        res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
        res.send('{"surveys":' +  JSON.stringify(surveys) + '}');
    });
}
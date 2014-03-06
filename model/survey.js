/**
 * Created by eamonnmaguire on 06/03/2014.
 */


var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var surveySchema = new Schema({
    sex:String,
    area:String,
    level:String,
    q1: String,
    q2: String,
    q3: String,
    q4: String,
    q5: String,
    q6: String,
    q7: String,
    q8: String,
    q9: String,
    q9reason: String,
    q10: String,
    q10reason: String,
    q11: String,
    q12: String,
    q13: String,
    q14: String

});

module.exports = mongoose.model('survey', surveySchema);
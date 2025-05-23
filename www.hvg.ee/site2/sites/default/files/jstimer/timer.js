
// bootstrap
Drupal.behaviors.jstimer = {
  attach: function(context) {
    Drupal.jstimer.countdown_auto_attach(
      new Array(
        new Drupal.jstimer.jst_clock(),
      new Drupal.jstimer.jst_timer()
      )
    );
  }
}

// Namespace for most of the javascript functions.
Drupal.jstimer = {};

// Array that holds all elements that need to be updated.
Drupal.jstimer.timer_stack = new Array();

// Attach all active widgets to their respective dom objects.
Drupal.jstimer.countdown_auto_attach = function (jstimer_active_widgets) {

  // Call .attach() on the active widget items.
  for (var i=0; i<jstimer_active_widgets.length; i++) {
    jstimer_active_widgets[i].attach();
  }

  // If you have any widget items, start the timing loop.
  if ( Drupal.jstimer.timer_stack.length > 0 ) {
    Drupal.jstimer.timer_loop();
  }

}

// The timing loop.
Drupal.jstimer.timer_loop = function() {
  // run backwards so we can remove items and not messup the loop data.
  for (var i = Drupal.jstimer.timer_stack.length - 1; i >= 0; i--) {
    if ( Drupal.jstimer.timer_stack[i].update() == false ) {
      Drupal.jstimer.timer_stack.splice(i, 1);
    }
  }

  // Stop the timer if there are not more timer items.
  if ( Drupal.jstimer.timer_stack.length > 0 ) {
    setTimeout('Drupal.jstimer.timer_loop()',999);
  }
}


/*
 * Clock widget
 */
Drupal.jstimer.jst_clock = function() {
  this.selector = ".jst_clock";
  this.attach = function() {
    jQuery(this.selector).each(
      function(i) {
        var t = new Drupal.jstimer.jst_clock_item(jQuery(this));
        Drupal.jstimer.timer_stack[Drupal.jstimer.timer_stack.length] = t;
      }
    );
  }
}

Drupal.jstimer.jst_clock_item = function(ele) {

  // class methods first so you can use them in the constructor.
  this.loadProps = function() {
    for (var prop in this.props) {
      var prop_selector = "span[class="+prop+"]";
      if ( this.element.children(prop_selector).length > 0 ) {
        this.props[prop] = this.element.children(prop_selector).html();
      }
    }

    // If browser doesn't support the html canvas element, default to 12-hour clock.
    if ( !supports_canvas() &&  this.props['clock_type'] == 2 ) {
      this.props['clock_type'] = 0;
    }
  }

  this.update = function() {
    var timenow = new Date();
    var hr = timenow.getHours();
    var min = timenow.getMinutes();
    var sec = timenow.getSeconds();
    if ( this.props['clock_type'] == 0 ) {
      var am_pm = ""
      if ( hr <= 12 ) {
        am_pm = "am";
      } else {
        am_pm = "pm";
        hr = hr - 12;
      }
      this.element.html(hr + ":" + LZ(min) + ":" + LZ(sec) + am_pm);
    } else if ( this.props['clock_type'] == 1 ) {
      this.element.html(hr + ":" + LZ(min) + ":" + LZ(sec));
    } else if ( this.props['clock_type'] == 2 ) {
      if ( this.canvas ) {
        var ctx = this.canvas[0].getContext("2d");

        // save original context
        ctx.save(); // 1

        // clear and set defaults.
        ctx.clearRect(0,0,this.props['size'],this.props['size']);
        ctx.translate((this.props['size']/2),(this.props['size']/2));
        ctx.scale(0.4,0.4);
        ctx.rotate(-Math.PI/2);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.save(); // 2

        // render hour tick marks
        for (var i=0;i<12;i++){
         ctx.beginPath();
         ctx.rotate(Math.PI/6);
         ctx.moveTo(this.props['size']-20,0);
         ctx.lineTo(this.props['size'],0);
         ctx.stroke();
        }
        ctx.restore();  // 1

        ctx.fillStyle = "black";

        // render hour hand
        ctx.save(); // 3
        var hr_hand_size = 0.4 * this.props['size'];
        ctx.rotate( hr*(Math.PI/6) + (Math.PI/360)*min + (Math.PI/21600)*sec )
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(-20,0);
        ctx.lineTo(hr_hand_size, 0);
        ctx.stroke();
        ctx.restore();   // 2

        // render minute hand
        var min_hand_size = 0.85 * this.props['size'];
        ctx.save(); // 4
        ctx.rotate( (Math.PI/30)*min + (Math.PI/1800)*sec )
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-28,0);
        ctx.lineTo(min_hand_size, 0);
        ctx.stroke();
        ctx.restore();  // 3

        // render second hand
        ctx.save(); // 5
        var sec_hand_size = 0.85 * this.props['size'];
        ctx.rotate(sec * Math.PI/30);
        ctx.strokeStyle = "#D40000";
        ctx.fillStyle = "#D40000";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-30,0);
        ctx.lineTo(sec_hand_size, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0,0,10,0,Math.PI*2,true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sec_hand_size, 0, 10, 0, Math.PI*2, true);
        ctx.stroke();
        ctx.fillStyle = "#555";
        ctx.arc(0,0,3,0,Math.PI*2,true);
        ctx.fill();
        ctx.restore();  // 4

        // render clock face circle
        ctx.save(); // 6
        ctx.beginPath();
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#325FA2';
        ctx.arc(0,0,this.props['size'],0,Math.PI*2,true);
        ctx.stroke();
        ctx.restore(); // 5

        // Days box
        //ctx.save(); // 7
        //ctx.rotate(90 * Math.PI / 180);
        //ctx.fillStyle    = '#FFFFFF';
        //ctx.fillRect(0, this.props['size']/3, 100, 60);
        //ctx.strokeStyle = '#325FA2';
        //ctx.strokeRect(0, this.props['size']/3, 100, 60);
        //ctx.restore(); // 6

        // days text
        //ctx.rotate(90 * Math.PI / 180);
        //ctx.fillStyle    = '#0000FF';
        //ctx.font         = 'courier-new 30px';
        //ctx.fillText  ('Days', 110, (this.props['size']/3)+50);
        ctx.restore();  // 7
      }
    }

    // SVG Clock
    else if ( this.props['clock_type'] == 3 ) {
      if (this.clock && !this.clockSvgWin) {
        this.clockSvgWin = getSvgWindow(clock);
      }
      if (this.clock && this.clockSvgWin) {
        try{
          this.clockSvgWin.animate();
        } 
        catch(err) {
          //Some browsers will have a timing error and require one more iteration.
        }
      }
    }
    return true;
  }

  // begin constructor
  this.element = ele; // jquery ele
  this.props = {clock_type:'1', size:200};
  this.loadProps();

  // add canvas if analog.
  if ( this.props['clock_type'] == 2 ) {
    this.canvas = jQuery('<canvas class="ct_clock_canvas"><p>Your browser doesn\'t support canvas.</p></canvas>');
    this.canvas.attr("width",this.props['size']);
    this.canvas.attr("height",this.props['size']);
    this.element.append(this.canvas);
  }
  else if ( this.props['clock_type'] == 3 ) {
    var clock = jQuery('<object data="/sites/all/modules/jstimer/widgets/clocks/sleek1.svg" type="image/svg+xml"></object>');
    clock.attr('width',this.props['size']);
    clock.attr('height',this.props['size']);
    this.element.html('');
    this.element.append(clock);
    this.clock = clock;
  }


}

function supports_canvas() {
  return !!document.createElement('canvas').getContext;
}

function getSvgWindow(clock) {
  var svgDoc;
  var svgWin;
  var jsClock = clock.get(0);
  if (jsClock.contentDocument) {
    svgDoc = jsClock.contentDocument; //get the inner DOM of alpha.svg
  }
  else {
    try {
      svgDoc = jsClock.getSVGDocument();
    }
    catch(exception) {
      // Ignore errors, this exception will fire if the DOM is not loaded yet.
    }
  }

  if (svgDoc && svgDoc.defaultView) {
    svgWin = svgDoc.defaultView;
  }
  else if (jsClock.window) {
    svgWin = jsClock.window;
  }
  else try {
    svgWin = jsClock.getWindow();
  }
  catch(exception) {
    // Ignore errors, this exception will fire if the DOM is not loaded yet.
  }
  return svgWin;
}

// End of clock widget.

/*
 * Timer widget
 */
Drupal.jstimer.formats = ['<h1 style="font-size:250%; text-align:center;">%hours%:%mins%:%secs%</h1>','Only %days% days, %hours% hours, %mins% minutes and %secs% seconds left','%days% shopping days left','<em>(%dow% %moy%%day%)</em><br/>%days% days + %hours%:%mins%:%secs%'];

Drupal.jstimer.jst_timer = function() {
  this.selector = ".jst_timer";
  this.attach = function() {
    jQuery(this.selector).each(
      function(i) {  // i is the position in the each fieldset
        var t = new Drupal.jstimer.jst_timer_item(jQuery(this));
        if ( t.parse_microformat_success == 1 ) {
          Drupal.jstimer.timer_stack[Drupal.jstimer.timer_stack.length] = t;
        }
      }
    );
  }
}

Drupal.jstimer.jst_timer_item = function(ele) {

  // class methods first so you can use them in the constructor.
  this.loadProps = function() {
    for (var prop in this.props) {
      var prop_selector = "span[class="+prop+"]";
      if ( this.element.children(prop_selector).length > 0 ) {
        this.props[prop] = this.element.children(prop_selector).html();
      }
    }

    if ( String(this.props['format_txt']).match("'") ) {
      this.props['format_txt'] = "<span style=\"color:red;\">Format may not contain single quotes(').</span>";
    }

    // format_txt overrides format_num.
    if ( this.props['format_txt'] != "" ) {
      this.outformat = this.props['format_txt'];
    } else {
      if (Drupal.jstimer.formats[this.props['format_num']] != undefined) {
        this.outformat = Drupal.jstimer.formats[this.props['format_num']];
      }
      else {
        this.outformat = Drupal.jstimer.formats[0];
      }
    }

  }

  this.parse_microformat = function() {

    // ajax calls re-run autoattach, make sure the selector is gone.
    if ( this.element.hasClass("jst_timer") ) {
      this.element.removeClass("jst_timer")
    }

    // If there is an interval, always use it.
    if ( this.props['interval'] != "" ) {
      var interval_val = parseInt(this.props['interval']);
      var date = new Date();
      this.to_date = date;
      this.to_date.setTime(date.getTime() + (interval_val*1000));
    } else {
      if ( this.props['datetime'] == "" ) {
        this.parse_microformat_success = 0;
        throw new Object({name:"NoDate",message:"Javascript Timer: Span with class=datetime not found within the timer span."});
      }
      var date = new Date();
      try {
        date.jstimer_set_iso8601_date(this.props['datetime']);
      }
      catch(e) {
        throw(e);
      }
      this.to_date = date;
      if ( this.props['current_server_time'] != "" ) {
        // this is a feedback time from the server to correct for small server-client time differences.
        // not used for normal block and node timers.
        var date_server = new Date();
        date_server.jstimer_set_iso8601_date(this.props['current_server_time']);
        var date_client = new Date();
        var adj = date_client.getTime() - date_server.getTime();
        // adjust target date to clients domain
        this.to_date.setTime(this.to_date.getTime() + adj);
      }
    }

    this.parse_microformat_success = 1;
  }



  this.update = function() {
    var now_date = new Date();
    var duration = this.get_duration(now_date, this.to_date);

    // If counting down and timer is completed, set timer complete statement, check for redirect, and end.
    if ( this.props['dir'] == "down" && duration.sign > 0 ) {

      // Set the timer complete statement.
      if (this.props['timer_complete_message'] != '') {
        this.element.html(this.props['timer_complete_message'] + '');
        // Clear message as we don't need to reset it again.
        this.props['timer_complete_message'] = '';
      }

      // If there is a complete message, alert it.
      if (this.props['tc_msg'] != '') {
        alert(this.props['tc_msg']);
        // Clear alert msg as we don't need to alert it again.
        this.props['tc_msg'] = '';
      }

      // If there is a redirect url and delay has been met, redirect.
      if (this.props['tc_redir'] != '' && (duration.diff >= this.props['tc_redir_delay'])) {
      	if (this.props['tc_redir'].match('<reload>')) {
      		window.location.reload(true);
      	}
      	else {
        	window.location = this.props['tc_redir'];
        }
        return false;
      }
      // Timer is completed
      return true;
    }


    var outhtml = new String(this.outformat);

    // try to handle counts with units first, use a try block because Drupal.formatPlural breaks javascript sometimes
    try {
      outhtml = outhtml.replace(/%years% years/,  Drupal.formatPlural(duration.years, "1 year", "@count years"));
      outhtml = outhtml.replace(/%ydays% days/,   Drupal.formatPlural(duration.days, "1 day", "@count days"));
      outhtml = outhtml.replace(/%days% days/,    Drupal.formatPlural(duration.tot_days, "1 day", "@count days"));
      outhtml = outhtml.replace(/%hours% hours/,  Drupal.formatPlural(duration.hours, "1 hour", "@count hours"));
      outhtml = outhtml.replace(/%mins% minutes/, Drupal.formatPlural(duration.minutes, "1 minute", "@count minutes"));
      outhtml = outhtml.replace(/%secs% seconds/, Drupal.formatPlural(duration.seconds, "1 second", "@count seconds"));
      outhtml = outhtml.replace(/%months% months/, Drupal.formatPlural(duration.months, "1 month", "@count months"));
      outhtml = outhtml.replace(/%tot_months% months/, Drupal.formatPlural(duration.tot_months, "1 month", "@count months"));
      outhtml = outhtml.replace(/%tot_hours% hours/, Drupal.formatPlural(duration.tot_months, "1 hour", "@count hours"));
      outhtml = outhtml.replace(/%tot_mins% minutes/, Drupal.formatPlural(duration.tot_mins, "1 minute", "@count minutes"));
      outhtml = outhtml.replace(/%tot_hours% seconds/, Drupal.formatPlural(duration.tot_secs, "1 second", "@count seconds"));
    }
    catch(e){
      // suppress errors
    }

    //handle counts without units
    outhtml = outhtml.replace(/%years%/, duration.years);
    outhtml = outhtml.replace(/%ydays%/, duration.days);
    outhtml = outhtml.replace(/%days%/, duration.tot_days);
    outhtml = outhtml.replace(/%hours%/, LZ(duration.hours));
    outhtml = outhtml.replace(/%mins%/, LZ(duration.minutes));
    outhtml = outhtml.replace(/%secs%/, LZ(duration.seconds));
    outhtml = outhtml.replace(/%hours_nopad%/, duration.hours);
    outhtml = outhtml.replace(/%mins_nopad%/, duration.minutes);
    outhtml = outhtml.replace(/%secs_nopad%/, duration.seconds);
    outhtml = outhtml.replace(/%sign%/, duration.sign < 0 ? '-' : '+');
    outhtml = outhtml.replace(/%months%/, duration.months);
    outhtml = outhtml.replace(/%tot_months%/, duration.tot_months);
    outhtml = outhtml.replace(/%tot_hours%/, duration.tot_hours);
    outhtml = outhtml.replace(/%tot_mins%/, duration.tot_mins);
    outhtml = outhtml.replace(/%tot_secs%/, duration.tot_secs);

    // Proximity styling
    if (this.props['dir'] == "down"
        && '1' =="1"
        && (duration.diff <= (this.props['threshold'] * 60))
        && this.props['highlight'][0]) {
      this.element.html('<span ' + this.props['highlight'][0] + '=' + this.props['highlight'][1] + '>' +  outhtml + '</span>');
    }
    else if (this.props['dir'] == "up"
        && '0' =="1"
        && (duration.sign > 0 || (duration.diff <= (this.props['threshold'] * 60)))
        && this.props['highlight'][0]) {
      this.element.html('<span ' + this.props['highlight'][0] + '=' + this.props['highlight'][1] + '>' +  outhtml + '</span>');
    }
    // No proximity styling
    else {
      this.element.html(outhtml);
    }

    return true;
  }

  this.get_duration = function(now, target) {
    var dur = {diff:0, sign:0, years:0, months:0, days:0, hours:0, minutes:0, seconds:0, tot_months:0, tot_days:0, tot_hours:0, tot_mins:0, tot_secs:0};
    dur.diff = Math.floor((now.getTime() - target.getTime()) / 1000);
    if ( dur.diff < 0 ) {
      dur.sign = -1;
      dur.diff = Math.abs(dur.diff);
    } else {
      dur.sign = 1;
    }

    dur.years = Math.floor(dur.diff / 60 / 60 / 24 / 365.25);

    // Total hours
    dur.tot_hours = Math.floor(dur.diff / 60.0 / 60.0);
    // Total minutes
    dur.tot_mins = Math.floor(dur.diff / 60.0);
    // Total seconds
    dur.tot_secs = Math.floor(dur.diff);

    // Use calendar months, using months based on seconds is problematic.
    if(now.getFullYear() == target.getFullYear()) {
       dur.tot_months = Math.abs(target.getMonth() - now.getMonth());
       dur.months = dur.tot_months;
    } else {
      dur.tot_months = 11 - now.getMonth();
      dur.tot_months += target.getMonth() + 1;
      dur.tot_months += (target.getFullYear() - now.getFullYear() - 1) * 12;
      dur.months = dur.tot_months - (dur.years * 12);
    }

    dur.tot_days = Math.floor(dur.diff / 60 / 60 / 24);
    dur.days = Math.ceil(dur.tot_days - (dur.years * 365.25));
    dur.hours = Math.floor(dur.diff / 60 / 60) - (dur.tot_days * 24);
    dur.minutes = Math.floor(dur.diff / 60) - (dur.hours * 60) - (dur.tot_days * 24 * 60);
    dur.seconds = dur.diff - (dur.minutes * 60) - (dur.hours * 60 * 60) - (dur.tot_days * 24 * 60 * 60);
    return dur;
  }



  // begin constructor
  this.element = ele;

  // Defaults for each timer.
  this.props = {
    datetime: '',
    dir: 'down',
    format_num: 0,
    format_txt: '',
    timer_complete_message: new String('<em>Timer Completed</em>'),
    highlight: new String('style="color:red"').split(/=/),
    threshold: new Number('5'),
    tc_redir: new String(''),
    tc_redir_delay: new Number('3'),
    tc_msg: new String('TIME IS OVER!'),
    interval: '',
    current_server_time: ''
  };
  this.loadProps();


  /* bootstrap, parse microformat, load object */
  try {
    this.parse_microformat();
  }
  catch(e) {
    alert(e.message);
    alert(jQuery(ele).html());
    this.parse_microformat_success = 0;
    return;
  }

  // replace the static stuff in the format string
  // this only needs to be done once, so here is a good spot.
  this.outformat = this.outformat.replace(/%day%/,   this.to_date.getDate());
  this.outformat = this.outformat.replace(/%month%/, this.to_date.getMonth() + 1);
  this.outformat = this.outformat.replace(/%year%/,  this.to_date.getFullYear());
  this.outformat = this.outformat.replace(/%moy%/,   this.to_date.jstimer_get_moy());
  this.outformat = this.outformat.replace(/%dow%/,   this.to_date.jstimer_get_dow());
}
// End of timer widget.





// Util functions
function LZ(x) {
  return (x >= 10 || x < 0 ? "" : "0") + x;
}

// iso8601 date parsing routines.  Extends the built-in javascript date object.
Date.prototype.jstimer_set_iso8601_date = function (string) {
  var iso8601_re = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:[T ](\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
  var date_bits = iso8601_re.exec(string);
  var date_obj = null;
  if ( date_bits ) {
    date_bits.shift();
    date_bits[1] && date_bits[1]--; // normalize month
    date_bits[6] && (date_bits[6] *= 1000); // convert mils
    date_obj = new Date(date_bits[0]||1970, date_bits[1]||0, date_bits[2]||0, date_bits[3]||0, date_bits[4]||0, date_bits[5]||0, date_bits[6]||0);

    if (date_bits[0] < 1000) {
      date_obj.setFullYear(date_bits[0]);
    }

    //timezone handling
    var zone_offset = 0;  // in minutes
    var zone_plus_minus = date_bits[7] && date_bits[7].charAt(0);
    // get offset from isostring time to Z time
    if ( zone_plus_minus != 'Z' ) {
      zone_offset = ((date_bits[8] || 0) * 60) + (Number(date_bits[9]) || 0);
      if ( zone_plus_minus != '-' ) {
        zone_offset *= -1;
      }
    }
    // convert offset to localtime offset, will include daylight savings
    if ( zone_plus_minus ) {
      zone_offset -= date_obj.getTimezoneOffset();
    }
    if ( zone_offset ) {
      date_obj.setTime(date_obj.getTime() + zone_offset * 60000);
    }
  }

  // set this object to current localtime representation
  try {
    this.setTime(date_obj.getTime());
  }
  catch(e) {
    throw new Object({name:"DatePatternFail",message:"jstimer: Date does not have proper format (ISO8601, see readme.txt)."});
  }
}
Date.prototype.jstimer_get_moy = function () {
  var myMonths=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
  return myMonths[this.getMonth()];
}
Date.prototype.jstimer_get_dow = function () {
  var myDays=["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return myDays[this.getDay()];
}

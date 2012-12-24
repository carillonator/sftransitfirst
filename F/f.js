$(function() {

var btn_in = $('#btn_in');
var btn_out = $('#btn_out');
var dir_btns = $('.dir_btn');
var preds = $('#preds');
var select_stop = $('#select_stop');
var intro = $('#intro');
var refresh = $('#btn_refresh');
var flip_refresh = $('#flip_refresh');
var flip_hidebus = $('#flip_hidebus'); 
var lats = {};
var longs = {};
var refresh_timer;
var refresh_active = ( $.cookie('refresh') == 0 ) ? 0 : 1; 
var hidebus_active = ( $.cookie('hidebus') == 0 ) ? 0 : 1; 

// check if stop number passed in URL
var pathname = window.location.pathname;
var re = /\/(\d+)$/;
var bmArr = re.exec(pathname) ;
var bookmark = ( bmArr ) ? bmArr[1] : null;
bookmark = parseInt(bookmark);

// disable auto-refresh if cookie says to
if ( !refresh_active ) {
	flip_refresh.val('false').slider('refresh');
}

// hide buses if cookie says to
if ( !hidebus_active ) {
	flip_hidebus.val('false').slider('refresh');
}

// stop codes and coordinates
var ib_stops = [3311,5687,5691,5662,5668,5675,5673,5692,5652,5651,5650,5647,5645,5643,5640,5685,7264,5682,4727,4513,4532,4503,4517,4515,7281,4501,4530,5174,5175,35184];
var ob_stops = [5184,3092,3095,4502,4529,4516,4518,4504,4534,7283,4726,5669,5657,5639,5678,5694,5655,5695,5656,5676,5679,5696,5672,5681,5659,5661,5690,5686,33311];
lats['5184'] = 37.8072499;lats['3092'] = 37.80741;lats['3095'] = 37.8078399;lats['4502'] = 37.8066299;lats['4529'] = 37.8050199;lats['4516'] = 37.80296;lats['4518'] = 37.80061;lats['4504'] = 37.7988999;lats['4534'] = 37.7963599;lats['7283'] = 37.7948299;lats['4726'] = 37.7941099;lats['5669'] = 37.79347;lats['5657'] = 37.7911099;lats['5639'] = 37.7893499;lats['5678'] = 37.78773;lats['5694'] = 37.7858599;lats['5655'] = 37.7840799;lats['5695'] = 37.78232;lats['5656'] = 37.7805699;lats['5676'] = 37.7791099;lats['5679'] = 37.77759;lats['5696'] = 37.7752399;lats['5672'] = 37.77327;lats['5681'] = 37.77095;lats['5659'] = 37.76979;lats['5661'] = 37.7678299;lats['5690'] = 37.7661899;lats['5686'] = 37.7644899;lats['33311'] = 37.7625199;lats['5662'] = 37.7672599;lats['5668'] = 37.76888;lats['5675'] = 37.7705699;lats['5673'] = 37.7728799;lats['5692'] = 37.7750599;lats['5652'] = 37.7774099;lats['5651'] = 37.7786099;lats['5650'] = 37.7803599;lats['5647'] = 37.7820999;lats['5645'] = 37.7838899;lats['5643'] = 37.7856499;lats['5640'] = 37.7875299;lats['5685'] = 37.7886099;lats['7264'] = 37.7909399;lats['5682'] = 37.7929799;lats['4727'] = 37.7938999;lats['4513'] = 37.79511;lats['4532'] = 37.7970899;lats['4503'] = 37.7995499;lats['4517'] = 37.8012599;lats['4515'] = 37.8032599;lats['7281'] = 37.80515;lats['4501'] = 37.80695;lats['4530'] = 37.8083499;lats['5174'] = 37.8085899;lats['5175'] = 37.8083199;lats['35184'] = 37.8072499;lats['3311'] = 37.7625199;lats['5687'] = 37.7639599;lats['5691'] = 37.7656899;
longs['5184'] = -122.41737;longs['3092'] = -122.4141199;longs['3095'] = -122.41081;longs['4502'] = -122.4060299;longs['4529'] = -122.4033099;longs['4516'] = -122.40103;longs['4518'] = -122.39892;longs['4504'] = -122.3974299;longs['4534'] = -122.3951799;longs['7283'] = -122.3937699;longs['4726'] = -122.39387;longs['5669'] = -122.3961799;longs['5657'] = -122.39907;longs['5639'] = -122.40131;longs['5678'] = -122.4033699;longs['5694'] = -122.40574;longs['5655'] = -122.40799;longs['5695'] = -122.4102299;longs['5656'] = -122.41244;longs['5676'] = -122.41438;longs['5679'] = -122.4162099;longs['5696'] = -122.41918;longs['5672'] = -122.4217699;longs['5681'] = -122.4246699;longs['5659'] = -122.4261499;longs['5661'] = -122.42863;longs['5690'] = -122.43071;longs['5686'] = -122.43281;longs['33311'] = -122.43487;longs['5662'] = -122.42915;longs['5668'] = -122.4270999;longs['5675'] = -122.42497;longs['5673'] = -122.42199;longs['5692'] = -122.41932;longs['5652'] = -122.41634;longs['5651'] = -122.41483;longs['5650'] = -122.41261;longs['5647'] = -122.4104;longs['5645'] = -122.40814;longs['5643'] = -122.40589;longs['5640'] = -122.40352;longs['5685'] = -122.40216;longs['7264'] = -122.39919;longs['5682'] = -122.39663;longs['4727'] = -122.39345;longs['4513'] = -122.39386;longs['4532'] = -122.3956699;longs['4503'] = -122.3978699;longs['4517'] = -122.3993699;longs['4515'] = -122.4011099;longs['7281'] = -122.40323;longs['4501'] = -122.40628;longs['4530'] = -122.41029;longs['5174'] = -122.41336;longs['5175'] = -122.41551;longs['35184'] = -122.41737;longs['3311'] = -122.43487;longs['5687'] = -122.43332;longs['5691'] = -122.43114;

// dropdown options for Inbound and Outbound
var ob_opts = '<option value="0">Select Stop</option><option value="gps">Find Nearest Stop</option><option value="5184">Jones &amp; Beach</option><option value="3092">Beach &amp; Mason</option><option value="3095">Beach &amp; Stockton</option><option value="4502">Embarcadero &amp; Bay</option><option value="4529">Embarcadero &amp; Sansome</option><option value="4516">Embarcadero &amp; Greenwich</option><option value="4518">Embarcadero &amp; Green</option><option value="4504">Embarcadero &amp; Broadway</option><option value="4534">Embarcadero &amp; Washington</option><option value="7283">Embarcadero &amp; Ferry Building</option><option value="4726">Ferry Plaza</option><option value="5669">Market &amp; Drumm</option><option value="5657">Market &amp; Battery</option><option value="5639">Market &amp; 2nd</option><option value="5678">Market &amp; Kearny</option><option value="5694">Market &amp; Stockton</option><option value="5655">Market &amp; 5th</option><option value="5695">Market &amp; Taylor</option><option value="5656">Market &amp; 7th</option><option value="5676">Market &amp; Hyde</option><option value="5679">Market &amp; Larkin</option><option value="5696">Market &amp; Van Ness Ave</option><option value="5672">Market &amp; Gough</option><option value="5681">Market &amp; Laguna</option><option value="5659">Market &amp; Buchanan</option><option value="5661">Market &amp; Church</option><option value="5690">Market &amp; Sanchez</option><option value="5686">Market &amp; Noe</option><option value="33311">17th &amp; Castro</option>';
var ib_opts = '<option value="0">Select Stop</option><option value="gps">Find Nearest Stop</option><option value="3311">17th &amp; Castro</option><option value="5687">Market &amp; Noe</option><option value="5691">Market &amp; Sanchez</option><option value="5662">Market &amp; Church</option><option value="5668">Market &amp; Dolores</option><option value="5675">Market &amp; Guerrero</option><option value="5673">Market &amp; Gough</option><option value="5692">Market &amp; S Van Ness</option><option value="5652">Market &amp; 9th</option><option value="5651">Market &amp; 8th</option><option value="5650">Market &amp; 7th</option><option value="5647">Market &amp; 6th</option><option value="5645">Market &amp; 5th</option><option value="5643">Market &amp; 4th</option><option value="5640">Market &amp; 3rd</option><option value="5685">Market &amp; New Montgomery</option><option value="7264">Market &amp; 1st</option><option value="5682">Market &amp; Main</option><option value="4727">Ferry Plaza</option><option value="4513">Embarcadero &amp; Ferry Term</option><option value="4532">Embarcadero &amp; Washington</option><option value="4503">Embarcadero &amp; Broadway</option><option value="4517">Embarcadero &amp; Green</option><option value="4515">Embarcadero &amp; Greenwich</option><option value="7281">Embarcadero &amp; Sansome</option><option value="4501">Embarcadero &amp; Bay</option><option value="4530">Embarcadero &amp; Stockton</option><option value="5174">Jefferson &amp; Powell</option><option value="5175">Jefferson &amp; Taylor</option><option value="35184">Jones &amp; Beach</option>';

// for compatibility with back button, clear the dropdown on page load
select_stop.val("0").selectmenu('refresh',true);

// function called by autorefresh
$.fn.refresh_preds = function() {
	select_stop.change();
	//try to get an autorefresh indicator working
	//refresh.buttonMarkup({ theme: "e" }).button('refresh');
}

// listen for direction buttons being clicked
dir_btns.click(function() {

	clearInterval(refresh_timer);

	if ( $(this).hasClass('ui-btn-active') ) { 
		// already active, don't do anything
	} else { // user selected a new direction
		var new_dir = ( $(this).attr("id") == "btn_in" ) ? ib_opts : ob_opts;
		select_stop.html(new_dir).selectmenu('refresh', true);
		preds.empty();
	}
});

// when the stop dropdown changes
select_stop.change(function() {

	clearInterval(refresh_timer);
	preds.empty();
	intro.hide();
	refresh.show();

	var stop = select_stop.val();
	if ( stop != 0 && stop != "gps" ) {
		$.ajax({
			url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=F&s=' + stop,
			dataType: 'xml', 
			success: function(xml) {

				var predictions = $(xml).find('prediction');

				// sometimes there will be multiple sets of predictions, so they need to be sorted
				predictions.sort(function(a,b) {
					return (parseInt($(a).attr('minutes')) - parseInt($(b).attr('minutes')));
				}); 
				predictions.each(function() {
					var mins = $(this).attr('minutes');
					var veh = $(this).attr('vehicle');
					if ( veh > 2000 ) { veh = "bus"; }
					if ( veh == "bus" && hidebus_active ) {
						// skip
					} else {
						var predline = '<div class="pred_line"><div class="sc_image"><a href="http://www.streetcar.org/streetcars/' + veh + '"><img src="img/' + veh + '.png" /></a></div><div class="sc_eta">' + mins + '</div><div class="sc_num">#' + veh +'</div></div>';
						preds.append(predline);
					}
				});

				// go back and invalidate links on buses
				if ( !hidebus_active ) {
					preds.find('a[href$="bus"]').attr('href','#');
				}

				// set the browser URL so it can be bookmarked
				history.pushState(null,"F Market & Wharves", "/F/" + stop );

				// set the window title to the stop
				var direction = ( ib_stops.indexOf(bookmark) >= 0 ) ? "Inbound" : "Outbound" ;
				var stop_desc = $('#select_stop').children('option[value=' + stop + ']' ).html();
				var title = "F " + direction + " - " + stop_desc;
				document.title = title;
				

				// auto-refresh
				if (refresh_active) {
					refresh_timer = setTimeout('$.fn.refresh_preds()',60000);
				}
			}
		});
	} else if ( stop == "gps" ) {

		if ( !navigator.geolocation ) { 
			alert("GPS/location data unavailable");
			select_stop.val("0").selectmenu('refresh',true).change();
		} else {	
		navigator.geolocation.getCurrentPosition( function(loc){
			var lat = loc.coords.latitude;
			var lon = loc.coords.longitude;

			var mindist = 999999;
			var minstop = 0;
			var stoplist = ( btn_in.hasClass("ui-btn-active") ) ? ib_stops : ob_stops;
			for ( var k in stoplist ) {
				var tag = stoplist[k];
				var dist = Math.sqrt( Math.pow((lat - lats[tag]),2) + Math.pow((lon - longs[tag]),2) );	
				if ( dist < mindist ) { mindist = dist; minstop = tag; }
			}
			select_stop.val(minstop).selectmenu('refresh', true).change();
		}, function() {
			alert("GPS/location data unavailable");
			select_stop.val("0").selectmenu('refresh',true).change();
		});
		}
	}

});

// refresh button listener
$('#btn_refresh').click(function() {
	clearInterval(refresh_timer);
	select_stop.change();
});

// listen for the autorefresh slider changing, set cookie appropriately
$('#flip_refresh').change(function() {
	refresh_active = ( flip_refresh.val() == "true" ) ? 1 : 0;
	$.cookie("refresh",refresh_active,{ expires: 365 });
});

// listen for the hidebus slider changing, set cookie appropriately
$('#flip_hidebus').change(function() {
	hidebus_active = ( flip_hidebus.val() == "true" ) ? 1 : 0;
	$.cookie("hidebus",hidebus_active,{ expires: 365 });
});

// if a stop was passed in on the URL and we have a record of it, go straight there
if ( bookmark && lats[bookmark] ) {

	// if outbound, highlight the button and set the correct stop list 
	if ( ob_stops.indexOf(bookmark) >= 0 ) {
		btn_out.click();
		select_stop.html(ob_opts);
	}

	select_stop.val(bookmark).selectmenu('refresh',true).change();

}

});

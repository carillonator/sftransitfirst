$(function() {

var btn_in = $('#btn_in');
var btn_out = $('#btn_out');
var preds_in = $('#preds_in');
var preds_out = $('#preds_out');
var select_stop = $('#select_stop');
var intro = $('#intro');

var ob_opts = '<option value="0">Select Stop</option><option value="5184">Jones &amp; Beach</option><option value="3092">Beach &amp; Mason</option><option value="3095">Beach &amp; Stockton</option><option value="4502">Embarcadero &amp; Bay</option><option value="4529">Embarcadero &amp; Sansome</option><option value="4516">Embarcadero &amp; Greenwich</option><option value="4518">Embarcadero &amp; Green</option><option value="4504">Embarcadero &amp; Broadway</option><option value="4534">Embarcadero &amp; Washington</option><option value="7283">Embarcadero &amp; Ferry Building</option><option value="4726">Ferry Plaza</option><option value="5669">Market &amp; Drumm</option><option value="5657">Market &amp; Battery</option><option value="5639">Market &amp; 2nd</option><option value="5678">Market &amp; Kearny</option><option value="5694">Market &amp; Stockton</option><option value="5655">Market &amp; 5th North</option><option value="5695">Market &amp; Taylor</option><option value="5656">Market &amp; 7th North</option><option value="5676">Market &amp; Hyde</option><option value="5679">Market &amp; Larkin</option><option value="5696">Market &amp; Van Ness Ave</option><option value="5672">Market &amp; Gough</option><option value="5681">Market &amp; Laguna</option><option value="5659">Market &amp; Buchanan</option><option value="5661">Market &amp; Church</option><option value="5690">Market &amp; Sanchez</option><option value="5686">Market &amp; Noe</option><option value="33311">17th &amp; Castro</option>';
var ib_opts = '<option value="0">Select Stop</option><option value="3311">17th &amp; Castro</option><option value="5687">Market &amp; Noe</option><option value="5691">Market &amp; Sanchez</option><option value="5662">Market &amp; Church</option><option value="5668">Market &amp; Dolores</option><option value="5675">Market &amp; Guerrero</option><option value="5673">Market &amp; Gough</option><option value="5692">Market &amp; South Van Ness Av</option><option value="5652">Market &amp; 9th</option><option value="5651">Market &amp; 8th</option><option value="5650">Market &amp; 7th</option><option value="5647">Market &amp; 6th</option><option value="5645">Market &amp; 5th</option><option value="5643">Market &amp; 4th</option><option value="5640">Market &amp; 3rd</option><option value="5685">Market &amp; New Montgomery</option><option value="7264">Market &amp; 1st</option><option value="5682">Market &amp; Main</option><option value="4727">Ferry Plaza</option><option value="4513">Embarcadero &amp; Ferry Term</option><option value="4532">Embarcadero &amp; Washington</option><option value="4503">Embarcadero &amp; Broadway</option><option value="4517">Embarcadero &amp; Green</option><option value="4515">Embarcadero &amp; Greenwich</option><option value="7281">Embarcadero &amp; Sansome</option><option value="4501">Embarcadero &amp; Bay</option><option value="4530">Embarcadero &amp; Stockton</option><option value="5174">Jefferson &amp; Powell</option><option value="5175">Jefferson &amp; Taylor</option><option value="35184">Jones &amp; Beach</option>';

btn_in.click(function() {
	if ( preds_out.is(":visible") ) {
		preds_out.hide();
		preds_in.show();
		select_stop.html(ib_opts).selectmenu('refresh', true);
	}
});

btn_out.click(function() {
	if ( preds_in.is(":visible") ) {
		preds_in.hide();
		preds_out.show();
		select_stop.html(ob_opts).selectmenu('refresh', true);
	}
});

select_stop.change(function() {

	preds_in.empty();
	preds_out.empty();
	intro.hide();
	
	var active_dir = preds_in;
	if ( btn_out.hasClass('ui-btn-active') ) { active_dir = preds_out; }

	var stop = select_stop.val();
	$.ajax({
		url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=F&s=' + stop,
		dataType: 'xml', 
		success: function(xml) {
			$(xml).find('prediction').each(function() {
				var mins = $(this).attr('minutes');
				var veh = $(this).attr('vehicle');
				var predline = '<div class="pred_line"><div class="sc_image"><a href="http://www.streetcar.org/streetcars/' + veh + '"><img src="img/' + veh + '.png" /></a></div><div class="sc_eta">' + mins + '</div><div class="sc_num">#' + veh +'</div></div>';
				active_dir.append(predline);
			});
		}
	});

});

/*
navigator.geolocation.getCurrentPosition( function(loc){
    var lat = loc.coords.latitude;
    var lon = loc.coords.longitude;
    alert( lat + " " + lon );   
});
*/


});

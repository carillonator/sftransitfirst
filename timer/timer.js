$(function() {

	var tt = $('#total_time');
	var tw = $('#t_well');
	var ts = $('#t_slow');
	var tl = $('#t_load');
	var tr = $('#t_red');
	var dd = $('#direction');
	var bb = $('#boarded');
	var ee = $('#exited');
	var submit_btn = $('#submit_btn');
	var start_time = 0;
	var start_epoch = 0;
	var s = 0;
	var s_well = 0;
	var s_slow = 0;
	var s_load = 0;
	var s_red = 0;
	var first_click = 1;
	var phase = 0;
	var stopped = 0;
	var timer_total;
	var mapOptions;
	var map;

	$('.phase_btn').click(function() {
		
		if ( stopped == 0 ) {
			$('.phase_btn').removeClass('ui-btn-active');
			$(this).addClass('ui-btn-active');
		}
		
		phase = $(this).attr("id");
		
		if ( first_click == 1 ) {	
			timer_total = setInterval(every_s, 1000);
			first_click = 0;
			$('#stop_btn').removeClass('ui-disabled');
			start_time = new Date();
			start_epoch = start_time.getTime();
			//alert("This page stay in the foreground for the timer to run (working on a fix)");
			
			// populate the list of MUNI lines, might as well do it now
			$.ajax({
				url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni',
				dataType: 'xml', 
				success: function(xml) {
					$(xml).find('route').each(function() {
						var tag = $(this).attr('tag');
						var title = $(this).attr('title');
						var element = '<option value="' + tag + '">' + title + '</option>'; 
						$('#line').append(element);
					});
				}
			});
			
			// also load the Google maps API and flot
			//$('body').append('<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false"></script>');
			//$('body').append('<script src="jquery.flot.min.js" type="text/javascript"></script>');	

			
		}
	});
	
	$('#stop_btn').click(function() {
		clearInterval(timer_total);
		$('.phase_btn').removeClass('ui-btn-active');
		$(this).hide();
		$('#next_btn, #reset_btn').css('visibility','visible'); //.button('refresh');
		stopped = 1;

		$('#p_well').html( format_pct(s_well) );
		$('#p_slow').html( format_pct(s_slow) );
		$('#p_load').html( format_pct(s_load) );
		$('#p_red').html( format_pct(s_red) );
	});
	
	$('#reset_btn').click(function() {
		location.reload();
	});
	
	$('#next_btn').click(function() {
		$('#page1').hide();
		$('#page2').show();
	});
	
	var route_config;
	
	// listen for the Line dropdown to change
	$('#line').change(function() {
		var line_tag = $(this).children(":selected").attr("value");
		dd.html('<option value="select">Select a Direction...</option>').selectmenu('refresh',true);
		bb.selectmenu('disable').val('select').selectmenu('refresh',true);
		ee.selectmenu('disable').val('select').selectmenu('refresh',true);
		submit_btn.addClass("ui-disabled");
		
		$.ajax({
			url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&terse&r=' + line_tag,
			dataType: 'xml', 
			success: function(xml) {
			
				// populate the Direction dropdown
				$(xml).find('direction').each(function() {
					var tag = $(this).attr('tag');
					var title = $(this).attr('title');
					var element = '<option value="' + tag + '">' + title + '</option>'; 
					dd.append(element);
				});
				
				// save the stop tags and titles
				$(xml).find('stop').each(function() {
					var tag = $(this).attr('tag');
					var title = $(this).attr('title');
					bb.data(tag,title);
				});
				
				route_config = $(xml);
				dd.selectmenu('enable');

			}
		});
		
		
	});
	
	// listen for the Direction dropdown to change
	dd.change(function() {
		var dir_tag = $(this).children(":selected").attr("value");
		bb.html('<option value="select">Boarded Stop...</option>').selectmenu('refresh',true);
		ee.html('<option value="select">Exited Stop...</option>').selectmenu('disable').selectmenu('refresh',true);
		submit_btn.addClass("ui-disabled");
		
		route_config.find('direction[tag="' + dir_tag + '"]').children("stop").each(function() {
			var stop_tag = $(this).attr("tag");
			var stop = bb.data(stop_tag);
			var element = '<option value="' + stop_tag + '">' + stop + '</option>'; 
			bb.append(element);
			ee.append(element);
		});		
		
		ee.children(':eq(1)').attr('selected','selected');
		bb.selectmenu('enable');
	
	});
	
	// listen for the Boarded dropdown to change
	bb.change(function() {
		var stop_tag = $(this).children(":selected").attr("value");
		
		ee.children("option").removeAttr("selected");
		ee.find('option[value="' + stop_tag + '"]').next().prevAll().remove();
		if ( ee.children("option:first").val() != 'select' ) {
			ee.prepend('<option value="select" selected="selected">Exited Stop...</option>');
		}
		ee.val('select');
		ee.selectmenu('enable').selectmenu('refresh',true);
			
	});

	//listen for the Exited dropdown to change
	ee.change(function() {
		submit_btn.removeClass('ui-disabled');	
	});
	
	// listen for the Submit button to be clicked
	submit_btn.click(function() {
		
		var line = $('#line').children(":selected").attr("value");
		var boarded = bb.children(":selected").attr("value");
		var exited = ee.children(":selected").attr("value");
		var direction = dd.children(":selected").attr("value");
		var btag = route_config.find('stop[tag="' + boarded + '"]');
		var blat = btag.attr("lat");
		var blon = btag.attr("lon");
		var etag = route_config.find('stop[tag="' + exited + '"]');
		var elat = etag.attr("lat");
		var elon = etag.attr("lon");
		
		$.ajax({
			type: 'POST',
			url: 'timer_data.pl',
			data: {
				line: line,
				dir: direction,
				boarded: boarded,
				exited: exited,
				well: s_well,
				slow: s_slow,
				load: s_load,
				red: s_red,
				time: start_epoch
			},
			success: function(data) {
				submit_btn.addClass('ui-disabled');
				//alert("Thank you, your data has been submitted");
				$('#page2').hide();
				$('#page3').show();
				
				var origin = new google.maps.LatLng(blat,blon);
				var dest = new google.maps.LatLng(elat,elon);
				var grequest = {
					origin: origin,
					destination: dest,
					travelMode: google.maps.TravelMode.TRANSIT,
					provideRouteAlternatives: true
				};
				var gdist = new google.maps.DirectionsService();
				gdist.route(grequest, function(result,status) {
					console.log(result);
					
					// find the distance traveled
					// this only works if it's a google-suggested routing at the time
					var no_routes = result.routes.length;
					var route_dist_value = 0;
					var route_dist = "n/a";
					for (var i = 0; i < no_routes; i++) { // iterate routes
						var no_legs = result.routes[i].legs.length;
						
						for (var j = 0; j < no_legs; j++) { // iterate legs
							var no_steps = result.routes[i].legs[j].steps.length;
							
							for (var k = 0; k < no_steps; k++) { // iterate steps
								var mode = result.routes[i].legs[j].steps[k].travel_mode;
								if ( mode == "TRANSIT" ) { // because some steps are WALKING
									var gline = result.routes[i].legs[j].steps[k].transit.line.short_name;							
									if (gline == line) { // if google's line is our line (and BART is undefined here)
										var gdist_value = result.routes[i].legs[j].steps[k].distance.value;
										
										// this is to eliminate multiple routing that partly includes this line
										// i.e. we want the longest leg option traveled by this line
										if ( gdist_value > route_dist_value ) {
											route_dist_value = gdist_value;
											route_dist = result.routes[i].legs[j].steps[k].distance.text;
										} 
									}
								}
							}
						}
					}
					console.log( line + " " + route_dist + " " + route_dist_value);
					if ( route_dist != "n/a" ) { // if we succeeded in getting an accurate distance from google
						var avg_speed = Math.round(route_dist_value / 1609.344 / s * 3600 * 10)/10;
						$('#stats').html("you traveled " + route_dist + " in " + Math.round(s/60) + " minutes<br/>average speed " + avg_speed + " mph");
					}
					
				});			
				
				var pie_data = [
					{ label: "well",  data: s_well },
					{ label: "slow",  data: s_slow },
					{ label: "load",  data: s_load },
					{ label: "red",  data: s_red }
				];
				
				$.plot($("#pie"), pie_data,
				{
				        series: {
				            pie: { 
				                show: true
				            }
				        },
				        legend: {
				        	show: false
				        }
				});
				
				/*
				mapOptions = {
				   center: new google.maps.LatLng(-34.397, 150.644),
				   zoom: 8,
				   mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);				
				*/
				
				
			},
			error: function(data) {
				alert("Error submitting data, please try again");
			}
			
		});

		/*
		$.ajax({
			url: 'http://maps.googleapis.com/maps/api/directions/json?origin=37.7954199,-122.397&destination=37.7873299,-122.44691&sensor=false&mode=transit&departure_time=1346352774',
			dataType: 'json',
			success: function(data,text,request) {
				console.log(data);
				console.log(text);
				console.log(request);
			}
		});
		*/
		
	});

	function every_s() {
		
		if ( phase == 1 ) { 
			s_well++; 
			tw.html(format_time(s_well));
		} else if ( phase == 2 ) { 
			s_slow++; 
			ts.html(format_time(s_slow));
		} else if ( phase == 3 ) { 
			s_load++; 
			tl.html(format_time(s_load));
		} else { 
			s_red++; 
			tr.html(format_time(s_red));
		};
		
		s++
		tt.html( format_time(s) );

	}
	
	function format_time(count) {
		
		mins = Math.floor(count/60);
		secs = count % 60;
		if ( secs < 10 ) { secs = "0" + secs };
		
		return ( mins + ":" + secs );
	}
	
	function format_pct(count) {
		pct = Math.round(count / s * 100) + "%";
		return pct;
	}
	
});

$(function() {

	var tt = $('#total_time');
	var tw = $('#t_well');
	var ts = $('#t_slow');
	var tl = $('#t_load');
	var tr = $('#t_red');
	var dd = $('#direction');
	var bb = $('#boarded');
	var ee = $('#exited');
	var start_time = 0;
	var s = 0;
	var s_well = 0;
	var s_slow = 0;
	var s_load = 0;
	var s_red = 0;
	var first_click = 1;
	var phase = 0;
	var stopped = 0;
	var timer_total;

	$('.phase_btn').click(function() {
		
		if ( stopped == 0 ) {
			$('.phase_btn').removeClass('selected');
			$(this).addClass('selected');
		}
		
		phase = $(this).attr("id");
		
		if ( first_click == 1 ) {	
			timer_total = setInterval(every_s, 1000);
			first_click = 0;
			start_time = new Date();
		}
	});
	
	$('#stop_btn').click(function() {
		clearInterval(timer_total);
		$('.phase_btn').removeClass('selected');
		$(this).hide();
		$('#next_btn, #reset_btn').show();
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
		
		// populate the list of MUNI lines
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
	
	});
	
	var route_config;
	
	// listen for the Line dropdown to change
	$('#line').change(function() {
		var line_tag = $(this).children(":selected").attr("value");
		dd.empty().append('<option value="select">Select a Direction...</option>');
		
		$.ajax({
			url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=' + line_tag,
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
			}
		});
		
		
	});
	
	// listen for the Direction dropdown to change
	dd.change(function() {
		var dir_tag = $(this).children(":selected").attr("value");
		bb.empty();
		ee.empty();
		
		route_config.find('direction[tag="' + dir_tag + '"]').children("stop").each(function() {
			var stop_tag = $(this).attr("tag");
			var stop = bb.data(stop_tag);
			var element = '<option value="' + stop_tag + '">' + stop + '</option>'; 
			bb.append(element);
			ee.append(element);
		});		
		
		ee.children(':eq(1)').attr('selected','selected');
	
	});
	
	// listen for the Boarded dropdown to change
	bb.change(function() {
		var stop_tag = $(this).children(":selected").attr("value");
		
		ee.children("option").removeAttr("selected");
		ee.find('option[value="' + stop_tag + '"]').next().attr("selected","selected").prevAll().remove();
			
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
	
	function get_xml(url) {
		
		
		
		
		
	}
	

	
});

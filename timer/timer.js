$(function() {

	var tt = $('#total_time');
	var tw = $('#t_well');
	var ts = $('#t_slow');
	var tl = $('#t_load');
	var tr = $('#t_red');
	var start_time = 0;
	var s = 0;
	var s_well = 0;
	var s_slow = 0;
	var s_load = 0;
	var s_red = 0;
	var first_click = 1;
	var phase = 0;
	var stopped = 0;

	$('.button').click(function() {
		
		if ( stopped == 0 ) {
			$('.button').removeClass('selected');
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
		$('.button').removeClass('selected');
		stopped = 1;
		
		well_pct = Math.round(s_well / s * 100) + "%";
		slow_pct = Math.round(s_slow / s * 100) + "%";
		load_pct = Math.round(s_load / s * 100) + "%";
		red_pct = Math.round(s_red / s * 100) + "%";
		
		$('#p_well').html(well_pct);
		$('#p_slow').html(slow_pct);
		$('#p_load').html(load_pct);
		$('#p_red').html(red_pct);
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

	
});
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
		
		$.ajax({
			url: 'http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni', 
			success: function(data) {
				data.find('route').each(function() {
					var title = $(this).attr('title');
					console.log(title);
				});
			},
			dataType: xml
			});
		});
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
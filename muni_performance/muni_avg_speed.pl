#!/usr/bin/perl
#
# muni_avg_speed.pl
# https://github.com/carillonator/sftransitfirst/tree/master/muni_performance
# Justin Ryan - carillonator@gmail.com
# December 1, 2012
#
# This script uses realtime NextBus/ProximoBus data to track MUNI performance
# It takes no arguments
# 
# 1. Checks for saved vehicle locations in memcached 
# 2. If none, e.g. if it expired as configured below,  
#    caches current vehicle locations and exits
# 3. If the cache is fresh, caclulates average speed traveled
#    for each vehicle and logs it to the db, along with last 
#    location, line, route id (inbound, outbound). Also refreshes 
#    the cache. At least 60 seconds must pass between reports
#    for a vehicle to be logged (or as configured below). Note 
#    that time between vehicle GPS reports and the time between 
#    executions of this script are different values. 
# 4. Unless there are warnings, outputs one line indicating either the
#    the cache was absent, or that it logged results to the database
#
# So in order for this to work, you need to run the script TWICE:
# less than $stale and more than $min_elapsed seconds apart.
#
use strict;
use warnings;

##### CONFIGURABLE VALUES #####
#
# number of seconds before the cache is considered stale
# based on the most RECENT report
my $stale = 300;
#
# number of seconds required to pass between vehicle reports
my $min_elapsed = 60;
#
### END configurable values ###

use DateTime;
use Date::Parse;
use HTTP::Tiny;
use JSON qw(decode_json);
use Data::Dumper;
use DBI;
use Cache::Memcached;

# initialize memcached
my $memd = new Cache::Memcached { 'servers' => [ 'localhost:11211' ] } || warn "could not connect to memcached\n";

# check if cache is fresh, if so, fetch it
my %coords1 = get_cache();

# get new position data from proximobus
my %coords2 = get_new();

# save new data to cache, invalidating the old 
save_cache( \%coords2 );

# if cache was usable, compare datasets and log to database
if ( %coords1 ) {
	log_results();
}


# nicely log with timestamp to STDOUT
sub logz {

	my $dt = DateTime->now( time_zone => 'America/Los_Angeles' );
	my $time = $dt->ymd('-') . ' ' . $dt->hms(':');

	print $time . " " . $_[0] . "\n" ; 	
}

sub log_results {

	my $dbh = DBI->connect("DBI:mysql:database=sftransitfirst;host=localhost","sftf") || warn "could not connect to database\n";
	my $speed_insert = $dbh->prepare("INSERT INTO hs_speeds (line,run,reported,lat,lon,speed) VALUES (?,?,?,?,?,?)");
	my $rows_in = 0;
	my $skipped = 0;
	
	# iterate cached data
	for my $key ( keys %coords1 ) {
	
		# if still on the same run 
		my $run1 = $coords1{$key}[3];
		my $run2 = $coords2{$key}[3];
		if ( $run1 && $run2 && $run1 eq $run2 ) { 
		
			my $elapsed = $coords2{$key}[2] - $coords1{$key}[2]; # time between checks

			# require it to be greater than the configured value
			if ( $elapsed > $min_elapsed ) {
			
				my $yd = $coords1{$key}[0] - $coords2{$key}[0]; 
				my $xd = ( $coords1{$key}[1] - $coords2{$key}[1] ) * 0.7912; # longitude adjustment cos(lat)
				my $dist =  sprintf("%.3f", sqrt( ($xd ** 2) + ($yd ** 2) ) * 69.11); # in miles
				my $mph = sprintf ("%.1f", $dist / $elapsed * 60 * 60 );
				my $line = $coords1{$key}[4];
				my $no_rows = $speed_insert->execute($line,$run1,$coords2{$key}[2],$coords2{$key}[0],$coords2{$key}[1],$mph);
				if ( !$no_rows || $no_rows eq "0E0" ) {
					warn "could not insert row into speed table\n"; 
				} else { $rows_in += $no_rows; }
			} else { # if less than 60s elapsed between reports
				$skipped++;
			}
		} 
	}
	
	logz "logged $rows_in rows into speeds table. $skipped skipped";
	$dbh->disconnect;
}

sub get_cache {
	
	my $loc_cache = $memd->get("muni_vehs");

	if ( $loc_cache ) {
		return %{ $loc_cache };
	} else {
		logz "cache expired or absent, rebuilding";
		return ();
	}
}

sub get_new {
	
	my $http = HTTP::Tiny->new() or die $!;
	my $resp = $http->get('http://proximobus.appspot.com/agencies/sf-muni/vehicles.json');
	my $epoch = str2time(${$resp}{'headers'}{'date'});
	my $json = decode_json( ${$resp}{'content'} );
	my @vehs = @{${$json}{'items'}};
	my %ret = extract_veh(@vehs,$epoch);
	
	return %ret;
}

sub extract_veh {

	my $epoch = pop;

	my %ret;
	for my $veh ( @_ ) {

		my %veh = %{$veh};

		# only get revenue runs and not trailing LRVs
		# see https://groups.google.com/forum/?hl=en&fromgroups=#!topic/nextbus-api-discuss/mJHTmi4aLBw
		# this is probably as good as it gets
		if ( $veh{'predictable'} && ( my $run = $veh{'run_id'} ) && !$veh{'leading_vehicle_id'} ) {

			my $id = $veh{'id'};
			my $line = $veh{'route_id'};
			my $lat = $veh{'latitude'};
			my $lon = $veh{'longitude'};
			my $reported = $epoch - $veh{'seconds_since_report'};

			$ret{$id} = [ $lat, $lon, $reported, $run, $line ];

		}
	}
	
	return %ret;
}

sub save_cache {
	
	my %vehs = %{ $_[0] };

	$memd->set( "muni_vehs" , \%vehs , $stale ) || warn "could not write to memcached";
}


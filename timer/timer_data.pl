#!/usr/bin/perl -w

use strict;
use DBI;

my ($line,$boarded,$exited,$dir,$time,$well,$slow,$load,$red);

# get data POSTed by the webpage
get_post_data();

sub get_post_data {
	read( STDIN, my $post_data, $ENV{ "CONTENT_LENGTH" } );
	my @post_pairs = split( /\&/, $post_data );
	my %timer_data;
	for my $pair (@post_pairs) {
		(my $key,my $value) = split( /\=/,$pair);
		$timer_data{$key} = $value;
	}

	$line = $timer_data{"line"};
	$dir = $timer_data{"dir"};
	$boarded = $timer_data{"boarded"};
	$exited = $timer_data{"exited"};
	$time = $timer_data{"time"};
	$well = $timer_data{"well"};
	$slow = $timer_data{"slow"};
	$load = $timer_data{"load"};
	$red = $timer_data{"red"};

}


my $time = strftime( '%Y-%m-%d %X', localtime($time/1000));

my @values = [$time,$line,$dir,$boarded,$exited,$well,$slow,$load,$red];

my $mysql = DBI->connect("DBI:mysql:database=bicyclel_transit;host=localhost","bicyclel_transit", "streetcar")
			|| print "could not connect to database";

my $insert = $mysql->do("INSERT INTO muni_timer (time,line,direction,boarded,exited,well,slow,loading,red) VALUES (?,?,?,?,?,?,?,?,?)",undef,@values); 

print "error logging to database" if ( $insert != 1 );

$mysql->disconnect;


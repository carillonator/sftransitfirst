#!/usr/bin/perl -w

use POSIX qw(strftime);
use strict;
use DBI;

my ($line,$boarded,$exited,$dir,$time,$well,$slow,$load,$red);

print "Content-type: text/html\n\n";

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

# format time for mysql
$time = strftime( '%Y-%m-%d %X', localtime($time/1000-3600));

my $mysql = DBI->connect("DBI:mysql:database=bicyclel_transit;host=localhost","bicyclel_transit", "streetcar")
	|| print "could not connect to database\n";

my $insert = $mysql->do("INSERT INTO muni_timer (time,line,direction,boarded,exited,well,slow,loading,red) VALUES (?,?,?,?,?,?,?,?,?)",undef,$time,$line,$dir,$boarded,$exited,$well,$slow,$load,$red); 
print "error logging to database" if ( $insert != 1 );

$mysql->disconnect;



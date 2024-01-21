tail -n "+1"|awk 'BEGIN {FS="\,";RS="\n"} 
	{
		if ($1<1364803829 && 1364803829<=$8+$1){
			if ($4 ~ /172.30.1.[0-9]+/ || $5 ~ /172.30.1.[0-9]+/ ){
				if($4 ~ /172.30.1.[0-9]+/){
					tmp=$5;
				}else{
					tmp=$4;
				}
				cmd="geoiplookup "tmp
				cmd | getline var
				close (cmd)
				print var
			}
		}
	}' |
awk 'BEGIN {FS="\:"}{print $2}' |sort -r | uniq -c | sort -r -n

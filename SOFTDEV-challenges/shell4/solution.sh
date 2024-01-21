grep -E ".* (Accepted|Failed) .* ([0-9]+.[0-9]+.[0-9]+.[0-9]+) .*" | sed -r 's-.* (Accepted|Failed) .* ([0-9]+.[0-9]+.[0-9]+.[0-9]+) .*-\2 \1-g'|
	sort | uniq -c | fmt -w 1 | tr -d " " |
	awk 'BEGIN {RS="^$";FS="\n"}{
		for (i=1;i<=(NF-6);i+=3){
			if($(i+1)==$(i+4)){
				if($(i)<$(i+3)){
					print $(i+1), $(i+3), $(i)
				}
			}
		}		
	}' | sort -r


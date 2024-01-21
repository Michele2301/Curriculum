grep -e "num-votes" -e "class=\"command\"" |
	sed -r 's-<.*>(.*)<.*>-\1-g' |
	awk '
		BEGIN {FS="\n"; RS="^$"}
		{
			for (i=1;i<=NF;i=i+2){
				if ($(i+1)+0>=5){
					print $i
				}
			}
		}
	'

find . -type d |sort | tail -n "+2" | awk '
	BEGIN {FS="\n";RS="^$"}
	{
		NF=NF-1
		print
		for(i=1;i<=NF;i++){
			cmd="find "$i" -atime -30 -type f | wc -l"
			print cmd
			cmd | getline result
			close(cmd)
			print result
			if(result == 0){
				cmd="find "$i" -type d | wc -l | tr -d \"\\n\""
				cmd | getline resultd
				close(cmd)
				cmd="tar -czvf "$i".tgz "$i
				system(cmd)
				cmd="rm -rf "$i
				system(cmd)
				i=i+resultd-1
			}
		}
	}
'

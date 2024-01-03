from typing import List, Tuple

def main(input:List[Tuple[int,str]]) -> List[Tuple[str, int]]:
    words = input[1].split()
    output=[]
    for i in words:
        output.append((i,1))
    return output

from typing import List, Tuple
def main(input: List[Tuple[str,int]]) -> List[Tuple[str, List[int]]]:
    output_data={}
    for key,value in input:
        if key in output_data:
            output_data[key].append(value)
        else:
            output_data[key]=[value]
    output=[]
    for (word,listcount) in output_data.items():
        output.append((word,listcount))
    return output
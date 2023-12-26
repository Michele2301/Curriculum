from typing import List, Tuple

# we can't put a check for the input because it will be given at runtime by the durable function
def main(input) -> List[Tuple[str, int]]:
    words = input[1].split()
    output=[]
    for i in words:
        output.append((i,1))
    return output

from typing import Tuple

def main(input) -> Tuple[str,int]:
    #converting from list of obj to list of int
    for i in input[1]:
        i=int(i)
    return (input[0],sum(input[1]))
from typing import Tuple,List

def main(input: List[Tuple[str,int]]) -> Tuple[str,int]:
    return (input[0],sum(input[1]))
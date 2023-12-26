import azure.functions as func
import azure.durable_functions as df
import logging
from GetInputData import GetInputDataFn

def orchestrator_function(context: df.DurableOrchestrationContext):
    phrases=GetInputDataFn()
    tasks=[]
    for phrase in phrases:
        tasks.append(context.call_activity("map",phrase))
    outputmap_tmp=yield context.task_all(tasks)
    outputmap=[]
    for i in outputmap_tmp:
        for value in i:
            outputmap.append(value)
    logging.info("MAP "+str(outputmap))
    outputshuffle=yield context.call_activity("shuffle",outputmap)
    logging.info("SHUFFLE "+str(outputshuffle))
    tasks=[]
    for i in outputshuffle:
        tasks.append(context.call_activity("reduce", i))
    output=yield context.task_all(tasks)
    logging.info("REDUCE "+str(output))
    return output
main = df.Orchestrator.create(orchestrator_function)
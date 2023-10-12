# Project Estimation - CURRENT
Date: 27-04-2023

Version: 1.0


# Estimation approach
Consider the EZWallet  project in CURRENT version (as received by the teachers), assume that you are going to develop the project INDEPENDENT of the deadlines of the course
# Estimate by size
### 
|                                                                                                         | Estimate |             
|---------------------------------------------------------------------------------------------------------|----------|  
| NC =  Estimated number of classes to be developed                                                       | 20       |             
| A = Estimated average size per class, in LOC                                                            | 80       | 
| S = Estimated size of project, in LOC (= NC * A)                                                        | 1600     |
| E = Estimated effort, in person hours (here use productivity 10 LOC per person hour)                    | 160      |   
| C = Estimated cost, in euro (here use 1 person hour cost = 30 euro)                                     | 4800     | 
| Estimated calendar time, in calendar weeks (Assume team of 4 people, 8 hours per day, 5 days per week ) | 5 days   |               

# Estimate by product decomposition
### 
| component name       | Estimated effort (person hours) |             
|----------------------|---------------------------------| 
| requirement document | 20                              |
| GUI prototype        | 10                              |
| design document      | 10                              |
| code                 | 80                              |
| unit tests           | 15                              |
| api tests            | 15                              |
| management documents | 15                              |



# Estimate by activity decomposition
### 
| Activity name                        | Estimated effort (person hours) |             
|--------------------------------------|---------------------------------| 
| Model the process                    | 5                               |
| Identify user requirements           | 15                              |
| Identify performance requirements    | 15                              |
| Identify design requirements         | 15                              |
| Identify implementation requirements | 15                              |
| Writing the code                     | 80                              |
| Check if it matches the requirements | 20                              |

###
Insert here Gantt chart with above activities
<img src="./UML/images/gantt_diagram_v2.png"></img>
# Summary

Report here the results of the three estimation approaches. The  estimates may differ. Discuss here the possible reasons for the difference

|                                    | Estimated effort | Estimated duration |          
|------------------------------------|------------------|--------------------|
| estimate by size                   | 160              | 5 days             |
| estimate by product decomposition  | 165              | 6 days             |
| estimate by activity decomposition | 165              | 6 days             |

the size estimation is based on an average LOC/h of the last projects during the entire lifespan, this one seems more complex and that's why
there is a small gap between the estimations.

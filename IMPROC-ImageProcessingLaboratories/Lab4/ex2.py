import numpy as np
import cv2

#Load the image
img = cv2.imread('Lenna.jpg')
x=img.shape[0]
y=img.shape[1]


#we use BGR format in opencv
redimg=img[:,:,2]
greenimg=img[:,:,1]
blueimg=img[:,:,0]

#flip the images in the right position
greenimg=cv2.flip(greenimg,0)
redimg=cv2.flip(redimg,1)
blueimg=cv2.flip(blueimg,1)
blueimg=cv2.flip(blueimg,0)

#display the images with a total image of size 2*x and 2*y
totalimg=np.zeros((2*x,2*y,3),np.uint8)
# positioning and assigning the correct output channel
totalimg[0:x,0:y,:]=img
totalimg[x:2*x,0:y,0]=blueimg
totalimg[0:x,y:2*y,1]=greenimg
totalimg[x:2*x,y:2*y,2]=redimg
# we only put B or G or R in the correct channel and the rest are equal to 0

#Displaying the image
cv2.imshow('Total Image',totalimg)

cv2.waitKey(0)
cv2.destroyAllWindows()
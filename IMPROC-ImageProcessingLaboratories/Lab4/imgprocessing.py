import numpy as np
import cv2

kernel_size = 3
ddepth = cv2.CV_16S
#range in python 3.x and xrange in python 2.x
xrange = range

#Load the image 'Baboon.jpg'
color_img = cv2.imread('Baboon.jpg')
cv2.imshow('Baboon Color', color_img)

#Grayscale image
gray_img = cv2.cvtColor(color_img, cv2.COLOR_BGR2GRAY)
cv2.imshow('Baboon Gray', gray_img)

#Applying histogram equalization to grayscale image
histimg=cv2.equalizeHist(gray_img)
cv2.imshow('Hist image', histimg)

#Get the rows, columns of histogram equalization image
rows,cols = histimg.shape

#Remapping image upside down
flippedimg=cv2.flip(histimg,0)
cv2.imshow('flipped', flippedimg)
#Reflection in the x direction
reflectedimg=cv2.flip(histimg,1)
cv2.imshow('reflected', reflectedimg)
### ((Experiment with any three filtering methods, as shown in example below))

# 1) Median filter
medianimg=cv2.medianBlur(histimg,kernel_size)
cv2.imshow('median', medianimg)

# 2) Gaussian filter
gaussianimg=cv2.GaussianBlur(histimg,(kernel_size,kernel_size),0)
cv2.imshow('gaussian', gaussianimg)

# 3) Bilateral filter
bilateralimg=cv2.bilateralFilter(histimg,9,75,75)
cv2.imshow('bilateral', bilateralimg)

### ((Choose one of the filter result for further experiments))
# bilateral filter result is chosen, because it seemed the best to remove noise and preserve important edges
filteredimg=bilateralimg
#Applying the Laplacian function to compute the edge image using the Laplace Operator
laplacianimg=cv2.Laplacian(filteredimg,ddepth)
laplacianimg=cv2.convertScaleAbs(laplacianimg)
cv2.imshow('Laplacian', laplacianimg)
### ((Experiment with any two edge detection methods, as shown in example below))
 

# 1) Apply Sobel Edge Detection

##Compute gradient x for Sobel Edge
gradientxsobel=cv2.Sobel(filteredimg,ddepth,1,0)
gradientxsobel=cv2.convertScaleAbs(gradientxsobel)
cv2.imshow('Sobel Gradient X', gradientxsobel)

##Compute gradient y for Sobel Edge 
gradientysobel=cv2.Sobel(filteredimg,ddepth,0,1)
gradientysobel=cv2.convertScaleAbs(gradientysobel)
cv2.imshow('Sobel Gradient Y', gradientysobel)

##Total gradient for Sobel Edge 
sobelimg=cv2.addWeighted(gradientxsobel,0.5,gradientysobel,0.5,0)
sobelimg=cv2.convertScaleAbs(sobelimg)
cv2.imshow('Sobel', sobelimg)


# 2) Apply Canny Edge Detection
cannyimg=cv2.Canny(filteredimg,100,200)
cv2.imshow('Canny', cannyimg)

#Displaying the images


#Wait until user exit program by pressing a key
cv2.waitKey(0)
cv2.destroyAllWindows()

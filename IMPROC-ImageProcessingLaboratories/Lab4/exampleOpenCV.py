import numpy as np
import cv2

#Load the image
img = cv2.imread('Lenna.jpg')


#Load the image in grayscale
gray_img = cv2.imread('Lenna.jpg',0)

# Saving the image as lennagray.png
cv2.imwrite('lennagray.png', img)

#Resize to bigger image
height, width = img.shape[:2]
res = cv2.resize(img, (0,0), fx=0.5, fy=0.5)

#Get the rows, columns and channels of image source
rows,cols,ch = img.shape

#Setting the 3 points to calculate the Affine Transform
pts1 = np.float32([[0,0],
					[cols-1,0],
					[0,rows-1]])
pts2 = np.float32([[cols*0.0,rows*0.33] ,
					[cols*0.85,rows*0.25],
					[cols*0.15,rows*0.7]])

#Translating image
T = np.float32([[1,0,100],[0,1,50]])
tst = cv2.warpAffine(img,T,(cols,rows))

#Getting the Affine transform
M = cv2.getAffineTransform(pts1,pts2)

#Applying the Affine transform to the image source
dst = cv2.warpAffine(img,M,(cols,rows))

## Rotating the image after Warp

#Compute a rotation matrix with respect to the center of the image "cv2.getRotationMatrix2D(center, angle, scale)"
center = (cols/2,rows/2)
RM = cv2.getRotationMatrix2D(center,-50,0.6)

#Rotate the warped image
rst = cv2.warpAffine(dst,RM,(cols,rows))

#Displaying the images
cv2.imshow('Original image',img)

# Visualizing the grayscale image
cv2.imshow('Lenna Gray', gray_img)

# Visualizing the resized bigger image
cv2.imshow('Lenna Resized', res)

# Visualizing the translated image
cv2.imshow('Lenna Translation', tst)

#Visualizing warped image
cv2.imshow('Warp',dst)

#Visualizing warped and rotated image
cv2.imshow('Warp + Rotate',rst)

#Wait until user exit program by pressing a key
cv2.waitKey(0)
cv2.destroyAllWindows()
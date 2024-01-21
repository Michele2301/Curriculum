import numpy as np
import cv2

#Load the image
img = cv2.imread('Lenna.jpg')
img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
img = cv2.resize(img, (128,128))
#Creating the first square
rect=32*np.ones((1024,1024),np.uint8)
#Creating the second square
rect[256:768,256:768] = np.ones((512,512),np.uint8)*64
#Creating the third square
rect[384:640,384:640] = np.ones((256,256),np.uint8)*128
#Creating the last square
rect[448:576,448:576] = img

print('Image Dimensions:', rect.shape)

#Displaying the image
cv2.imshow('Final image',rect)

# Wait until user exit program by pressing a key
cv2.waitKey(0)
cv2.destroyAllWindows()

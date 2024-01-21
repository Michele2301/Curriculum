import matplotlib.pyplot as plt
import cv2
image = cv2.imread('Lenna.jpg')
print('Image Dimensions:', image.shape)
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.title('Test Image')
plt.show()
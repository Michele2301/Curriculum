% Michele Ferrero
% create the image
matrix=uint8(64*ones(256));
matrix(97:160,97:160)=uint8(192*ones(64));
subplot(2,3,1)
imshow(matrix);
title("original")
% put the noise
img=imnoise(matrix,"salt & pepper",0.5);
subplot(2,3,3)
imshow(img)
title("original with noise")
subplot(2,3,4)
% use the average filter on the image to remove as much noise as possible
h=fspecial('average',3);
% fspecial creates the filter and filter2 apply it to the image
imshow(filter2(h,img),[])
title("3x3")
subplot(2,3,5)
h=fspecial('average',5);
imshow(filter2(h,img),[])
title("5x5")
subplot(2,3,6)
h=fspecial('average',7);
imshow(filter2(h,img),[]);
title("7x7")

% ANSWERS
% 1) the higher the dimension of the average matrix is, the lower the 
% frequency of the low-pass filter is in the frequency domain.
% In the spatial domain when I increase the size of the average matrix I
% obtain a more blurred image.
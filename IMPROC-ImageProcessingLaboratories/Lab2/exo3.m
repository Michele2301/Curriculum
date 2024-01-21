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
% use the medium filter on the image to remove as much noise as possible
imshow(medfilt2(img,[3,3]),[])
title("3x3")
subplot(2,3,5)
imshow(medfilt2(img,[5,5]),[])
title("5x5")
subplot(2,3,6)
imshow(medfilt2(img,[7,7]),[])
title("7x7")


% ANSWERS
% with the average filter you also lose sharpness (due to the lost of high
% frequencies) while with the median filter this doesn't happen. What
% happens with median filter is that we can remove the noise without
% cutting high frequencies of the image, so the result will be more similar
% to the original image (without noise)
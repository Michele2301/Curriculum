% in the following code I'll add some gaussian noise and I'll find the best
% filter among average,median and weiner filters.
img=imread("ic2.tif");
% add noise
noisedimg=imnoise(img,"gaussian",0,0.1);
imshow(noisedimg)
title("noised image")
% create the average filter
h=fspecial("average",5);
% compute all the filtered images
averageimg=imfilter(noisedimg,h);
medianimg=medfilt2(noisedimg);
wienerimg=wiener2(noisedimg);

figure
subplot(1,3,1)
imshow(averageimg)
title('Average filter')
subplot(1,3,2)
imshow(medianimg)
title('Median filter')
subplot(1,3,3)
imshow(wienerimg)
title('Wiener filter')
% I chose the wiener filter because with a worse noise I think it gives
% better results than the others
%% image processing with the denoised image
% load the image and use only the median filter
clear all
close all
img=imread("ic2.tif");
noisedimg=imnoise(img,"gaussian");
filterdim=15;
filteredimg=wiener2(noisedimg,[filterdim,filterdim]);


%creating the gradiant matrices
horizontalGrandient=[[0,0,0];[1,0,-1];[0,0,0]];
verticalGradient=[[0,1,0];[0,0,0];[0,-1,0]];

% do the convolution with the image
imgverticalGradient=conv2(filteredimg,verticalGradient);
imghorizontalGradient=conv2(filteredimg,horizontalGrandient);

%compute the norm (./255 because the treshold function works on 0-1 range)
norm=sqrt(imghorizontalGradient.*imghorizontalGradient+imgverticalGradient.*imgverticalGradient)./255;

figure
subplot(2,3,2)
imshow(imgverticalGradient,[])
title("vertical gradient")
subplot(2,3,1)
imshow(imghorizontalGradient,[])
title("horizontal gradient")
subplot(2,3,3)
imshow(norm,[])
title("norm of the gradient")

% now i have to perform the thresholding, so i find the threshold and i use
% im2bw to binarize the image using that treshold.
threshold=graythresh(norm);
subplot(2,3,5)
imshow(im2bw(norm,threshold),[])
title("thresholding")

%morphological basic operations, in this case I use majority because i
%think it gives the best result.
% this operation i think in this case it's useful. It allow us to clean
% the result from some noise that is present in the binarized image.
morph=bwmorph(im2bw(norm,threshold),"majority",3);
subplot(2,3,6)
imshow(morph,[])
title("edges w/ morph")

% find the zerocrossing of the image
figure
laplacian=[[0,1,0],[1,-4,1],[0,1,0]];
zerocrossing=edge(filteredimg,'zerocross',laplacian)
subplot(1,2,1)
imshow(zerocrossing,[])
title("zero crossing on noised image")

%using canny edge algorithm
subplot(1,2,2)
canny=edge(filteredimg,"canny");
imshow(canny)
title("canny with noised image")
% the best among canny, the gradient w/treshold and the gradient w/treshold and morphological operations
% i think is the canny method because it's the only one that
% mantains the "rectangle" on the right
figure
canny=edge(filteredimg,"canny");
filtercut=floor(filterdim/2+1);
canny=canny(filtercut:end-filtercut,filtercut:end-filtercut);
% I'm not using any morphological operation (they are not required for
% functioning well in this case)
% to improve the canny (specially for high noise) I'm removing
% the borders around the canny (this canny is a filterdimXfilterdim canny
% so it has borders as a side effect) and for doing it I remove filterdim/2+1 
% pixel from each border.
% this is the final edge image:
imshow(canny,[])

% we apply the radon transform of the image
radontransform=radon(canny);
figure
imshow(radontransform,[])
colormap("parula")

% step 5
% interactiveLine(canny,radon(canny),3)

% step 6
V=max(radon(canny));
Vvert=max(V(1:90));
Vhoriz=max(V(91:180));
figure
plot(V)
figure
plot(V(1:90)+V(91:180))
angleofrotation=find((V(1:90)+V(91:180))==max(V(1:90)+V(91:180)))

figure
% minus one because we start from 1 to 90 and then from 91 to 180 and we
% have to shift everything to 0-89 and 90-189
subplot(1,2,2)
% minus because imrotate is clockwise while radon is the opposite way
imshow(imrotate(filteredimg,-(angleofrotation-1)))
title("rotated image")
subplot(1,2,1)
imshow(filteredimg)
title("original image")

% question step 6)
% radon graph:
% the x axis is the degree of rotation of the image (from 1 to 180) while
% the y is the maximum value obtained. The peaks are the in correspondence to
% the degree for which all the points are aligned vertically. So the
% maximum for the degrees between 0 and 89 is the main vertical lines while the
% maxiumum for the degrees between 90 and 179 is main horizontal line
% For the graph V(1:90)+V(91:180), the maximum is in correspondence to the
% degrees of rotation required by the image to display the main verical
% line vertically and same for the main horizontal one. 

% bonus point
% i used a bigger matrix for the wiener filter it seems
% to work nicely on rumors below 0,1 gaussian with a 15x15 weiner filter
% (even a little more but fails sometimes). 
% It sometimes doesn't work because of the noise. To increase the success
% rate I cropped the canny edge image to remove the weiner filter borders (it was a
% side effect of this filter).
%% step 4
% explaining the radon transform
bimage=0*ones(513);
bimage(128,128)=255;
figure
subplot(2,2,3)
imshow(bimage)
colormap("parula")
title("original point")
subplot(2,2,1)
imshow(log(radon(bimage)),[])
colormap("parula")
title("radon point")
rectimage=0*ones(513);
rectimage(257,:)=ones(1,513)*255;
subplot(2,2,4)
imshow(rectimage)
colormap("parula")
title("original line")
subplot(2,2,2)
imshow(log(radon(rectimage)),[])
colormap("parula")
title("radon line")

% Radon transform rotates the image and project it over the axis. So what
% happens for example with the horizontal line is that it starts with all the points
% projected as a line on the axis and then when we rotate it we will reduce 
% its length until it becomes one point (when the line is vertical) because all
% the points are projected in the same point (on the axis) and then it goes back to the
% same starting position. Also for the point what happens is the same so
% the result is a sinusoid.
% 2) because the sum of the points in the image is always the same, what
% changes in the radon transform is how they are distributed across the
% axis
% 3) 
% The Hough transform serves as a method for extracting features to detect lines
% (or any analytical curve). It involves mapping pixels from the original image
% to a more practical space known as the Hough space. This process includes
% computing parameters for the line connecting each pair of points, followed
% by adding 1 to the relevant position in the Hough space. The axes of the Hough space
% are represented by rho and theta, as each line can be expressed as 
% "rho = xcos(theta) + ysin(theta)" instead of the traditional "y = ax + b" form.
% Both the hough and the radon transform are used to find lines inside
% the image, in the hough transform case is made with a voting system (every pixel
% vote for some rho and theta which are the components of all the lines passing
% through it) while here in the radon transform it's based on the sum of 
% the pixels projected to the axis.

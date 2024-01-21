% Michele Ferrero
%% Esercise 1
%load the image
img=imread("cameraman.tif");
sgtitle("lowpass filter")
subplot(2,4,1)
imshow(img)

% creating the fft of the image
imgfft=fftshift(fft2(double(img)));
subplot(2,4,5)
% plotting it with log10
imshow(log10(abs(imgfft))+1,[]);
% cicle to create and plot all the images with different filters
param=[0.2,0.1,0.02];
for i = 2:1:4
%creating the mask
maskvalue=freqLPF(size(img),param(i-1));
%displaying the new fft after low filter
subplot(2,4,i+4)
imgfftlowfilter=imgfft.*maskvalue;
imshow(log10(abs(imgfftlowfilter))+1,[]);
title(param(i-1))

subplot(2,4,i)
%displaying the new image in the spatial dimension
imgback=ifft2(ifftshift(imgfftlowfilter));
imshow(imgback,[]);
end
% comments: higher is the % of the radius kept, better are the edges

%highpass filter
maskvaluehigh=freqHPF(size(img),0.2);
imgffthighfilter=imgfft.*maskvaluehigh;
figure(5)
imshow(log10(abs(imgffthighfilter))+1,[]);

figure(6)
imgback=ifft2(ifftshift(imgffthighfilter));
imshow(imgback,[]);


function mask = freqLPF(dim,cutOut)
%dim: is an array containing output mask’s dimensions
m = min(dim);
mask = zeros(dim(1),dim(2));
xmin = -dim(2)/2;
ymax = dim(1)/2;
[X,Y] = meshgrid(xmin:xmin+dim(2)-1,...
 ymax:-1:ymax-dim(1)+1);
R = sqrt((X/m).^2+(Y/m).^2);
indices = find(R<cutOut);
mask(indices) = 1;
end

function mask = freqHPF(dim,cutOut)
%dim: is an array containing output mask’s dimensions
m = min(dim);
mask = zeros(dim(1),dim(2));
xmin = -dim(2)/2;
ymax = dim(1)/2;
[X,Y] = meshgrid(xmin:xmin+dim(2)-1,...
 ymax:-1:ymax-dim(1)+1);
R = sqrt((X/m).^2+(Y/m).^2);
indices = find(R>cutOut);
mask(indices) = 1;
end

% ANSWERS
% a) the shape of the filter is a circle with radius based on the cutOut 
% parameter given to freqLPF
% b) it changes the radius of the cutting filter (the lower the cutOut is,
% lower is the radius and viceversa)
% c) To obtain freqHPF I changed the sign of the disequation from < to >,
% the result is that now I cut the low frequencies.
% What remains are the borders of the image (that's because it is where
% the fft has an higher module in the frequency domain)
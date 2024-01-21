%% first exercise
img=imread('lenna.png');
imggrey=rgb2gray(img);
imggreyresized=imresize(imggrey,[128,128]);
imggreyresizedflipped=fliplr(imggreyresized);
%creating the squares
grey_square32=uint8(32.*ones(1024,1024));
grey_square64=uint8(64.*ones(512,512));
grey_square128=uint8(128.*ones(256,256));
%adding them together by substituting pixels
grey_square32(257:768,257:768)=grey_square64;
grey_square32(385:640,385:640)=grey_square128;
grey_square32(449:576,449:576)=imggreyresizedflipped;
imshow(grey_square32);

%% second exercise (text is wrong, B in blue ch R in red ch and G in green ch)
img=imread("lenna.png");
empty=uint8(zeros(size(img,1),size(img,2)));
R=img(:,:,1);
G=img(:,:,2);
B=img(:,:,3);
% creating them
Rred=cat(3,R,empty,empty);
Rred=flipud(Rred);
Bblue=cat(3,empty,empty,B);
Bblue=fliplr(Bblue);
Ggreen=cat(3,empty,G,empty);
Ggreen=fliplr(flipud(Ggreen));
% assembling them
finalimg=cat(1 ...
    ,cat(2,img,Rred) ...
    ,cat(2,Bblue,Ggreen));
imshow(finalimg)

%% third exercise
% 
%loading lena with gray scale and resized
set(surface,'Linestyle','none');
img=imread("lenna.png");
img=rgb2gray(imresize(img,1/2));
% creating the graph
surf([1:1:size(img,1)],[1:1:size(img,2)],img)
colormap(gray(256))

%% fourth exercise
img=imread("lenna.png");
img=rgb2gray(img);
imgtmp={8};
% creating a list of matrices, one for each bit by using division to create
% logical shift and module to know the value of the bit
for i = [1:1:8]
    imgtmp{i}=255*(mod(floor(double(img)/pow2(i-1)),2));
end
imshow(cat(1 ...
    ,cat(2,imgtmp{1},imgtmp{2},imgtmp{3} ...
    ,imgtmp{4}),cat(2,imgtmp{5},imgtmp{6},imgtmp{7},imgtmp{8})))

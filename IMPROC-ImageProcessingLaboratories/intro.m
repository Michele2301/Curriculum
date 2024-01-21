matrix=rand(2,4);
x=linspace(-pi,pi,100);
y=sin(x);
y1=cos(x);
figure
title("images")
plot(x,y,'r')
hold on
plot (x,y1,'b')
hold off
legend("sin","cos")
subplot(2,1,1)
plot(x,y)
subplot(2,1,2)
plot(x,y1)
%% 3d plot
x=linspace(0,10,100);
y=linspace(0,10,100);
[X, Y] = ndgrid(x, y);
z=X+Y;
plot3(X,Y,z)
%%
img=imread("lenna.png");
imshow(img)
size(img)
R=img(:,:,1);
empty=uint8(zeros(size(img,1),size(img,2)));
Rred=cat(3,R,empty,empty);
Ggreen=cat(3,empty,G,empty);
Bblue=cat(3,empty,empty,B);
G=img(:,:,2);
B=img(:,:,3);
subplot(2,3,1)
imshow(R)
subplot(2,3,2)
imshow(G)
subplot(2,3,3)
imshow(B)
subplot(2,3,4)
imshow(Rred)
subplot(2,3,5)
imshow(Ggreen)
subplot(2,3,6)
imshow(Bblue)
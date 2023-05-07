#include "forme.h"
void LCD_Cerchio(int32_t x,int32_t y,int32_t r,int16_t Color){
	int i,j;
	for(i=x-r;i<x+r+1;i++){
		for(j=y-r;j<y+r+1;j++){
			if((i*i+j*j-2*x*i-2*y*j+x*x+y*y-r*r)<=0){
				LCD_SetPoint(i,j,Color);
			}
		}
	}
};

//y=ax+b
//y=a(x+b)
void LCD_Circular_Sector(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,float a,int32_t increment){
	int i,j;
	for(i=x-r-increment;i<x+r+1+increment;i++){
		if(i>0&&i<240){
			for(j=y-r;j<y+r+1;j++){
				if((i*i+j*j-2*x*i-2*y*j+x*x+y*y-r*r)<=0){ //circumference
					if((j-y)<(a*(i-x))&&(j-y)>=(-a*(i-x))){ //line
						LCD_SetPoint(i,j,BackGround);
					}else{
						LCD_SetPoint(i,j,Color);
					}
				}else{
					LCD_SetPoint(i,j,BackGround);
				}
			}
		}
	}
};

void LCD_close(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround){
	float a;
	for(a=1;a>=0.1;a/=1.5){
		LCD_Circular_Sector(x,y,r,Color,BackGround,a,0);
	}
}

void LCD_open(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround){
	float a;
	for(a=0.1;a<1;a*=1.5){
		LCD_Circular_Sector(x,y,r,Color,BackGround,a,0);
	}
};
int LCD_move_close_open(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,int increment){
	int i;
	int j;
	int count=0;
	float a=1;
	int module;
	int tot;
	tot=increment/20;
	module=increment%20;
	for(j=0;j<tot;j++){
		for(i=0;i<5;i++){
			a/=1.5;
			count+=2;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,2);
		}
		for(;i<10;i++){
			a*=1.5;
			count+=2;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,2);
		}
	}
	for(i=0;i<module/2;i++){
			a/=1.5;
			count+=1;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,1);
		}
		for(;i<module;i++){
			a*=1.5;
			count+=1;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,1);
		}
	return x+count;
}

int LCD_move_close_open_left(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,int increment){
	int i;
	int j;
	int count=0;
	float a=-1;
	int module;
	int tot;
	tot=increment/20;
	module=increment%20;
	for(j=0;j<tot;j++){
		for(i=0;i<5;i++){
			a/=1.5;
			count-=2;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,2);
		}
		for(;i<10;i++){
			a*=1.5;
			count-=2;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,2);
		}
	}
	for(i=0;i<module/2;i++){
			a/=1.5;
			count-=1;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,1);
		}
		for(;i<module;i++){
			a*=1.5;
			count-=1;
			LCD_Circular_Sector(x+count,y,r,Color,BackGround,a,1);
		}
	return x+count;
}

int LCD_move(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,float a,int32_t increment){
	int i;
	for(i=0;i<increment;i+=2){
		x+=1;
		LCD_Circular_Sector(x,y,r,Color,BackGround,a,2);
	}
	return x;
}

void LCD_triangle(int32_t x,int32_t y,int16_t Color){
	float i;
	for(i=0;i<40;i+=0.5){
		LCD_DrawLine(x,y-i,x+i,y-i,Color);
		LCD_DrawLine(x,y-i,x-i,y-i,Color);
	}
}

void LCD_rectangle(int32_t x,int32_t y,int32_t lenght,int32_t height,int32_t border,int32_t Color){
	int i;
	for(i=0;i<border;i++){
		LCD_DrawLine(x,y+i,x+lenght,y+i,Color);
		LCD_DrawLine(x,y+height-i,x+lenght,y+height-i,Color);
	}
	for(i=0;i<border;i++){
		LCD_DrawLine(x+i,y,x+i,y+height,Color);
		LCD_DrawLine(x+lenght-i,y,x+lenght-i,y+height,Color);
	}
	
}


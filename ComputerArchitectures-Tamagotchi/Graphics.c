#include "Graphics.h"
int RectHappiness[5]={16,34,52,70,88};
int RectSatiety[5]={136,154,172,190,208};
int reset=0;
int8_t img_reset[18][30]={
	0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,
	1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,0,1,1,1,0,0,1,1,0,0,0,
	1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0,1,1,1,1,1,1,1,0,0,1,1,0,0,0,
	1,1,0,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,0,1,1,0,0,1,1,1,1,0,
	1,1,0,0,1,1,0,0,1,1,1,1,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,0,
	1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,0,0,0,
	0,1,1,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,1,1,0,0,1,1,1,1,1,
	0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	0,1,1,1,1,0,0,0,1,1,0,0,1,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,
	1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,0,
	1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,0,
	1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,1,1,0,0,0,1,1,0,0,1,1,0,
	1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,0,0,0,1,1,1,1,1,0,0,
	1,1,0,0,1,1,0,0,0,1,1,1,1,0,0,0,1,1,0,0,0,0,0,1,1,0,0,1,1,0,
	0,1,1,1,1,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,1,1,0,0,1,1,0,
	0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
};

int8_t img_apple[12][11]={
	0,0,0,0,0,0,1,1,1,1,0,
	0,0,0,0,0,1,4,3,3,3,1,
	0,0,0,0,1,4,3,3,3,1,0,
	0,0,1,1,1,4,1,1,1,0,0,
	0,1,2,2,2,1,2,2,2,1,0,
	1,2,2,2,2,2,2,2,2,2,1,
	1,2,2,2,2,2,2,2,2,2,1,
	1,2,2,2,2,2,2,2,2,2,1,
	1,2,2,2,2,2,2,2,2,2,1,
	0,1,2,2,2,2,2,2,2,1,0,
	0,0,1,2,2,2,2,2,1,0,0,
	0,0,0,1,1,1,1,1,0,0,0,
};

int LCD_setup(int32_t BackGround,int32_t Color,int32_t radius){
	int x;
	int16_t ColorBack=Black;
	NVIC_EnableIRQ(TIMER0_IRQn);
	NVIC_EnableIRQ(TIMER1_IRQn);
	LCD_Clear(BackGround);
	LCD_rectangle(12,40,96,40,2,ColorBack);//0-120
	LCD_rectangle(132,40,96,40,2,ColorBack);
	//	12 - 2 - 2 - 16 - 2 - 16 - 2 - 16 - 2 - 16 - 2 - 16 - 2 - 2 - 12
	//	120-20-4-18
	LCD_DrawRectangle(16,44,16,32,ColorBack);
	LCD_DrawRectangle(34,44,16,32,ColorBack);
	LCD_DrawRectangle(52,44,16,32,ColorBack);
	LCD_DrawRectangle(70,44,16,32,ColorBack);
	LCD_DrawRectangle(88,44,16,32,ColorBack);
	LCD_DrawRectangle(136,44,16,32,ColorBack);
	LCD_DrawRectangle(154,44,16,32,ColorBack);
	LCD_DrawRectangle(172,44,16,32,ColorBack);
	LCD_DrawRectangle(190,44,16,32,ColorBack);
	LCD_DrawRectangle(208,44,16,32,ColorBack);
	GUI_Text(16, 22, (uint8_t *) "Happiness", ColorBack, BackGround);
	GUI_Text(136, 22, (uint8_t *) "Satiety", ColorBack, BackGround);
	GUI_Text(70, 2, (uint8_t *) "Age: 00:00:00", ColorBack, BackGround);
	LCD_rectangle(0,260,120,60,3,ColorBack);
	LCD_rectangle(120,260,120,60,3,ColorBack);
	GUI_Text(40, 285, (uint8_t *) "Meal", ColorBack, BackGround);
	GUI_Text(160, 285, (uint8_t *) "Snack", ColorBack, BackGround);

	x=LCD_move_close_open(30,160,radius,Color,BackGround,90);
	
	return x;
}

void LCD_Start(){
	enable_timer(0);
	enable_timer(1);
}

void SatietyDown(int life,int16_t BackGround){
	LCD_DrawRectangle(RectSatiety[life-1],44,16,32,BackGround);
}

void HappinessDown(int life,int16_t BackGround){
	LCD_DrawRectangle(RectHappiness[life-1],44,16,32,BackGround);
}

void SatietyUp(int life,int16_t Color){
	int16_t ColorBack=Black;
	LCD_DrawRectangle(RectSatiety[life-1],44,16,32,ColorBack);
}
void HappinessUp(int life,int16_t Color){
	int16_t ColorBack=Black;
	LCD_DrawRectangle(RectHappiness[life-1],44,16,32,ColorBack);
}
void Reset(int16_t Color,int16_t BackGround){
	int k,m;
	int16_t ColorBack=Black;
	int x=40,y=130,b=5;
	reset=1;
	disable_timer(0);
	disable_timer(1);
	NVIC_DisableIRQ(TIMER0_IRQn);
	NVIC_DisableIRQ(TIMER1_IRQn);
	LCD_DrawRectangle(3,263,234,57,White);
	LCD_rectangle(0,260,240,60,3,Red);
	LCD_move_close_open_left(120,160,30,Color,BackGround,150);
	GUI_Text(100, 285, (uint8_t *) "Reset", ColorBack, BackGround);
	for(k=0;k<18;k++){
		for(m=0;m<30;m++){
			if(img_reset[k][m]==1){
				LCD_DrawRectangle(x+b*m,y+b*k,b,b,Yellow);
			}else{
				LCD_DrawRectangle(x+b*m,y+b*k,b,b,Red);
			}
		}
	}
	
}
void CreateSnack(int16_t Color,int16_t BackGround){ //position 180 
	//LCD_Cerchio(180,160,10,Yellow);
	int x=165;
	int y=130;
	int b=4;
	int16_t Color1=Green;
	int k,l;
	for(k=0;k<12;k++){
		for(l=0;l<11;l++){
			switch(img_apple[k][l]){
				case 0:
					LCD_DrawRectangle(x+l*b,y+k*b,b,b,BackGround);
					break;
				case 1:
					LCD_DrawRectangle(x+l*b,y+k*b,b,b,Black);
					break;
				case 2:
					LCD_DrawRectangle(x+l*b,y+k*b,b,b,Color1);
					break;
				case 3:
					LCD_DrawRectangle(x+l*b,y+k*b,b,b,0x64cd);
				case 4:
					LCD_DrawRectangle(x+l*b,y+k*b,b,b,0xc2a0);
				default:
					break;
			}
		}
	}
}

void CreateMeal(int16_t Color,int16_t BackGround){ //position 60
	int x=30;
	int y=150;
	int b=2;
	int16_t Color1=Red;
	int16_t ColorBack=Black;
	LCD_DrawRectangle(x+9*b,y,6*b,b,ColorBack);
	LCD_DrawRectangle(x+7*b,y+b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+5*b,y+2*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+3*b,y+3*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+2*b,y+4*b,b,b,ColorBack);
	LCD_DrawRectangle(x+b,y+5*b,b,4*b,ColorBack);
	LCD_DrawRectangle(x+2*b,y+9*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+4*b,y+10*b,4*b,b,ColorBack);
	LCD_DrawRectangle(x+8*b,y+9*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+10*b,y+8*b,b,b,ColorBack);
	LCD_DrawRectangle(x+11*b,y+7*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+13*b,y+6*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+15*b,y+5*b,4*b,b,ColorBack);
	LCD_DrawRectangle(x+19*b,y+6*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+21*b,y+7*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+23*b,y+6*b,b,b,ColorBack);
	LCD_DrawRectangle(x+22*b,y+5*b,b,b,ColorBack);
	LCD_DrawRectangle(x+21*b,y+4*b,b,b,ColorBack);
	LCD_DrawRectangle(x+20*b,y+3*b,b,b,ColorBack);
	LCD_DrawRectangle(x+18*b,y+2*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+15*b,y+b,3*b,b,ColorBack);
	LCD_DrawRectangle(x+2*b,y+9*b,b,4*b,ColorBack);
	LCD_DrawRectangle(x+3*b,y+13*b,b,b,ColorBack);
	LCD_DrawRectangle(x+4*b,y+14*b,6*b,b,ColorBack);
	LCD_DrawRectangle(x+10*b,y+13*b,3*b,b,ColorBack);
	LCD_DrawRectangle(x+13*b,y+12*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+15*b,y+11*b,2*b,b,ColorBack);
	LCD_DrawRectangle(x+17*b,y+10*b,b,b,ColorBack);
	LCD_DrawRectangle(x+18*b,y+9*b,b,b,ColorBack);
	LCD_DrawRectangle(x+19*b,y+6*b,b,3*b,ColorBack);
	LCD_DrawRectangle(x+9*b,y+b,6*b,b,Color1);
	LCD_DrawRectangle(x+7*b,y+2*b,11*b,b,Color1);
	LCD_DrawRectangle(x+5*b,y+3*b,15*b,b,Color1);
	LCD_DrawRectangle(x+3*b,y+4*b,18*b,b,Color1);
	LCD_DrawRectangle(x+2*b,y+5*b,13*b,b,Color1);
	LCD_DrawRectangle(x+2*b,y+6*b,11*b,b,Color1);
	LCD_DrawRectangle(x+2*b,y+7*b,9*b,b,Color1);
	LCD_DrawRectangle(x+2*b,y+8*b,8*b,b,Color1);
	LCD_DrawRectangle(x+4*b,y+9*b,4*b,b,Color1);
	LCD_DrawRectangle(x+19*b,y+5*b,3*b,b,Color1);
	LCD_DrawRectangle(x+21*b,y+6*b,2*b,b,Color1);
}
void DestroyMeal(int16_t Color,int16_t BackGround){
	LCD_triangle(60,180,BackGround);
}

void DestroySnack(int16_t Color,int16_t BackGround){
	LCD_Cerchio(180,160,10,White);
}

/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           IRQ_RIT.c
** Last modified Date:  2014-09-25
** Last Version:        V1.00
** Descriptions:        functions to manage T0 and T1 interrupts
** Correlated files:    RIT.h
**--------------------------------------------------------------------------------------------------------
*********************************************************************************************************/
#include "lpc17xx.h"
#include "RIT.h"
#include "../Sample.h"
/******************************************************************************
** Function name:		RIT_IRQHandler
**
** Descriptions:		REPETITIVE INTERRUPT TIMER handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/
uint8_t hearts[8][9]={
	0,0,0,0,0,0,0,0,0,
	0,0,1,1,0,1,1,0,0,
	0,1,1,1,1,1,1,1,0,
	0,1,1,1,1,1,1,1,0,
	0,0,1,1,1,1,1,0,0,
	0,0,0,1,1,1,0,0,0,
	0,0,0,0,1,0,0,0,0,
	0,0,0,0,0,0,0,0,0,
};
void cuddles_draw(void){
	int i;
									//   130
				//+++++++90++++60(PM)++++90+++++++++
									//   130
	int j;
	int ys1=120;
	int xs1=150;
	int ritardo=3000000;
	int block1=3;
	int ys2=100;
	int xs2=180;
	int block2=2;
	int ys3=90;
	int xs3=200;
	int block3=1;
	disable_timer(0);
	disable_timer(1);
	for(i=0;i<8;i++){
		for(j=0;j<9;j++){
			if(hearts[i][j]==0){
				LCD_DrawRectangle(j*block1+xs1,i*block1+ys1,block1,block1,White);
			}else{
				LCD_DrawRectangle(j*block1+xs1,i*block1+ys1,block1,block1,Red);
			}
		}
	}
	for(i=0;i<ritardo;i++); //delay
	for(i=0;i<8;i++){
		for(j=0;j<9;j++){
			if(hearts[i][j]==0){
				LCD_DrawRectangle(j*block2+xs2,i*block2+ys2,block2,block2,White);
			}else{
				LCD_DrawRectangle(j*block2+xs2,i*block2+ys2,block2,block2,Red);
			}
		}
	}
	for(i=0;i<ritardo;i++); //delay
	for(i=0;i<8;i++){
		for(j=0;j<9;j++){
			LCD_DrawRectangle(j*block1+xs1,i*block1+ys1,block1,block1,White);
		}
	}
	for(i=0;i<8;i++){
		for(j=0;j<9;j++){
			if(hearts[i][j]==0){
				LCD_DrawRectangle(j*block3+xs3,i*block3+ys3,block3,block3,White);
			}else{
				LCD_DrawRectangle(j*block3+xs3,i*block3+ys3,block3,block3,Red);
			}
		}
	}
	for(i=0;i<ritardo;i++); //delay
	for(i=0;i<8;i++){
		for(j=0;j<9;j++){
			LCD_DrawRectangle(j*block2+xs2,i*block2+ys2,block2,block2,White);
		}
	}
	for(i=0;i<8;i++){
		for(j=0;j<9;j++){
			LCD_DrawRectangle(j*block3+xs3,i*block3+ys3,block3,block3,White);
		}
	}
	enable_timer(0);
	enable_timer(1);
}


void RIT_IRQHandler (void)
{		
	static int Select=0;
	int i;
	if(reset==0){
		if((LPC_GPIO1->FIOPIN & (1<<27))==0){ //left
				LCD_rectangle(120,260,120,60,3,Black);
				LCD_rectangle(0,260,120,60,3,ColorMark);
				Select=1;
		}
		if((LPC_GPIO1->FIOPIN & (1<<28))==0){ //right
				LCD_rectangle(0,260,120,60,3,Black);
				LCD_rectangle(120,260,120,60,3,ColorMark);
				Select=2;
		}
	}
	
	if((LPC_GPIO1->FIOPIN & (1<<25))==0){ //sel
		if(reset==0){
			Click_Music();
			switch(Select){
				case 1:
					disable_timer(0);
					disable_timer(1);
					CreateMeal(Color,BackGround);
					x=LCD_move_close_open_left(x,y,r,Color,BackGround,60);
					Eating_Music();
					for(i=0;i<3;i++){
						LCD_open(x,y,r,Color,BackGround);
						LCD_close(x,y,r,Color,BackGround);
					}
					//music
					if(happiness!=5){
						happiness++;
						HappinessUp(happiness,Color);
					}
					x=LCD_move_close_open(x,y,r,Color,BackGround,60);
					enable_timer(0);
					enable_timer(1);
					break;
				case 2:
					disable_timer(0);
					disable_timer(1);
					CreateSnack(Color,BackGround);
					x=LCD_move_close_open(x,y,r,Color,BackGround,60);
					//music
					Eating_Music();
					for(i=0;i<3;i++){
						LCD_open(x,y,r,Color,BackGround);
						LCD_close(x,y,r,Color,BackGround);
					}
					if(satiety!=5){
						satiety++;
						SatietyUp(satiety,Color);
					}
					x=LCD_move_close_open_left(x,y,r,Color,BackGround,60);
					LCD_open(x,y,r,Color,BackGround);
					enable_timer(0);
					enable_timer(1);
					break;
				default:
					break;
			}
		}else{
			LCD_setup(BackGround,Color,r);
			reset_timer(0);
			reset_timer(1);
			happiness=5;
			satiety=5;
			reset=0;
			Minutes=0;
			Hours=0;
			Seconds=0;
			enable_timer(0);
			enable_timer(1);
		}
	}
	ADC_start_conversion();
	getDisplayPoint(&display, Read_Ads7846(), &matrix );
	if(display.x<150&&display.x>90&&display.y<190&&display.y>130){
		//cuddles
		disable_timer(1);
		disable_timer(0);
		Cuddles_Music();
		for(i=0;i<5;i++){
			cuddles_draw();
		}
		if(happiness!=5){
			happiness++;
			HappinessUp(happiness,Color);
		}
		//reset coordinates
		display.x=0;
		display.y=0;
		enable_timer(1);
		enable_timer(0);
	}
  LPC_RIT->RICTRL |= 0x1;	/* clear interrupt flag */
	
  return;
}
/******************************************************************************
**                            End Of File
******************************************************************************/

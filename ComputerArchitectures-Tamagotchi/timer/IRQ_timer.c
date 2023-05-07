/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           IRQ_timer.c
** Last modified Date:  2014-09-25
** Last Version:        V1.00
** Descriptions:        functions to manage T0 and T1 interrupts
** Correlated files:    timer.h
**--------------------------------------------------------------------------------------------------------
*********************************************************************************************************/
#include <string.h>
#include "lpc17xx.h"
#include "timer.h"
#include "../GLCD/GLCD.h" 
#include "../TouchPanel/TouchPanel.h"
#include <stdio.h>
#include "../Sample.h"
#include "../Graphics.h"
#include "../Songs/Songs.h"
/******************************************************************************
** Function name:		Timer0_IRQHandler
**
** Descriptions:		Timer/Counter 0 interrupt handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/
int Hours=0;
int Minutes=0;
int Seconds=0;
uint16_t SinTable[45] =                                       /* ÕýÏÒ±í                       */
{
	511, 582, 652, 719, 782, 839, 891,
	935, 970, 997, 1014, 1022, 1019, 1007,
	985, 954, 914, 866, 811, 751, 686, 617, 547,
	475, 405, 336, 271, 211, 156, 108, 68, 37, 15,
	3, 0, 8, 25, 52, 87, 131, 183, 240, 303, 370,
	440
};
void TIMER0_IRQHandler (void)
{
	char str[10]="";
	static int Open=0;
	Seconds++;
	if(Seconds==60){
		Seconds=0;
		Minutes++;
	}
	if(Minutes==60){
		Hours++;
		Minutes=0;
	}
	if(Hours==24){
		LCD_SetBackground(White);
		GUI_Text(70, 2, (uint8_t *) "        Fine tempo!         ", Black, White);
		Death_Music();
		Reset(Color,BackGround);
	}
	sprintf(str, "Age: %02d:%02d:%02d", Hours,Minutes,Seconds);
	GUI_Text(70, 2, (uint8_t *) str, ColorBack, BackGround);
	if(Open==0){
		LCD_close(x,y,r,Color,BackGround);
		Open=1;
	}else{
		LCD_open(x,y,r,Color,BackGround);
		Open=0;
	}
  LPC_TIM0->IR = 1;			/* clear interrupt flag */
  return;
}


/******************************************************************************
** Function name:		Timer1_IRQHandler
**
** Descriptions:		Timer/Counter 1 interrupt handler
**
** parameters:			None
** Returned value:		None
**
******************************************************************************/
void TIMER1_IRQHandler (void)
{
	SatietyDown(satiety,BackGround);
	satiety--;
	HappinessDown(happiness,BackGround);
	happiness--;
	if(satiety==0||happiness==0){
		Death_Music();
		Reset(Color,BackGround);
	}
  LPC_TIM1->IR = 1;			/* clear interrupt flag */
  return;
}

void TIMER2_IRQHandler (void){
	static int ticks=0;
	/* DAC management */	
	LPC_DAC->DACR = ((SinTable[ticks]*Volume/1022)<<6);
	ticks++;
	if(ticks==45){
		ticks=0;
	};
  LPC_TIM2->IR = 1;			/* clear interrupt flag */
  return;
}

void TIMER3_IRQHandler (void){
	if(cuddles>0){
		Cuddles_Music();
	}
	if(clk>0){
		Click_Music();
	}
	if(eat>0){
		Eating_Music();
	}
	if(death>0){
		Death_Music();
	}
  LPC_TIM3->IR = 1;			/* clear interrupt flag */
  return;
}
/******************************************************************************
**                            End Of File
******************************************************************************/

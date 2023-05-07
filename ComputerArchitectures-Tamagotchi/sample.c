/****************************************Copyright (c)****************************************************
**                                      
**                                 http://www.powermcu.com
**
**--------------File Info---------------------------------------------------------------------------------
** File name:               main.c
** Descriptions:            The GLCD application function
**
**--------------------------------------------------------------------------------------------------------
** Created by:              AVRman
** Created date:            2010-11-7
** Version:                 v1.0
** Descriptions:            The original version
**
**--------------------------------------------------------------------------------------------------------
** Modified by:             Paolo Bernardi
** Modified date:           03/01/2020
** Version:                 v2.0
** Descriptions:            basic program for LCD and Touch Panel teaching
**
*********************************************************************************************************/

/* Includes ------------------------------------------------------------------*/
#include "Sample.h"
#define SIMULATOR 1

#ifdef SIMULATOR
extern uint8_t ScaleFlag; // <- ScaleFlag needs to visible in order for the emulator to find the symbol (can be placed also inside system_LPC17xx.h but since it is RO, it needs more work)
#endif
int happiness=5;
int satiety=5;
int x=30;
int y=160;
int r=30;
int a=1;
int16_t Color=Yellow;
int16_t BackGround=White;
int16_t ColorMark=Red;
int16_t ColorBack=Black;


void DAC_init(void){
	LPC_PINCON->PINSEL1 |= (1<<21);
	LPC_PINCON->PINSEL1 &= ~(1<<20);
	LPC_GPIO0->FIODIR |= (1<<26);
}

int main(void)
{
  SystemInit();  												/* System Initialization (i.e., PLL)  */
	
  LCD_Initialization();
	joystick_init();
	TP_Init();
	ADC_init();
	TouchPanel_Calibrate();
	x=LCD_setup(BackGround,Color,r);
	init_RIT(0x4C4B40);
	init_timer(0,0x17D7840,0);
	init_timer(1,0x3B9ACA0,0); //5 seconds for each bar
	init_timer(2,0x0,0);//just to power it on
	init_timer(3,0x0,0);//just to power it on
	DAC_init();
	LCD_Start();
	enable_RIT();
	LPC_SC->PCON |= 0x1;									/* power-down	mode										*/
	LPC_SC->PCON &= ~(0x2);						
	
  while (1)	
  {
		__ASM("wfi");
  }
}

/*********************************************************************************************************
      END FILE
*********************************************************************************************************/

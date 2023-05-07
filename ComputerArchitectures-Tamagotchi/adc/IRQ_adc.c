/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           IRQ_adc.c
** Last modified Date:  20184-12-30
** Last Version:        V1.00
** Descriptions:        functions to manage A/D interrupts
** Correlated files:    adc.h
**--------------------------------------------------------------------------------------------------------       
*********************************************************************************************************/

#include "lpc17xx.h"
#include "adc.h"
#include "../GLCD/GLCD.h"
int8_t volume0[11][11]={
	0,0,0,0,1,0,0,0,0,0,0,
	0,0,0,1,1,0,0,0,0,0,0,
	0,0,1,1,1,0,0,0,0,0,0,
	0,0,1,1,1,0,1,0,0,0,1,
	1,1,1,1,1,0,0,1,0,1,0,
	1,1,1,1,1,0,0,0,1,0,0,
	1,1,1,1,1,0,0,1,0,1,0,
	0,0,1,1,1,0,1,0,0,0,1,
	0,0,1,1,1,0,0,0,0,0,0,
	0,0,0,1,1,0,0,0,0,0,0,
	0,0,0,0,1,0,0,0,0,0,0,
};
int8_t volume1[11][11]={
	0,0,0,0,1,0,0,0,0,0,0,
	0,0,0,1,1,0,0,0,0,0,0,
	0,0,1,1,1,0,0,0,0,0,0,
	0,0,1,1,1,0,0,0,0,0,0,
	1,1,1,1,1,0,1,0,0,0,0,
	1,1,1,1,1,0,1,0,0,0,0,
	1,1,1,1,1,0,1,0,0,0,0,
	0,0,1,1,1,0,0,0,0,0,0,
	0,0,1,1,1,0,0,0,0,0,0,
	0,0,0,1,1,0,0,0,0,0,0,
	0,0,0,0,1,0,0,0,0,0,0,
};
int8_t volume2[11][11]={
	0,0,0,0,1,0,0,0,0,0,0,
	0,0,0,1,1,0,0,0,0,0,0,
	0,0,1,1,1,0,0,0,1,0,0,
	0,0,1,1,1,0,0,0,1,0,0,
	1,1,1,1,1,0,1,0,1,0,0,
	1,1,1,1,1,0,1,0,1,0,0,
	1,1,1,1,1,0,1,0,1,0,0,
	0,0,1,1,1,0,0,0,1,0,0,
	0,0,1,1,1,0,0,0,1,0,0,
	0,0,0,1,1,0,0,0,0,0,0,
	0,0,0,0,1,0,0,0,0,0,0,
};
int8_t volume3[11][11]={
	0,0,0,0,1,0,0,0,0,0,1,
	0,0,0,1,1,0,0,0,0,0,1,
	0,0,1,1,1,0,0,0,1,0,1,
	0,0,1,1,1,0,0,0,1,0,1,
	1,1,1,1,1,0,1,0,1,0,1,
	1,1,1,1,1,0,1,0,1,0,1,
	1,1,1,1,1,0,1,0,1,0,1,
	0,0,1,1,1,0,0,0,1,0,1,
	0,0,1,1,1,0,0,0,1,0,1,
	0,0,0,1,1,0,0,0,0,0,1,
	0,0,0,0,1,0,0,0,0,0,1,
};
/*----------------------------------------------------------------------------
  A/D IRQ: Executed when A/D Conversion is ready (signal from ADC peripheral)
 *----------------------------------------------------------------------------*/

unsigned short AD_current;   
unsigned short AD_last = 0xFF;     /* Last converted value               */
volatile int Volume=0;
int xposition=0;
int yposition=0;
int size=2;
void volume_on1(void);
void volume_on2(void);
void volume_on3(void);
void volume_off(void);
void ADC_IRQHandler(void) {
  	
  AD_current = ((LPC_ADC->ADGDR>>4) & 0xFFF);/* Read Conversion Result             */
  Volume=1022*AD_current/4095;
	if(Volume==0){
		volume_off();//0
	}else if(Volume>700){
		volume_on3();//2800-4100
	}else if(Volume>400){
		volume_on2();//1500-2800
	}else{
		volume_on1(); //0-1500
	}
}

void volume_on1(void){
	int i,j;
	for(i=0;i<11;i++){
		for(j=0;j<11;j++){
			if(volume1[i][j]){
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,Black);
			}else{
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,White);
			}
		}
	}
}
void volume_on2(void){
	int i,j;
	for(i=0;i<11;i++){
		for(j=0;j<11;j++){
			if(volume2[i][j]){
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,Black);
			}else{
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,White);
			}
		}
	}
}
void volume_on3(void){
	int i,j;
	for(i=0;i<11;i++){
		for(j=0;j<11;j++){
			if(volume3[i][j]){
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,Black);
			}else{
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,White);
			}
		}
	}
}
void volume_off(void){
	int i,j;
	for(i=0;i<11;i++){
		for(j=0;j<11;j++){
			if(volume0[i][j]){
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,Black);
			}else{
				LCD_DrawRectangle(xposition+j*size,yposition+i*size,size,size,White);
			}
		}
	}
}

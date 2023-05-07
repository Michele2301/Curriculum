#include <math.h>
#include "GLCD/GLCD.h"
int LCD_move_close_open_left(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,int increment);
void LCD_Cerchio(int32_t x,int32_t y,int32_t r,int16_t Color);
void LCD_Circular_Sector(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,float a,int32_t increment);
void LCD_open(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround);
void LCD_close(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround);
int LCD_move(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,float a,int32_t increment);
int LCD_move_close_open(int32_t x,int32_t y,int32_t r,int16_t Color,int16_t BackGround,int increment);
void LCD_triangle(int32_t x,int32_t y,int16_t Color);
void LCD_rectangle(int32_t x,int32_t y,int32_t lenght,int32_t height,int32_t border,int32_t Color);
//movimenti pac man


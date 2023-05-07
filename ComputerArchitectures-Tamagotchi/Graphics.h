#include "forme.h"
#include "timer/timer.h"
#include "Image-Reset.c"
int LCD_setup(int32_t BackGround,int32_t Color,int32_t radius);
void LCD_Start(void);
void SatietyDown(int life,int16_t BackGround);
void HappinessDown(int life,int16_t BackGround);
void SatietyUp(int life,int16_t Color);
void HappinessUp(int life,int16_t Color);
void Reset(int16_t Color,int16_t BackGround);
void CreateSnack(int16_t Color,int16_t BackGround);
void CreateMeal(int16_t Color,int16_t BackGround);
void DestroySnack(int16_t Color,int16_t BackGround);
void DestroyMeal(int16_t Color,int16_t BackGround);
extern int reset;

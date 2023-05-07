#include "Songs.h"
void Play_Note(int note);
int clk=0;
int eat=0;
int death=0;
int cuddles=0;
int clkvett[2]={NOTE_C4,REST};
float clktime[2]={0.2,1};
int cuddlesvett[32]={NOTE_B4,NOTE_B5,NOTE_FS5,NOTE_DS5,
										NOTE_B5,NOTE_FS5,NOTE_DS5,NOTE_C5
										,NOTE_C6,NOTE_G6,NOTE_E6,NOTE_G6,
										NOTE_E6
										,NOTE_B4,NOTE_B5,NOTE_FS5,NOTE_DS5,NOTE_B5
										,NOTE_FS5,NOTE_DS5,NOTE_DS5,NOTE_E5,NOTE_F5,
										NOTE_F5,NOTE_FS5,NOTE_G5,NOTE_G5,NOTE_GS5,
										NOTE_A5,NOTE_B5,REST};
float cuddlestime[32]={1.0/16,1.0/16,1.0/16,1.0/16,
											1.0/32,3.0/32,4.0/32,
											1.0/16,1.0/16,1.0/16,1.0/16,
											1.0/32,3.0/32,4.0/32,
											1.0/16,1.0/16,1.0/16,1.0/16,
											1.0/32,3.0/32,4.0/32,
											1.0/32,1.0/32,1.0/16,1.0/32,1.0/32,1.0/16,1.0/32,1.0/32,1.0/16,1.0/8,0};
int deathvett[9]={NOTE_E5,NOTE_DS5,NOTE_D5,NOTE_CS5,NOTE_C5,NOTE_B4,NOTE_AS3,NOTE_A3,REST};
float deathtime[9]={1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,0};
int eatvett[20]={NOTE_CS4,NOTE_CS5,NOTE_GS5,NOTE_FS5,NOTE_FS6,NOTE_GS5,NOTE_F6,NOTE_GS5,REST};
float eattime[20]={1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1.0/8,1/8,1/8,1/8,1/8,1/8,1};
void Click_Music(){
	float timenote=1.0;
	int f;
	if(clkvett[clk]==REST){
		clk=0;
		reset_timer(3);
		reset_timer(2);
	}else{
		Play_Note(clkvett[cuddles]);
		f=(int)(clktime[clk]*25000000*timenote);
		init_timer(3,f,0);
		reset_timer(3);
		enable_timer(3);
		clk++;
	}
}

void Eating_Music(void){
	float timenote=2.0;
	int f;
	if(eatvett[eat]==REST){
		eat=0;
		reset_timer(3);
		reset_timer(2);
	}else{
		Play_Note(eatvett[eat]);
		f=(int)(eattime[eat]*25000000*timenote);
		init_timer(3,f,0);
		reset_timer(3);
		enable_timer(3);
		eat++;
	}
}

void Death_Music(void){
	float timenote=1;
	int f;
	if(deathvett[death]==REST){
		death=0;
		reset_timer(3);
		reset_timer(2);
	}else{
		Play_Note(deathvett[death]);
		f=(int)(deathtime[death]*25000000*timenote);
		init_timer(3,f,0);
		reset_timer(3);
		enable_timer(3);
		death++;
	}
	
}

void Cuddles_Music(void){
	float timenote=2.0;
	int f;
	if(cuddlesvett[cuddles]==REST){
		cuddles=0;
		reset_timer(3);
		reset_timer(2);
	}else{
		Play_Note(cuddlesvett[cuddles]);
		f=(int)(cuddlestime[cuddles]*25000000*timenote);
		init_timer(3,f,0);
		reset_timer(3);
		enable_timer(3);
		cuddles++;
	}
}
void Play_Note(int note){
	init_timer(2,25000000/(45*note),0);
	reset_timer(2);
	enable_timer(2);
}

#include <FastLED.h>
// How many leds are in the strip
#define NUM_LEDS 49

#define DATA_PIN_V 12
#define DATA_PIN_H 30
#define COLOR_ORDER GRB

uint8_t btnValue = 0;
uint8_t selectedAnim = 0;
uint8_t currentFrame = 0;

//GENERATED CODE HERE?



// This is an array of leds.  One item for each led in your strip.
CRGB leds_h[NUM_LEDS];
CRGB leds_v[NUM_LEDS];
// This function sets up the ledsand tells the controller about them
void setup() {
  delay(500);
  
  //Configure PD7..4 as inputs
  DDRD &= B00001111;
  
  //Configure PC7 as output
  pinMode(LED_BUILTIN, OUTPUT);
  //Pull PC7 low (led on)
  digitalWrite(LED_BUILTIN, LOW);
  
  // sanity check delay - allows reprogramming if accidently blowing power w/leds
  delay(1000);
  
  //Pull PC7 HIGH (led Off)
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  //Wait for button input
  //while((PORTD >> 4) >= B00001111) {}
  
  //Pull PC7 low (led on)
  digitalWrite(LED_BUILTIN, LOW);
  FastLED.addLeds<WS2812B, DATA_PIN_H, RGB>(leds_h, NUM_LEDS);
  FastLED.addLeds<WS2812B, DATA_PIN_V, RGB>(leds_v, NUM_LEDS);
}

void loop() {
  /*
  //Redo this part using PORTB to save frames maybe
  if (digitalRead(PB7 == LOW)) {
    selectedAnim = 0;
  } else if (digitalRead(PB6 == LOW)) {
    selectedAnim = 1;
  } else if (digitalRead(PB5 == LOW)) {
    selectedAnim = 2;
  } else if (digitalRead(PB4 == LOW)) {
    selectedAnim = 3;
  }*/
  
  if(currentFrame >= animFrames[selectedAnim]) {
    currentFrame = 0;
  }

  for(int i = 0; i < NUM_LEDS*2; i++) {
    if(i < NUM_LEDS) {
      switch(selectedAnim) {
        case 0:
          leds_h[i] = pgm_read_dword(&(anim0[currentFrame][i]));
          break;
        case 1:
          leds_h[i] = pgm_read_dword(&(anim1[currentFrame][i]));
          break;
        case 2:
          leds_h[i] = pgm_read_dword(&(anim2[currentFrame][i]));
          break;
        case 3:
          leds_h[i] = pgm_read_dword(&(anim3[currentFrame][i]));
          break;
      }
    } else {
      switch(selectedAnim) {
        case 0:
          leds_v[i-NUM_LEDS] = pgm_read_dword(&(anim0[currentFrame][i]));
          break;
        case 1:
          leds_v[i-NUM_LEDS] = pgm_read_dword(&(anim1[currentFrame][i]));
          break;
        case 2:
          leds_v[i-NUM_LEDS] = pgm_read_dword(&(anim2[currentFrame][i]));
          break;
        case 3:
          leds_v[i-NUM_LEDS] = pgm_read_dword(&(anim3[currentFrame][i]));
          break;
      }
    }
  }
  if(++currentFrame >= animFrames[selectedAnim]) {
    currentFrame = 0;
  }
  FastLED.show();
  delay((int)(1000/animFPS[selectedAnim]));
}
#include <FastLED.h>
#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
// How many leds are in the strip
#define NUM_LEDS 49

#define DATA_PIN_H 5
#define DATA_PIN_V 6
#define BRIGHTNESS  63
#define COLOR_ORDER GRB
#define NO_RF 0
#define RF_ONLY 1
#define RF_BTN 2
#define TRANSMIT_RF 3
RF24 radio(7, 8); // CE, CSN

const int btnInPin = A0;
const byte address[6] = "00001"; 
int btnValue = 0;
int selectedAnim = 0;
int currentFrame = 0;

int radioBrillzMode = 0;

//GENERATED CODE HERE?



// This is an array of leds.  One item for each led in your strip.
CRGB leds_h[NUM_LEDS];
CRGB leds_v[NUM_LEDS];
// This function sets up the ledsand tells the controller about them
void setup() {
  pinMode(10, OUTPUT);
  digitalWrite(10, HIGH);
  // sanity check delay - allows reprogramming if accidently blowing power w/leds
  delay(1000);
  digitalWrite(10, LOW);
  while(true) {
    btnValue = analogRead(btnInPin);
    if (btnValue > 100 && btnValue < 300) {
      radioBrillzMode = RF_BTN; //Up = Recieve RF and switch
      digitalWrite(10, LOW);
      break;
    } else if (btnValue > 300 && btnValue < 500) {
      radioBrillzMode = NO_RF; //Down = No RF
      digitalWrite(10, HIGH);
      break;
    } else if (btnValue > 500 && btnValue < 700) {
      radioBrillzMode = RF_ONLY; //Left = Recieve RF no switch
      analogWrite(10, 127);
      break;
    } else if (btnValue > 700) {
      radioBrillzMode = TRANSMIT_RF; //Right = Transmit RF
      analogWrite(10, 127);
      break;
    }
  }
  delay(500);
  if(radioBrillzMode > NO_RF) {
    radio.begin();
    if(radioBrillzMode == TRANSMIT_RF) {
        radio.openWritingPipe(address);
        radio.setPALevel(RF24_PA_MIN);
        radio.stopListening();
    } else {
      radio.openReadingPipe(0, address);
      radio.setPALevel(RF24_PA_MIN);
      radio.startListening();
    }
  }

  FastLED.addLeds<WS2812B, DATA_PIN_H, RGB>(leds_h, NUM_LEDS);
  FastLED.addLeds<WS2812B, DATA_PIN_V, RGB>(leds_v, NUM_LEDS);
}

// This function runs over and over, and is where you do the magic to light
// your leds.
void loop() {
  
  if(radioBrillzMode != RF_ONLY) {
    btnValue = analogRead(btnInPin);
  } else {
    btnValue = 0;
  }
  if (btnValue > 100) {
    currentFrame = 0;
    if (btnValue > 150 && btnValue < 220) {
      selectedAnim = 0;
    } else if (btnValue > 300 && btnValue < 500) {
      selectedAnim = 1;
    } else if (btnValue > 550 && btnValue < 680) {
      selectedAnim = 2;
    } else if (btnValue > 700) {
      selectedAnim = 3;
    }
    if(radioBrillzMode == TRANSMIT_RF) {
      int text[32];
      text[0] = selectedAnim;
      radio.write(&text, sizeof(text));
    }
  }
  if(radioBrillzMode == RF_ONLY || radioBrillzMode == RF_BTN) {
    if (radio.available()) {
      int msg[32] = {};
      radio.read(&msg, sizeof(msg));
      if(msg[0] >= 0 && msg[0] < 4) {
        selectedAnim = msg[0];
        currentFrame = 0;
      }
    }
  }

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
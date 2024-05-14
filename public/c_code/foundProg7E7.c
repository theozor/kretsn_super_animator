#include <esp_now.h>
#include <WiFi.h>
#include <FastLED.h>

///////SETUP FÖR KONTROLLER//////////
//håll koll på egen mac, skicka inte signal till sig själv
uint8_t myMac[] = {0x00,0x00,0x00,0x00,0x00,0x00}; 

bool isMaster = false; //Endast en kontroll ska ha denna som true annars knasar det.
//Side note: WiFi protokollet kan göra 2way-com., Denna kod är inte designad för det.

//Ange MACs (Ladda över koden på din ESP och kör, ESPn skriver ut MAC-adressen i "Serial Monitor" (öppna via ikonen högst upp till höger))
uint8_t macs[8][6] = {
  
  {0x40,0x22,0xD8,0x08,0x4B,0x50}, //kassör
  {0x78,0xE3,0x6D,0x1A,0x74,0xCC}, //Företag
  {0x40,0x22,0xD8,0x07,0x90,0xB0}, //General
  {0x40,0x22,0xD8,0x08,0x42,0x80}, //Sittning
  {0x40,0x22,0xD8,0x08,0x47,0xEC}, //Aktivitet
  {0x40,0x22,0xD8,0x08,0x45,0x84}, //Fadder
  {0x40,0x22,0xD8,0x07,0x97,0xE4}, //Maskot
  {0x40,0x22,0xD8,0x07,0x9A,0x54}  //Webb
};


//Ange pins för knappar
#define key1 13 //Anim 1-4 för varje meny
#define key2 27
#define key3 32
#define key4 19
#define keyMaster 33 //Master knappen
#define keyMenu 26 //Meny knappen

//Brillz relaterade konstanter
#define NUM_LEDS 49 //leds per öga
#define DATA_RIGHT 12
#define DATA_LEFT 14
#define COLOR_ORDER GRB

//Menyfärger följer en enkel minnesregel, R-G-B, Meny 1 = röd, Meny 2 = grön, Meny 3 = blå, WIFI = gul (endast master)
const PROGMEM unsigned int menuColors[4]{0x000100,0x010000,0x000001,0x010200};


//Struct för animationerna, gör allt lite mer lättläst
struct animData{
  int fps;
  int frames;
  bool loop;
};


//FPS, FRAMES, LOOP?


//========Allt under detta bör ej ändras==========

animData localData[] = {data0,data1,data2,data3,data4,data5,data6,data7,data8,data9,data10,data11};
animData syncData[] = {syncData0,syncData1,syncData2,syncData3};

//spara vald animation
int selectedAnim;
bool selectedLoop;
int selectedFrames;
int selectedFps;

CRGB leds_r[NUM_LEDS];
CRGB leds_l[NUM_LEDS+1]; //kompensering för indikator

  typedef struct brillz{
    int prog;
    int lock; //Används inte längre men det är kvar ändå
  }brillz_struct;

  brillz_struct brillz;
  esp_now_peer_info_t peerInfo;

  //Lokala variabler
  bool lock;
  byte menu; //Lokal meny för lokala animationer
  brillz_struct myData;
  int currentFrame = 0; //startvärde
  int currentAnim = 0; //default

  bool wifiTrigger = false; //Kolla om knappen för wifi send [MasteKey] är aktiv.

  void OnDataSent(const uint8_t*mac_addr, esp_now_send_status_t status)
  {
    //Kolla upp Randomnerdtutorials ESP_NOW om du är intresserad.
    //Jag har legit ingen aning om hur denna fungerar exakt. it just works.
    char macStr[18];
    Serial.println("Packed to: ");
    //copy sender mac add. to string
    snprintf(macStr, sizeof(macStr),"%02x:%02x:%02x:%02x:%02x:%02x",
      mac_addr[0],mac_addr[1],mac_addr[2],mac_addr[3],mac_addr[4],mac_addr[5]);
    Serial.println(macStr);
    Serial.println(" Send status:\t");
    Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery succesful" : "Delivery Fail");
  }

  void OnDataRecived(const uint8_t * mac, const uint8_t *incomingData, int len)
  {
    memcpy(&myData, incomingData, sizeof(myData));
    Serial.print("Data recived: ");
    Serial.println(myData.prog);
    selectedAnim = myData.prog;
    Serial.print("SET WIFI DATA TO: ");
    Serial.println(selectedAnim);
    lock = true;
    if(selectedAnim == 0) //Master har en killswitch som avbryter animationen ifall det blir fel
    {
      lock = false;
    }
  }

  void SendData(int p)
  {
    brillz.prog = p;
    brillz.lock = 1; 
     esp_err_t result;
     //Det ska gå att skicka till mac = NULL för att skicka till alla men det knasar av någon anledning
    result = esp_now_send(macs[0], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[1], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[2], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[3], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[4], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[5], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[6], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
      result = esp_now_send(macs[7], (uint8_t *) &brillz, sizeof(brillz_struct));
    if(result == ESP_OK)
    {
      Serial.println("Master --> Data sent succesfully");
    }
  }

void setup() {

  pinMode(key1, INPUT);
  pinMode(key2, INPUT);
  pinMode(key3, INPUT);
  pinMode(key4, INPUT);
  pinMode(keyMaster, INPUT);
  pinMode(keyMenu, INPUT);

  delay(500);

  FastLED.addLeds<WS2812B, DATA_RIGHT, RGB>(leds_r, NUM_LEDS);
  FastLED.addLeds<WS2812B, DATA_LEFT, RGB>(leds_l, NUM_LEDS+1);

  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  
  Serial.println('Online');
  Serial.println("---MAC ADDRESS---");
  Serial.println(WiFi.macAddress());
  Serial.println("-----------------");

  if(isMaster) //registrera kontroller hos master.
  {
    if(esp_now_init() != ESP_OK)
    {
      Serial.println("ERROR: ESP_NOW init failed.");
      return;
    }

    //Körs varje gång data skickas
    esp_now_register_send_cb(OnDataSent);
    peerInfo.channel = 0;
    peerInfo.encrypt = false; //säkerhet är för töntar


    //registrera MACs
    for(int i = 0; i<8; i++)
    {
      if(macs[i] != myMac)//Lägg inte till egen ESP som en mottagare
      {
        memcpy(peerInfo.peer_addr, macs[i], 6);
        if(esp_now_add_peer(&peerInfo) != ESP_OK)
        {
          Serial.println('ERROR: Failed to register remote #');
          Serial.println(i);
        }
        else
        {
          Serial.println("Mac set");
        }
      }

      for(int j = 0; j <6; j++)
      {
        Serial.println(macs[i][j]);
      }
    }

  }
  else
  {
    if(esp_now_init() != ESP_OK)
    {
      Serial.println("ERROR: ESP_NOW init failed.");
      return;
    }
    esp_now_register_recv_cb(OnDataRecived);
  }

}

//Liten delay, används efter knapptryck. minskar spam signaler lite
int waitTime = 10;

void loop() {

  if(isMaster)
  {
    if(digitalRead(keyMaster) == HIGH)
    {
      wifiTrigger = !wifiTrigger;
      Serial.println("Wifi Status:");
      Serial.println(wifiTrigger);
      delay(500);
    }

  }
  else
  {
    wifiTrigger = false; //Endast master kan skicka wifi signaler, håll alltid som false för alla andra
  }

  if(digitalRead(keyMenu) == HIGH)
  {
    if(!lock)
    {
      Serial.println("LOOP:");
      Serial.println(selectedLoop);
      Serial.println("FRAMES:");
      Serial.println(selectedFrames);
      wifiTrigger = false; //Wifi har bara en meny, stäng av om man försöker ändra
      if(menu<2 && menu >= 0)
      {
        menu++;
      }
      else
      {
        menu = 0;
      }
      Serial.println("MENU");
      Serial.println(menu);
      delay(500);
    }
    if(lock && isMaster)
    {
      Serial.println("KILLSWITCH");
      selectedAnim = 0;
      SendData(selectedAnim);
      lock = false;
    }
  }

//Hantera animationsval & menyer

  if(!wifiTrigger && !lock)
  { //Gör dehär om wifi är avstängt
    if(digitalRead(key1) == HIGH)
    {
      Serial.println("Key 1 pressed, anim set to");
        switch(menu){
          case 0:
          selectedAnim = 0;
          break;
          case 1:
          selectedAnim = 4;
          break;
          case 2:
          selectedAnim = 8;
        }
         Serial.println(selectedAnim);
         delay(waitTime);
    }
    if(digitalRead(key2) == HIGH)
    {
    Serial.println("Key 2 pressed, anim set to");
        switch(menu){
          case 0:
          selectedAnim = 1;
          break;
          case 1:
          selectedAnim = 5;
          break;
          case 2:
          selectedAnim = 9;
        }
         Serial.println(selectedAnim);
         delay(waitTime);
    }
    if(digitalRead(key3) == HIGH)
    {
    Serial.println("Key 3 pressed, anim set to");
        switch(menu){
          case 0:
          selectedAnim = 2;
          break;
          case 1:
          selectedAnim = 6;
          break;
          case 2:
          selectedAnim = 10;
        }
         Serial.println(selectedAnim);
         delay(waitTime);
    }
    if(digitalRead(key4) == HIGH)
    {
    Serial.println("Key 4 pressed, anim set to");
        switch(menu){
          case 0:
          selectedAnim = 3;
          break;
          case 1:
          selectedAnim = 7;
          break;
          case 2:
          selectedAnim = 11;
        }
         Serial.println(selectedAnim);
         delay(waitTime);
    }
  }
  else if(!lock)
  { //Gör dehär om wifi är aktiverat
    if(digitalRead(key1) == HIGH)
    {
    Serial.println("WIFI: Key 1 pressed, anim set to");
      selectedAnim = -4;
      SendData(selectedAnim);
       Serial.println(selectedAnim);
       lock = true;
       delay(waitTime);
    }
    if(digitalRead(key2) == HIGH)
    {
    Serial.println("WIFI: Key 2 pressed, anim set to");
      selectedAnim = -3;
      SendData(selectedAnim);
       Serial.println(selectedAnim);
       lock = true;
       delay(waitTime);
    }
    if(digitalRead(key3) == HIGH)
    {
    Serial.println("WIFI: Key 3 pressed, anim set to");
      selectedAnim = -2;
      SendData(selectedAnim);
       Serial.println(selectedAnim);
       lock = true;
       delay(waitTime);
    }
    if(digitalRead(key4) == HIGH)
    {
    Serial.println("WIFI: Key 4 pressed, anim set to");
      selectedAnim = -1;
      SendData(selectedAnim);
       Serial.println(selectedAnim);
       lock = true;
       delay(waitTime);
    }
  }

  //ANIMATIONSKOD

  if(selectedAnim >= 0) //lokala animationer har positiva värden
  {
    selectedLoop = localData[selectedAnim].loop;
    selectedFrames = localData[selectedAnim].frames;
    selectedFps = localData[selectedAnim].fps;

    if(currentFrame >= localData[selectedAnim].frames)
  {
      currentFrame = 0;
    }
  }
  else
  {
    //Globala (sync animationer) har negativa värden
    selectedLoop = syncData[selectedAnim+4].loop; //"id" -4 till -1, justera för att få index 0 till 3 istället.
    selectedFrames = syncData[selectedAnim+4].frames;
    selectedFps = syncData[selectedAnim+4].fps;
    if(currentFrame >= syncData[selectedAnim+4].frames)
    {
      currentFrame = 0;
    }
  }



  for(int i = 0; i <NUM_LEDS*2+1; i++)
  {
    if(i < NUM_LEDS)
    {
      switch(selectedAnim)
      {
        case -4:
          leds_r[i] = pgm_read_dword(&(syncAnim0[currentFrame][i]));
        break;
        case -3:
          leds_r[i] = pgm_read_dword(&(syncAnim1[currentFrame][i]));
        break;
        case -2:
          leds_r[i] = pgm_read_dword(&(syncAnim2[currentFrame][i]));
        break;
        case -1:
          leds_r[i] = pgm_read_dword(&(syncAnim3[currentFrame][i]));
        break;
        case 0:
          leds_r[i] = pgm_read_dword(&(anim0[currentFrame][i]));
        break;
        case 1:
          leds_r[i] = pgm_read_dword(&(anim1[currentFrame][i]));
        break;
        case 2:
          leds_r[i] = pgm_read_dword(&(anim2[currentFrame][i]));
        break;
        case 3:
          leds_r[i] = pgm_read_dword(&(anim3[currentFrame][i]));
        break;
        case 4:
          leds_r[i] = pgm_read_dword(&(anim4[currentFrame][i]));
        break;
        case 5:
          leds_r[i] = pgm_read_dword(&(anim5[currentFrame][i]));
        break;
        case 6:
          leds_r[i] = pgm_read_dword(&(anim6[currentFrame][i]));
        break;
        case 7:
          leds_r[i] = pgm_read_dword(&(anim7[currentFrame][i]));
        break;
        case 8:
          leds_r[i] = pgm_read_dword(&(anim8[currentFrame][i]));
        break;
        case 9:
          leds_r[i] = pgm_read_dword(&(anim9[currentFrame][i]));
        break;
        case 10:
          leds_r[i] = pgm_read_dword(&(anim10[currentFrame][i]));
        break;
        case 11:
          leds_r[i] = pgm_read_dword(&(anim11[currentFrame][i]));
        break;
      }
    }
    else
    {
       switch(selectedAnim)
      {
        case -4:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(syncAnim0[currentFrame][i]));
        break;
        case -3:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(syncAnim1[currentFrame][i]));
        break;
        case -2:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(syncAnim2[currentFrame][i]));
        break;
        case -1:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(syncAnim3[currentFrame][i]));
        break;
        case 0:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim0[currentFrame][i]));
        break;
        case 1:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim1[currentFrame][i]));
        break;
        case 2:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim2[currentFrame][i]));
        break;
        case 3:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim3[currentFrame][i]));
        break;
        case 4:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim4[currentFrame][i]));
        break;
        case 5:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim5[currentFrame][i]));
        break;
        case 6:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim6[currentFrame][i]));
        break;
        case 7:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim7[currentFrame][i]));
        break;
        case 8:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim8[currentFrame][i]));
        break;
        case 9:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim9[currentFrame][i]));
        break;
        case 10:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim10[currentFrame][i]));
        break;
        case 11:
          leds_l[i-NUM_LEDS] = pgm_read_dword(&(anim11[currentFrame][i]));
        break;
      }
    }

  }
  //Indikator bravader, hanteras separat från resterande leds
  if(!wifiTrigger)
  {
    leds_l[NUM_LEDS] = pgm_read_dword(&(menuColors[menu]));
  }
  else
  {
    leds_l[NUM_LEDS] = pgm_read_dword(&(menuColors[3]));
  }
  
  //Frame hanterare
  if(++currentFrame >= selectedFrames)
  {
    currentFrame = 0;
    lock = false;
    if(!selectedLoop)
    {
    Serial.println("One time animation, returning to anim0...");
      selectedAnim = 0;
    }
  }

  FastLED.show();
  delay((int)(1000/selectedFps)); //styr FPS

}


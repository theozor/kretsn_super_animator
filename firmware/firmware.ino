#include "FS.h"
#include "SPIFFS.h"
#include <esp_now.h>
#include <WiFi.h>
#include <FastLED.h>



#define GENERATION 0x7E8
#define NUM_LEDS 98



/* You only need to format SPIFFS the first time you run a
   test or else use the SPIFFS plugin to create a partition
   https://github.com/me-no-dev/arduino-esp32fs-plugin */
#define FORMAT_SPIFFS_IF_FAILED true

byte myMac[6];
bool isMaster = false; //Endast en kontroll ska ha denna som true annars knasar det.
//Side note: WiFi protokollet kan göra 2way-com., Denna kod är inte designad för det.


#include "generations.h"

//Ange MACs (Ladda över koden på din ESP och kör, ESPn skriver ut MAC-adressen i "Serial Monitor" (öppna via ikonen högst upp till höger))
uint8_t macs[8][6] = MACS;

//Menyfärger följer en enkel minnesregel, R-G-B, Meny 1 = röd, Meny 2 = grön, Meny 3 = blå, WIFI = gul (endast master)
const PROGMEM unsigned int menuColors[4]{0x000100,0x010000,0x000001,0x010200};

const int keyMap[]{key1, key2, key3, key4};

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
int selectedAnim = -1;
int timeLastUpdate = 0;
int previousAnimation = 0;

bool wifiTrigger = false; //Kolla om knappen för wifi send [MasteKey] är aktiv.

void OnDataSent(const uint8_t*mac_addr, esp_now_send_status_t status)
{
  //Kolla upp Randomnerdtutorials ESP_NOW om du är intresserad.
  //Jag har legit ingen aning om hur denna fungerar exakt. it just works. //Anton
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
  changeAnimation(myData.prog);
  Serial.print("SET WIFI DATA TO: ");
  Serial.println(selectedAnim);
  lock = true;
  if(myData.prog == 0) //Master har en killswitch som avbryter animationen ifall det blir fel
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

uint32_t * loadedAnimation = NULL;
uint32_t animationLength;


bool readFile(fs::FS &fs, const char * path){
    Serial.printf("Reading file: %s\r\n", path);

    File file = fs.open(path);
    if(!file || file.isDirectory()){
        Serial.println("- failed to open file for reading");
        return false;
    }

    Serial.println("- read from file:");
    while(file.available()){
        Serial.write(file.read());
    }
    file.close();
    return true;
}

bool writeFile(fs::FS &fs, const char * path, const char * message){
    Serial.printf("Writing file: %s\r\n", path);

    File file = fs.open(path, FILE_WRITE);
    if(!file){
        Serial.println("- failed to open file for writing");
        return false;
    }
    if(file.print(message)){
        Serial.println("- file written");
        file.close();
        return true;
    } else {
        Serial.println("- write failed");
        file.close();
        return true;
    }
    
}
uint32_t numInts;
uint8_t byteBuffer[sizeof(uint32_t)]; 
bool loadFileToFrameBuffer(fs::FS &fs, const char * path){
    //Serial.printf("Reading file: %s\r\n", path);
    File file = fs.open(path);
    if(!file || file.isDirectory()){
        //Serial.println("- failed to open file for reading");
        return false;
    }
    free(loadedAnimation);
    size_t filesize = file.size();
    numInts = filesize/3;
    
    animationLength = (numInts)/(NUM_LEDS + 1);
    loadedAnimation = (uint32_t*) malloc(numInts * sizeof(uint32_t));
    
    for(uint32_t i = 0; i < numInts; i++) {
      loadedAnimation[i] = 0;
      for(uint32_t o = 0; o < 3; o++) {
        uint32_t fileIn = file.read() << (o * 8);
        loadedAnimation[i] |= fileIn;
      }
    }
    file.close();
    return true;
}
bool readAnimationFile(fs::FS &fs, const char * path){
    Serial.printf("Reading file: %s\r\n", path);

    File file = fs.open(path);
    if(!file || file.isDirectory()){
        Serial.println("- failed to open file for reading");
        return false;
    }
    Serial.print("\nFilesize :");
    Serial.println(file.size());


    Serial.println("- read from file:");
    
    while(file.available()){
        Serial.print(file.read());
    }
    file.close();
    return true;
}
bool writeAnimationFile(fs::FS &fs, const char * path, const uint32_t * message){
    //Serial.printf("Writing file: %s\r\n", path);

    File file = fs.open(path, FILE_WRITE);
    if(!file){
        //Serial.println("- failed to open file for writing");
        return false;
    }
    for(uint32_t i = 0; i < (NUM_LEDS + 1)*animationLength; i++) {
      for(uint32_t o = 0; o < 3; o++) {
        byteBuffer[o] = (loadedAnimation[i] & (0xFF << (o*8))) >> (o*8);
        //Serial.print((loadedAnimation[i] & (0xFF << (o*8))) >> (o*8));
      }
      if(!file.write(byteBuffer, 3)) {
        //Serial.println(" - Write failed!!!");
        file.close();
        return false;
      }
    }
    //Serial.println(" - file written!!");
    file.close();
    return true;
}

void changeAnimation(int index) {
  String filePath = "/a";
  filePath.concat(index);
  filePath.concat(".anim");
  if(loadFileToFrameBuffer(SPIFFS, filePath.c_str())) {
    previousAnimation = selectedAnim;
    selectedAnim = index;
    currentFrame = 0;
    timeLastUpdate = 0;
  } else {
    currentFrame = 0;
    timeLastUpdate = 0;
  }
}

int getPreviousDelayFromBuffer() {
  int checkFrame = currentFrame - 1;
  if(checkFrame < 0) {
    checkFrame = animationLength - 1;
  }
  return loadedAnimation[(checkFrame+1)*(NUM_LEDS+1) - 1];
}


void setup(){
    Serial.begin(115200);
    if(!SPIFFS.begin(FORMAT_SPIFFS_IF_FAILED)){
        Serial.println("SPIFFS Mount Failed");
        return;
    } 
    pinMode(key1, INPUT);
    pinMode(key2, INPUT);
    pinMode(key3, INPUT);
    pinMode(key4, INPUT);
    pinMode(keyMaster, INPUT);
    pinMode(keyMenu, INPUT);

    delay(500);
    FastLED.addLeds<WS2812B, DATA_RIGHT, COLOR_ORDER>(leds_r, NUM_LEDS);
    FastLED.addLeds<WS2812B, DATA_LEFT, COLOR_ORDER>(leds_l, NUM_LEDS);
    if(digitalRead(keyMaster) == HIGH)
    {
      isMaster = true;
    }
    WiFi.mode(WIFI_STA);

    Serial.println("Online");
    Serial.println("---MAC ADDRESS---");
    Serial.println(WiFi.macAddress());
    Serial.println("-----------------");
    WiFi.macAddress(myMac);
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
      bool isMe = true;
      for(int mi = 0; mi < 6; mi++) {
        if(macs[i][mi] != myMac[mi]) {
          isMe = false;
          break;
        }
      }
      if(isMe) {
        Serial.println("Skipped self");
        continue;
      }

      memcpy(peerInfo.peer_addr, macs[i], 6);
      if(esp_now_add_peer(&peerInfo) != ESP_OK)
      {
        Serial.println("ERROR: Failed to register remote #");
        Serial.println(i);
      }
      else
      {
        Serial.println("Mac set");
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
  changeAnimation(0);
}

//Liten delay, används efter knapptryck. minskar spam signaler lite
int waitTime = 10;
void loop(){
  if(Serial.available()) {
    int in = Serial.read();
    if(in == 'w') {
      free(loadedAnimation);
      //Serial.println("Writing to flash");
      while(!Serial.available()) {}
      char animationNumber = Serial.read();
      loadedAnimation = NULL;
      //Serial.println("Storage has been freed!");
      while(!Serial.available()) {}
      animationLength = Serial.readStringUntil(',').toInt();
      loadedAnimation = (uint32_t*) malloc((NUM_LEDS + 1) * animationLength * sizeof(uint32_t));
      if(loadedAnimation == NULL) {
        //Serial.println("realloc() Failed!");
        return;
      }
      //Serial.print("\nSize:");
      //Serial.println(sizeof(loadedAnimation)/sizeof(loadedAnimation[0]));
      for(uint32_t i = 0; i < (NUM_LEDS + 1)*animationLength; i++) {
        while(!Serial.available()) {}
        loadedAnimation[i] = Serial.readStringUntil(',').toInt();
      }
      String filePath = "/a";
      filePath.concat(animationNumber);
      filePath.concat(".anim");
      
      writeAnimationFile(SPIFFS, filePath.c_str(), loadedAnimation);
    } else if(in == 'r') {
      Serial.print("STRT");
      Serial.print(animationLength);
      Serial.print(',');
      for(uint32_t i = 0; i < numInts; i++) {
        Serial.print(loadedAnimation[i]);
        Serial.print(',');
      }
      Serial.print('$');
    } else if(in == 'c') {
      while(!Serial.available()) {}
      int animationNumber = Serial.readStringUntil(',').toInt();
      changeAnimation(animationNumber);
      //Serial.print("\nAnimation changed to: ");
      //Serial.println(selectedAnim);

    } else if(in == 'f') {
      SPIFFS.format();
    } else if(in == 'd') {
      //Get statistics
      Serial.print("Total bytes");
      Serial.println(SPIFFS.totalBytes());
      Serial.print("Used bytes");
      Serial.println(SPIFFS.usedBytes());
    }
  }


  
  /*
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
      //Serial.println("LOOP:");
      //Serial.println(selectedLoop);
      //Serial.println("FRAMES:");
      //Serial.println(selectedFrames);
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
      changeAnimation(0);
      SendData(0);
      lock = false;
    }
  }

  //Hantera animationsval & menyer

  if(!wifiTrigger && !lock)
  { //Gör dehär om wifi är avstängt
    for(int i = 0; i < 4; i++) {
        if(digitalRead(keyMap[i])) {
            changeAnimation(menu*4 + i);
            Serial.println("Key pressed, anim set to");
            Serial.println(selectedAnim);
            delay(waitTime);
        }
    }
  }
  else if(!lock)
  { //Gör dehär om wifi är aktiverat
    for(int i = 0; i < 4; i++) {
        if(digitalRead(keyMap[i])) {
            Serial.println("WIFI: Key pressed, anim set to");
            changeAnimation(menu*4 + i);
            SendData(selectedAnim);
            Serial.println(selectedAnim);
            lock = true;
            delay(waitTime);
        }
    }
  }
  */

  if(selectedAnim != -1) {
    if(millis() - timeLastUpdate >= getPreviousDelayFromBuffer()) {
      
      for(uint32_t i = 0; i < NUM_LEDS/2; i++) {
        leds_r[i] = loadedAnimation[i + currentFrame * (NUM_LEDS + 1)];
        leds_l[i] = loadedAnimation[(i + NUM_LEDS/2) + currentFrame * (NUM_LEDS + 1)];
      }
      //Indikator bravader, hanteras separat från resterande leds
      if(!wifiTrigger)
      {
        leds_l[NUM_LEDS] = menuColors[menu];
      }
      else
      {
        leds_l[NUM_LEDS] = menuColors[3];
      }
      
      if(++currentFrame >= animationLength)
      {
        currentFrame = 0;
        lock = false;
        /*
        if(!selectedLoop)
        {
          Serial.println("One time animation, returning to anim0...");
          changeAnimation(previousAnimation);
        }
        */
        
      }
      //FastLED.show();
      timeLastUpdate = millis();
    }
  }
  
}

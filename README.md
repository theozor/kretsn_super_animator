# Kretsn Super Animator
**En React sida för att animera Kretsn_Brillz**
## Om
Kretsn Super Animator är skapat för att fungera på alla plattformar. Utveckling har skett med Progressive Web Apps i åtanke vilket möjiggör full funktionalitet offline och även möjlighet att installera appen lokalt. Applikationen använder **Web Serial API** för seriell dataöverföring vilket hittils stöds på **Chrome 89** och motsvarande Chromium-webbläsare.
### Funktioner
- [x] Animering av upp till 16 animationer direkt på webben
- [x] Nedladdning av kod för äldre generationer
- [x] Överföring av animeringar till ESP32-baserade brillz direkt från applikationen
### TODO
- [ ] Möjliggöra för användare att sätta egna konstanter så som Master, MAC-Addresser etc
- [ ] Undo/Redo
- [ ] Implementera visning av animation i realtid
- [ ] Uppladning av animationer över luften
- [ ] Animeringsverktyg så som Spegling/Symmetri, förflyttning, pipettverktyg m.m
- [ ] Stöd för telefoner och surfplattor
## Installation
> [!IMPORTANT]
> Applikationen kan öppnas i alla webbläsare med begränsad funktionalitet. 
> För att ladda upp animationer på Kretsn_Brillz krävs **Chrome 89** eller Chromium-baserad webbläsare med samma stöd.
> Se [caniuse.com](https://caniuse.com/web-serial)

För att installera appen lokalt finns en knapp i webbläsaren (oftast itll höger om address-fältet). På mobila enheter kommer ibland en Pop-up. Notera att appen ännu inte är utvecklad för mobilt stöd.

### Förutsättningar
1. Se till att Arduino IDE är installerat
2. Se till att ESP32-baserade kort är installerade i Arduino IDE
3. Se till att rätt bibliotek är installerade.
   - Om koden inte kompileras beror det antagligen på att något bibliotek inte är installerat.
### Programvara för Kretsn_Brillz
1. Ladda ner arduino-projektet från [Releases](https://github.com/theozor/kretsn_super_animator/releases/tag/v0.1).
2. Öppna `main.ino` med Arduino IDE.
3. Välj board utefter den du vill ha. Oftast Wemos Lolin32 Lite.
4. Ändra `define GENERATIONS 0x7E8` till din generation.
5. Ladda upp programmet och vänta på att det slutförs.
6. Nu kan du börja använda ***Kretsn Super Animator***!
7. ???
8. Profit!

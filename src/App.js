/* eslint-disable react-hooks/exhaustive-deps */
/**
 * TODO features:
 * Undo/Redo
 * Live display
 * OTA för ESP32
 * Mirror/Symmetry Mode
 * Pilar för animation
 * Prompt för verktyg där data går förlorad.
 * RGB/HSV -> HSL
 * Mobile support
 * Pipette
 */



import { AppBar, Box, Button, Container, FormControl, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, ListSubheader, MenuItem, Paper, Select, Slider, Stack, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/system';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import DataObjectIcon from '@mui/icons-material/DataObject';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import BoltIcon from '@mui/icons-material/Bolt';
import MemoryIcon from '@mui/icons-material/Memory';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import './App.css';
import { useState, useEffect, useRef } from 'react';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
//import { BrillzIcon } from './BrillzIcon';
import CustomColorPicker from './CustomColorPicker';
import * as helper from './helper'
import generations from './generations';
import getKnownDevice from './knownDevices';


var selectedAnim2 = 0;
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});


//download(jsonData, 'json.txt', 'text/plain');



var canvas = null;
var ctx = null;
var squareSize = 32;
var eyeWidth = 4;
var squareGridLineWidth = 4;
var ledData = [];
for(let i = 0; i < 16; i++) {
  ledData[i] = [{grid: [], time: 16}];
  for(let o = 0; o < 162; o++) {
    ledData[i][0]['grid'][o] = "#000000";
  }
  ledData[i][0]['grid'][24] = "#FF0000";
  ledData[i][0]['grid'][73] = "#FF0000";
}
function App() {
  const [memoryAvailable, setMemoryAvailable] = useState(generations[3].memory);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [powerConsumtion, setPowerConsumtion] = useState(0.024);
  const [selectedGeneration, setSelectedGeneration] = useState(3);
  const [selectedPort, setSelectedPort] = useState('');
  const [selectedColors, setSelectedColors] = useState({primary: "#ff0000", secondary: "#000000"});
  const [previewColors, setPreviewColors] = useState({primary: "#ff0000", secondary: "#000000"});
  const [animationName, setAnimationName] = useState("");
  const [currentFrameTime, setCurrentFrameTimeFE] = useState(16);
  const [selectedFrame, setSelectedFrame] = useState(0);
  const [selectedAnimation, setSelectedAnimation] = useState(0);
  const [numFrames, setNumFrames] = useState(1);
  // eslint-disable-next-line
  const [isLoading, setIsLoading] = useState(false);
  const [isWebAPIFound, setIsWebAPIFound] = useState(false);
  const [comPorts, setComPorts] = useState([]);
  const [comPortsSelectOpen, setComPortsSelectOpen] = useState(false);
  const [isSliderDragging, setIsSliderDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  
  

  const FastLinearProgress = styled(LinearProgress)(({ theme }) => ({
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: powerConsumtion > 2 ? "red" : "green",
    },
    [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: "blue",
      transition: "transform .4s linear;"
    },
  }));
  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        //e.preventDefault();
        e.returnValue = "";
        //daemon.closeSerialMonitor(selectedPort);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [hasUnsavedChanges]);
  

  

  var reading = false;
  var messageBuffer = "";
  function handleMonitorMessage(message) {
    if(message.indexOf('d') > -1) {
      reading = false;
      messageBuffer = "";
    }
    //console.log("Data: " + message);
    if(message.indexOf("STRT") !== -1) {
      reading = true;
      messageBuffer = ""; //TODO: Other way to clear this?
    }
    if(reading) {
      if(message.indexOf('$') > -1) {
        if(message.indexOf("STRT") !== -1) {
          messageBuffer += message.substring(message.indexOf('STRT') + 4, message.indexOf('$'));
        } else {
          messageBuffer += message.substring(0, message.indexOf('$'));
        }
        reading = false;
        let finishedArray = messageBuffer.split(',');
        console.log("Finished: " + messageBuffer);
        console.log(selectedAnim2);
        let num_leds = generations[selectedGeneration].layout*generations[selectedGeneration].layout*2;
        ledData[selectedAnim2].length = 0;
        
        for(let i = 0; i < finishedArray[0]; i++) {
          ledData[selectedAnim2].push({grid: Array(162), time: 16});
          for(let o = 0; o < num_leds; o++) {
            ledData[selectedAnim2][i]['grid'][o] = "#" + helper.decimalToHex(finishedArray[i * (num_leds + 1) + o + 1], 6);
          }
          ledData[selectedAnim2][i]['time'] = finishedArray[num_leds + i * (num_leds + 1) +  1]
        }
        console.log(ledData);
        changeFrame(0);
        setNumFrames(ledData[selectedAnim2].length);
        setCurrentFrameTimeFE(ledData[selectedAnim2][0]['time']);
        //wipeCanvasGrid();
        drawGrid();
        
      } else if(message.indexOf("STRT") !== -1) {
        messageBuffer += message.substring(message.indexOf("STRT") + 4);
        //console.log("Mid: " + messageBuffer);
      } else {
        messageBuffer += message;
        //console.log("Mid: " + messageBuffer);
      }
    }
  }

  async function writeString(message) {
    console.log(message);
    let portData = comPorts[selectedPort];
    let port = portData.portObject;
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
    const writer = textEncoder.writable.getWriter();
    await writer.write(message);
    await writer.close();
    await writer.releaseLock();
    await writableStreamClosed;


  }


  async function getAnimationFromDevice() {

    //115200
    let portData = comPorts[selectedPort];
    let port = portData.portObject;
    console.log(port);
    const encoder = new TextEncoder();
    const writer = port.writable.getWriter();
    await writer.write(encoder.encode("c" + selectedAnimation + ","));
    await writer.write(encoder.encode("r"));
    writer.releaseLock();

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);


    

    // Listen to data coming from the serial device.
    //while (port.readable) {
      const reader = textDecoder.readable.getReader();
    
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }
          if (value) {
            handleMonitorMessage(value);
            if(value.indexOf('$') > -1) {
              reader.cancel();
              reader.releaseLock();
              await readableStreamClosed.catch(() => { /* Ignore the error */ });
              break;
            }
            
          }
        }
        console.log("Out of loop");
      } catch (error) {
        // TODO: Handle non-fatal read error.
      }

    //}

    
  }





  function onNewDevice(serial, network) {
    //const  serialDevices = serial;
      //const  networkDevices = network;
      if(serial.length === 0) {
        setSelectedPort("");
      }
      setComPorts(serial);
      
      console.log(serial);
  }
  async function setUpSerialAPI() {
    console.log("Setting up Web API");

    navigator.serial.addEventListener("connect", (event) => {
      // TODO: Automatically open event.target or warn user a port is available.
      console.log("New device found!!");
      console.log(event);
    });
    
    navigator.serial.addEventListener("disconnect", (event) => {
      // TODO: Remove |event.target| from the UI.
      // If the serial port was opened, a stream error would be observed as well.
      console.log(event);
    });

    
    
  }


  function generateCode() {
    let finalCode = "";
    if(selectedGeneration <= 1) {
      
      let fpsDataCode = "const int animFPS[] = {";
      let framesCount = "const int animFrames[] = {";
      for(let i_anim = 0; i_anim < generations[selectedGeneration].animationCount; i_anim++) {
        finalCode += "const PROGMEM __uint24 anim" + i_anim + "[" + ledData[i_anim].length + "][NUM_LEDS*2] = {";
        for(let i_frame = 0; i_frame < ledData[i_anim].length; i_frame++) {
          for(let i_pixel = 0; i_pixel < (generations[selectedGeneration].layout*generations[selectedGeneration].layout*2); i_pixel++) {
            finalCode += ledData[i_anim][i_frame].grid[i_pixel].replace("#", "0x") + ",";
          }
        }
        finalCode = finalCode.substring(0, finalCode.length - 1) + "};\n";
        fpsDataCode += (Math.round(1000/ledData[i_anim][0].time)) + ",";
        framesCount += ledData[i_anim].length + ",";
      }
      finalCode += fpsDataCode.substring(0, fpsDataCode.length - 1) + "};\n";
      finalCode += framesCount.substring(0, framesCount.length - 1) + "};\n";
    } else {
      /*
      let animDataCode = "uint8_t myMac[] = {" + myMacAddress + "};\nbool isMaster = " + useSpecial + ";\n";
      for(let i_anim = 0; i_anim < generations[selectedGeneration].animationCount; i_anim++) {
        let animationCodeName = (i_anim > 11 ? "syncAnim" : "anim");
        finalCode += "const PROGMEM unsigned int " + animationCodeName + (i_anim % 12) + "[" + ledData[i_anim].length + "][NUM_LEDS*2] = {";
        for(let i_frame = 0; i_frame < ledData[i_anim].length; i_frame++) {
          for(let i_pixel = 0; i_pixel < (generations[selectedGeneration].layout*generations[selectedGeneration].layout*2); i_pixel++) {
            finalCode += ledData[i_anim][i_frame].grid[i_pixel].replace("#", "0x") + ",";
          }
        }
        finalCode = finalCode.substring(0, finalCode.length - 1) + "};\n";

        animDataCode += "animData " + (i_anim > 11 ? "syncData" : "data") + (i_anim % 12) + "{" + (Math.round(1000/ledData[i_anim][0].time)) + ", " + ledData[i_anim].length + ", true};\n";

        //fpsDataCode += (Math.round(1000/ledData[i_anim][0].time)) + ",";
        //framesCount += ledData[i_anim].length + ",";
      }
      finalCode += animDataCode;
      */
    }
    return finalCode;
  }

  
  
  // eslint-disable-next-line no-unused-vars
  async function prepareCodeFile() {
    let temp = "";
    let codeData = generateCode();
    //console.log(codeData);
    if(generations[selectedGeneration].core === "arduino") {
      return getSelectedGenerationCode().then((response) => {
        //console.log(response);
        temp = response;
        let part1 = temp.substring(0, temp.indexOf('?')) + "\n";
        
        let part2 = temp.substring(temp.indexOf('?')+1, temp.length); 
        //console.log(part1 + codeData);
        return part1 + codeData + part2;
      });
    } else {
      return getSelectedGenerationCode().then((response) => {
        return response;
      });
    }
    
  }

  useEffect(() => {
    
    if ("serial" in navigator) {
      // The Web Serial API is supported.
      console.log("Serial in navigator is true!");
      if(isWebAPIFound) {
        console.log("Already setup Web API");
        return;
      }
      setIsWebAPIFound(true);
      setUpSerialAPI();
      
    } else {

    }
    
  }, []);
  
  useEffect(() => {
    //drawGrid(0);
    setSelectedAnimation(selectedAnimation);
    setNumFrames(ledData[selectedAnimation].length)
    changeFrame(0);
    selectedAnim2 = selectedAnimation;
  }, [selectedAnimation]);

  useEffect(() => {
    //drawGrid(0);
    setPowerConsumtion(calculateFrameConsumption(selectedFrame));
    /*
    switch(generations[selectedGeneration].year) {
      case '7E7':
        squareSize = 38;
        squareGridLineWidth = 6;
        break;
      case '7E8':
        squareSize = 32;
        squareGridLineWidth = 5;
        break;
      default:
        squareSize = 38;
        squareGridLineWidth = 4;
        break;
    }
    */
    if(ctx) {
      wipeCanvasGrid();
      drawGrid();
    }
  }, [selectedGeneration]);

  
  function copyFrame() {
    var newFrame = Array(162);
    for(let i = 0; i < newFrame.length; i++) {
      newFrame[i] = ledData[selectedAnimation][selectedFrame]['grid'][i];
    }
    
    ledData[selectedAnimation].splice(selectedFrame, 0, {grid: newFrame, time: ledData[selectedAnimation][selectedFrame]['time']});
    setNumFrames(ledData[selectedAnimation].length);
    changeFrame(selectedFrame + 1, true);
    setMemoryUsage(calculateMemoryUsage());
  }

  function removeFrame() {
    if(numFrames === 1) {
      return;
    }
    var currentSelFrame = selectedFrame;
    ledData[selectedAnimation].splice(currentSelFrame, 1);
    if(currentSelFrame === numFrames-1) {
      setCurrentFrameTimeFE(ledData[selectedAnimation][currentSelFrame - 1]['time'])
      setSelectedFrame(currentSelFrame-1);
      drawGrid(currentSelFrame - 1);
      setPowerConsumtion(calculateFrameConsumption(currentSelFrame - 1));
    } else {
      setCurrentFrameTimeFE(ledData[selectedAnimation][currentSelFrame]['time'])
      drawGrid();
      setPowerConsumtion(calculateFrameConsumption(currentSelFrame));
    }
    setNumFrames(ledData[selectedAnimation].length);
    setMemoryUsage(calculateMemoryUsage());
    
  }

  function changeFrame(inputIndex, overrideSafety = false) {
    let index = inputIndex < 0 ? numFrames - 1 : (inputIndex >= numFrames && !overrideSafety ? 0 : inputIndex);
    if(!index) {
      index = 0;
    }
    setSelectedFrame(index);
    setCurrentFrameTimeFE(ledData[selectedAnimation][index]['time']);
    setPowerConsumtion(calculateFrameConsumption(index));
    drawGrid(index);
  }

  async function changeAnimation(event) {
    setSelectedFrame(0);
    setSelectedAnimation(event.target.value);
    if(selectedPort !== '') {
      await writeString("c" + event.target.value + ",");
    }
  }

  function setCurrentFrameTime(time) {
    setCurrentFrameTimeFE(time);
    ledData[selectedAnimation][selectedFrame]['time'] = time;
    setHasUnsavedChanges(true);
  }

  

  function calculateFrameConsumption(index) {
    let consumption = generations[selectedGeneration].baseCurrent;
    for(let i = 0; i < (generations[selectedGeneration].layout*generations[selectedGeneration].layout*2); i++) {
      var color = ledData[selectedAnimation][index]['grid'][i];
      
      var r = parseInt(color.substring(1,3),16)/255;
      var g = parseInt(color.substring(3,5),16)/255;
      var b = parseInt(color.substring(5,7),16)/255;
      consumption += r*generations[selectedGeneration].currentPerLed + g*generations[selectedGeneration].currentPerLed + b*generations[selectedGeneration].currentPerLed;
    }
    return consumption;
  }

  function calculateMemoryUsage(ingeneration = -1) {
    let generation = generations[selectedGeneration];
    if(ingeneration >= 0) {
      generation = generations[ingeneration];
    }
    if(ingeneration > 1 || (ingeneration < 0 && selectedGeneration > 1)) {
      return calculateMemoryUsage2();
    }
    let occupied = generation.programSpace;
    for(let i = 0; i < ledData.length; i++) {
      occupied += ledData[i].length * generation.frameSpace;
    }
    return occupied;
  }

  function calculateMemoryUsage2() {
    let occupied = 0;
    for(let i = 0; i < ledData.length; i++) {
      occupied += (251 * Math.ceil((ledData[i].length)/2)) + (502 * Math.ceil((ledData[i].length + 1)/2));
    }
    return occupied
  }


  async function getSelectedGenerationCode() {
    return ( ( await fetch('/c_code/foundProg' + generations[selectedGeneration].year + '.c')).text() );
  }

  
  useEffect(() => {
    const handleContextMenu = (event) => {
        event.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    wipeCanvasGrid();
    drawGrid();
    setMemoryUsage(calculateMemoryUsage());

    // Clean up the event listener on component unmount
    return () => {
        window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);


  function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      var jsonCont = JSON.parse(contents);
      if(jsonCont) {
        console.log(jsonCont);
        //frames.splice(0, frames.length);
        setIsLoading(true);
        setTimeout(function(){setIsLoading(false)},700);
        ledData = JSON.parse(contents);
        
        setNumFrames(jsonCont[0].length);
        //setGrid(jsonCont[0]);
        setSelectedFrame(0);
        setCurrentFrameTime(jsonCont[0][0].time);
        setSelectedAnimation(0);
      } else {
        console.log("Failed to read json");
      }
    };
    reader.readAsText(file);
  }


  function onChangePrimaryColor(color, event) {
    setSelectedColors({primary: color.hex, secondary: selectedColors.secondary});
    setPreviewColors({primary: color.hex, secondary: selectedColors.secondary});
  }
  function onChangeSecondaryColor(color, event) {
    setSelectedColors({primary: selectedColors.primary, secondary: color.hex});
    setPreviewColors({primary: selectedColors.primary, secondary: color.hex});
  }

  
  const handleChangeGen = (event) => {
    if(event.target.value < 2 && selectedAnimation > 3) {
      changeAnimation({target: {value: 0}});
    }
    setSelectedGeneration(event.target.value);
    setMemoryAvailable(generations[event.target.value].memory);
    setMemoryUsage(calculateMemoryUsage(event.target.value));
    
    
  };

  const handleChangePort = (event, newComArray) => {
    //daemon.closeSerialMonitor(selectedPort);
    console.log(newComArray);
    try {
    if(!newComArray || newComArray == null) {
      setSelectedPort(event.target.value);
      let port = comPorts[event.target.value].portObject;
      console.log(comPorts);
      console.log(comPorts[event.target.value]);
      port.open({ baudRate: 115200 /* pick your baud rate */ });

    } else {
      setSelectedPort(event.target.value);
      let port = newComArray[event.target.value].portObject;
      console.log(newComArray);
      console.log(newComArray[event.target.value]);
      port.open({ baudRate: 115200 /* pick your baud rate */ });
      
    }
  } catch(error) {
    setSelectedPort('');
  }
    //daemon.openSerialMonitor(event.target.value, 115200);
    
  }

  const handleSelectPortSerialAPI = async (event) => {
    
    setComPortsSelectOpen(false);
    await navigator.serial.requestPort().then((response) => {
      const portInfo = response.getInfo()
      console.log(`vendorId: ${portInfo.usbVendorId} | productId: ${portInfo.usbProductId} `);
      let selPort = {
        portObject: response,
          Name: getKnownDevice(portInfo),
      };
      setComPorts([selPort])
      handleChangePort({target: {value: 0}}, [selPort]);
      
      return true;
    })
    .catch((ex) => {
      handleChangePort({target: {value: ''}}); //TODO: Check if device is connected
      if (ex.name === 'NotFoundError') {
        console.log('Device NOT found');
      } else {
        console.log(ex);
      }
      return false
    });
    
  }

  async function sendAnimation() {

    //await writeString('w');
    console.log("Writing to ESP");
    let totalData = "w" + selectedAnimation +  ledData[selectedAnimation].length + ",";
    console.log(totalData);
    for(let i_frame = 0; i_frame < ledData[selectedAnimation].length; i_frame++) {
      for(let i_pixel = 0; i_pixel < (generations[selectedGeneration].layout*generations[selectedGeneration].layout*2); i_pixel++) {
        let sendData = parseInt(ledData[selectedAnimation][i_frame]['grid'][i_pixel].substring(1), 16) + ",";
        totalData += sendData;
      }
      totalData += parseInt(ledData[selectedAnimation][i_frame]['time']) + ",";
    }
    await writeString(totalData);
    console.log(totalData);
  }

  const fileInput = useRef();
  const selectFile = () => {
      fileInput.current.click();
  }

  function getSquareFromMousePos(event) {
    let x = Math.floor((event.clientX - canvas.offsetLeft)/squareSize);
    let y = Math.floor((event.clientY - canvas.offsetTop)/squareSize);
    if(x >= generations[selectedGeneration].layout && x <= generations[selectedGeneration].layout+eyeWidth - 1) {
      return {x: -1, y: -1};
    }
    if(x >= generations[selectedGeneration].layout) {
      x-=eyeWidth;
    }
    return {x: x, y: y};
  }
  const onMouseMoveCanvas = (event) => {
    if(isSliderDragging) {
      return;
    }
    let gridPos = getSquareFromMousePos(event);
    drawGrid();
    if(event.buttons === 1) {
      ledData[selectedAnimation][selectedFrame]['grid'][helper.getLedFromXY(gridPos.x, gridPos.y)] = selectedColors.primary;
      setPowerConsumtion(calculateFrameConsumption(selectedFrame));
      drawSquare(gridPos.x, gridPos.y, selectedColors.primary);
      setHasUnsavedChanges(true);
    } else if(event.buttons === 2) {
      ledData[selectedAnimation][selectedFrame]['grid'][helper.getLedFromXY(gridPos.x, gridPos.y)] = selectedColors.secondary;
      setPowerConsumtion(calculateFrameConsumption(selectedFrame));
      drawSquare(gridPos.x, gridPos.y, selectedColors.secondary);
      setHasUnsavedChanges(true); 
    } else {
      drawSquare(gridPos.x, gridPos.y, selectedColors.primary); 
    }
    
  }

  const onMouseLeaveCanvas = (event) => {
    drawGrid();
  }
  
  



  function drawGrid(index = -1) {
    if(index === -1) {
      index = selectedFrame;
    }
    for(let y = 0; y < generations[selectedGeneration].layout; y++) {
      for(let x = 0; x < generations[selectedGeneration].layout*2; x++) {
        drawSquare(x, y, ledData[selectedAnimation][index]['grid'][helper.getLedFromXY(x,y)]);
      }
    }
  }
  function wipeCanvasGrid() {
    //ctx.fillStyle = "black";
    var gradEnd = "#1E1E1E"
    var gradMid = "#251E1E"
    const gradient = ctx.createLinearGradient(0, generations[selectedGeneration].layout*squareSize/2, generations[selectedGeneration].layout*squareSize, generations[selectedGeneration].layout*squareSize/2);
    gradient.addColorStop(0,  gradEnd);
    gradient.addColorStop(0.5,gradMid);
    gradient.addColorStop(1,  gradEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, squareSize*generations[selectedGeneration].layout, generations[selectedGeneration].layout*squareSize);

    const gradient2 = ctx.createLinearGradient(squareSize*(generations[selectedGeneration].layout+eyeWidth), generations[selectedGeneration].layout*squareSize/2, squareSize*(generations[selectedGeneration].layout*2+eyeWidth), generations[selectedGeneration].layout*squareSize/2);
    gradient2.addColorStop(0,  gradEnd);
    gradient2.addColorStop(0.5,gradMid);
    gradient2.addColorStop(1,  gradEnd);
    ctx.fillStyle = gradient2;
    ctx.fillRect(squareSize*(generations[selectedGeneration].layout+eyeWidth), 0, squareSize*generations[selectedGeneration].layout, generations[selectedGeneration].layout*squareSize);
    
  }
  function drawSquare(ix, y, color) {
    let x = ix;
    if(x >= generations[selectedGeneration].layout) {
      x += eyeWidth;
    }
    if(!ctx) {
      return;
    }
    ctx.fillStyle = color;
    ctx.fillRect(x*squareSize + squareGridLineWidth, y*squareSize + squareGridLineWidth, squareSize - squareGridLineWidth*2, squareSize - squareGridLineWidth*2);
  }

  

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="App">
        <AppBar position='relative' color='secondary'>
          <Container maxWidth="x1">
            <Toolbar disableGutters>
              <Typography variant='h6'>
                Animator 5.0 Beta
              </Typography>
              <TextField sx={{marginLeft: 2}} id="outlined-basic" label="Namn" value={animationName} onChange={(event) => {setAnimationName(event.target.value);}} variant="outlined" />
              <input type="file" style={{ "display": "none" }} onChange={readSingleFile} ref={fileInput} />
              <Tooltip title="Öppna">
                <IconButton size='large' onClick={selectFile}>
                  <UploadFileIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Spara">
                <IconButton size='large' onClick={() => {helper.download(JSON.stringify(ledData, null, 2), animationName + ".json", 'text/plain');setHasUnsavedChanges(false);}}>
                  <SaveIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Exportera Kod">
                <IconButton size='large' onClick={() => {prepareCodeFile().then((response) => {helper.download(response, animationName +  "code.ino", "text/plain");})}}>
                  <DataObjectIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Spara på brillor">
                <span>
                  <IconButton size='large' disabled={/*!daemon.serialMonitorOpened._value*/ false} onClick={() => {sendAnimation();}}>
                    <LoginIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Hämta från brillor">
                <span>
                  <IconButton disabled={/*!daemon.serialMonitorOpened._value*/ false} size='large' onClick={() => {getAnimationFromDevice();}}>
                    <LogoutIcon />
                  </IconButton>
                </span>
              </Tooltip>
              <Grid container direction={'column'} alignContent={'center'} sx={{width: 170, padding: 1,  position: "relative", textAlign: "center"}}>
                <Grid item md={12}>
                  <Box sx={{position: "relative", textAlign: "center"}}>
                    <LinearProgress sx={{width: 160, height: 24}} color={(memoryUsage > memoryAvailable ? 'error' : 'primary')}  variant='determinate' value={memoryUsage*100/memoryAvailable}></LinearProgress>
                    <Typography width={160} variant='body2' sx={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>{helper.getPrefixedString(memoryUsage)}B/{helper.getPrefixedString(memoryAvailable)}B</Typography>
                    <MemoryIcon sx={{position: "absolute", top: "50%", left: "50%", transform: "translate(-300%, -50%)"}} />
                  </Box>
                </Grid>
                <Grid item md={12}>
                  <Box sx={{marginTop: 1,  position: "relative", textAlign: "center"}}>
                    <FastLinearProgress sx={{width: 160, height: 24}} variant='determinate' value={powerConsumtion*100/2}></FastLinearProgress>
                    <Typography width={160} variant='body2' sx={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}>{helper.getPrefixedString(powerConsumtion)}A</Typography>
                    <BoltIcon sx={{position: "absolute", top: "50%", left: "50%", transform: "translate(-300%, -50%)"}} />
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{padding: 1, boxBorder: "border-box"}}>
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel id="demo-simple-select-helper-label">Generation</InputLabel>
                  <Select
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={selectedGeneration}
                    label="Generation"
                    onChange={handleChangeGen}
                    defaultValue={0}
                    
                  >
                    {generations.map((generation, index) => (
                      <MenuItem key={generation.year} value={index}>{generation.year} - {generation.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Tooltip title={isWebAPIFound ? "" : "Ingen tillgång till serieportar. Byt till Chrome-baserad webbläsare eller ladda ner offlineversion"}>
                  <FormControl sx={{ m: 1, minWidth: 120 }} error={!isWebAPIFound}>
                    <InputLabel id="demo-simple-select-helper-label">{isWebAPIFound ? "Port" : "⚠️Port"}</InputLabel>
                    <Select
                      key={"comSelect"}
                      labelId="demo-simple-select-helper-label"
                      id="demo-simple-select-helper"
                      value={selectedPort}
                      label="Port"
                      onChange={(e)=>handleChangePort(e)}
                      defaultValue={0}
                      disabled={!isWebAPIFound}
                      open={comPortsSelectOpen}
                      onOpen={handleSelectPortSerialAPI}
                      onClose={(event) => {setComPortsSelectOpen(false);}}
                      
                    >
                      
                      {comPorts.map((port, index) => (
                        <MenuItem key={index} value={index}>{port.Name}</MenuItem> 
                      ))}{/* TODO: Change value from name. Problems with multiple names */}
                    </Select>
                  </FormControl>
                </Tooltip>
                
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Grid container alignItems={"center"} columnSpacing={10} rowSpacing={2} sx={{marginTop: 1, padding: 0, paddingLeft: 3, paddingRight: 1}}>
          <Grid item container md={8}>
            <Grid item md={numFrames > 9 ? 12: (numFrames <= 1 ? 2 : numFrames + 3)  }>
              <Paper>
                <Stack direction="row" spacing={2}>
                  <FormControl sx={{ m: 1, minWidth: '9em' }}>
                    <InputLabel id="demo-simple-select-helper-label">Animation</InputLabel>
                    <Select
                      labelId="demo-simple-select-helper-label"
                      id="demo-simple-select-helper"
                      value={selectedAnimation}
                      label="Animation"
                      onChange={changeAnimation}
                      defaultValue={0}
                      fullWidth={true}
                    >
                      {generations[selectedGeneration].animationCount > 4 ? <ListSubheader>Meny 1</ListSubheader> : null}
                      <MenuItem value={0}>Animation 1</MenuItem>
                      <MenuItem value={1}>Animation 2</MenuItem>
                      <MenuItem value={2}>Animation 3</MenuItem>
                      <MenuItem value={3}>Animation 4</MenuItem>

                      {generations[selectedGeneration].animationCount > 4 ? <ListSubheader>Meny 2</ListSubheader> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={4}>Animation 5</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={5}>Animation 6</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={6}>Animation 7</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={7}>Animation 8</MenuItem> : null}

                      {generations[selectedGeneration].animationCount > 4 ? <ListSubheader>Meny 3</ListSubheader> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={8}>Animation 9</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={9}>Animation 10</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={10}>Animation 11</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={11}>Animation 12</MenuItem> : null}

                      {generations[selectedGeneration].animationCount > 4 ? <ListSubheader>Meny 4 Globala</ListSubheader> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={12}>Animation 13</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={13}>Animation 14</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={14}>Animation 15</MenuItem> : null}
                      {generations[selectedGeneration].animationCount > 4 ? <MenuItem value={15}>Animation 16</MenuItem> : null}
                      
                    </Select>
                  </FormControl>
                  <IconButton sx={numFrames <= 1 ? {display: 'none'} : {}} disabled={numFrames <= 1} onClick={() => {changeFrame(selectedFrame-1)}}><NavigateBeforeIcon /></IconButton>
                  <Slider sx={numFrames <= 1 ? {display: 'none'} : {}} onMouseDown={() => setIsSliderDragging(true)} onChangeCommitted={() => setIsSliderDragging(false)} disabled={numFrames <= 1} step={1} valueLabelDisplay='auto' value={selectedFrame+1} onChange={(event, newVal) => {changeFrame(newVal-1)}}  min={1} max={numFrames}/>
                  <IconButton sx={numFrames <= 1 ? {display: 'none'} : {}} disabled={numFrames <= 1} onClick={() => {changeFrame(selectedFrame+1)}}><NavigateNextIcon /></IconButton>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
          <Grid item md={8}>
            <Paper sx={{ padding: 2}}>
              {/* <div style={{position: 'relative'}}>
                <BrillzIcon style={{position: 'absolute', top: -squareSize/4, left: squareSize*2}} width={squareSize*18.5} height={squareSize*8} onMouseMove={onMouseMoveCanvas} onMouseDown={onMouseMoveCanvas} onMouseLeave={onMouseLeaveCanvas}/>
              </div> */}
              <canvas id="canvas" width={squareSize * (generations[selectedGeneration].layout*2+eyeWidth)} height={squareSize*generations[selectedGeneration].layout} onMouseMove={onMouseMoveCanvas} onMouseDown={onMouseMoveCanvas} onMouseLeave={onMouseLeaveCanvas}></canvas>
            </Paper>
          </Grid>
          <Grid item md={4}>
            <Paper sx={{padding: 1}}>
              <Stack direction="row" spacing={6}>
                {/* <SketchPicker width='90%' disableAlpha color={previewColors.primary} onChange={(color, event) => setPreviewColors({primary: color, secondary: previewColors.secondary})} onChangeComplete={onChangePrimaryColor}/>
                <SketchPicker width='90%' disableAlpha color={previewColors.secondary} onChange={(color, event) => setPreviewColors({primary: previewColors.primary, secondary: color})} onChangeComplete={onChangeSecondaryColor}/>
                 */}<CustomColorPicker currentPerLed={generations[selectedGeneration].currentPerLed} disableAlpha color={previewColors.primary} onChange={(color, event) => setPreviewColors({primary: color, secondary: previewColors.secondary})} onChangeComplete={onChangePrimaryColor} />
                <CustomColorPicker currentPerLed={generations[selectedGeneration].currentPerLed} disableAlpha color={previewColors.secondary} onChange={(color, event) => setPreviewColors({primary: previewColors.primary, secondary: color})} onChangeComplete={onChangeSecondaryColor} />
              </Stack>
            </Paper>
          </Grid>
          <Grid item md={8}>
            <Paper>
            <Grid container>
              <Grid item md={4} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingLeft: 4}}>
                  <Button onClick={() => {copyFrame()}} variant="contained">Ny bild</Button>
                  <Button variant="contained" onClick={() => {removeFrame()}}>Ta bort bild</Button>
              </Grid>
              <Grid item md={4}>
                  <TextField
                    label="Visningstid"
                    id="outlined-start-adornment"
                    sx={{ m: 1, width: '14ch' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">ms</InputAdornment>,
                      inputMode: 'numeric', pattern: '[0-9]*',
                    }}
                    InputLabelProps={{shrink: true}}
                    type='number'
                    value={currentFrameTime}
                    onChange={(event) => {if(event.target.value < 0 || event.target.value===''){setCurrentFrameTime(0)}else{setCurrentFrameTime(parseInt(event.target.value))}}}
                  />
              </Grid>
            </Grid>
            </Paper>
          </Grid>
        </Grid>
        
      </div>
    </ThemeProvider>
  );
}

export default App;

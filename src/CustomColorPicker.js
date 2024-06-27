/* eslint-disable react-hooks/exhaustive-deps */
import { Box, FormControlLabel, FormGroup, LinearProgress, Slider, Switch, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { CustomPicker } from 'react-color'
import { EditableInput, Hue } from 'react-color/lib/components/common'
import HueSelect from './HueSelect';
const ColorSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? '#0a84ff' : '#007bff',
  height: 5,
  padding: '15px 0',
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: '#fff',
    boxShadow: '0 0 2px 0px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      boxShadow: '0 0 0 8px rgba(58, 133, 137, 0.16)',
    },
    '&:before': {
      boxShadow:
        '0px 0px 1px 0px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0.14), 0px 0px 1px 0px rgba(0,0,0,0.12)',
    },
  },
  '& .MuiSlider-valueLabel': {
    fontSize: 12,
    fontWeight: 'normal',
    top: -6,
    backgroundColor: 'unset',
    color: theme.palette.text.primary,
    '&::before': {
      display: 'none',
    },
    '& *': {
      background: 'transparent',
      color: theme.palette.mode === 'dark' ? '#fff' : '#000',
    },
  },
  
}));
export const MyPicker = ( props ) => {
  const [colorLimit, setColorLimit] = useState(1.0);
  const [isGrayScale, setIsGrayScale] = useState(false);
  const width = 150;
  const FastLinearProgress = styled(LinearProgress)(({ theme }) => ({
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: "#141414",
    },
    [`& .${linearProgressClasses.bar}`]: {
      backgroundColor: props.hex,
      transition: "transform .4s linear;"
    },
  }));
  
  const styles = {
    hue: {
      height: 10,
      position: 'relative',
      marginBottom: 10,
      width: width,
      //backgroundColor: ''
    },
    input: {
      height: 40,
      border: `0px solid white`,
      paddingLeft: 10,
      background: "#121212",
      color: "white",
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      fontSize: "1em",
      maxWidth: width,
    },
    smallinput: {
      padding: '4px 10% 3px',
      boxShadow: 'inset 0 0 0 1px #ccc',

      height: 40,
      border: `0px solid white`,
      background: "#121212",
      color: "white",
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      fontSize: "1em",
      maxWidth: width/3,
      flex: 1,
    },
    smalllabel: {
      display: 'block',
      textAlign: 'center',
      fontSize: '11px',
      color: '#FFF',
      paddingTop: '3px',
      paddingBottom: '4px',
      textTransform: 'capitalize',
    },
    swatch: {
      width: width,
      height: 40,
      background: props.hex,
      border: `2px solid black`,
    },
    saturation: {
      position: "relative",
      width: width,
      height: width,
    
    }
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
  
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1/3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1/3);
    }
  
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  
  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }


  function limitRGB(rgbcolor, limit) {
    let clength = Math.sqrt(Math.pow(rgbcolor.r, 2) + Math.pow(rgbcolor.g, 2) + Math.pow(rgbcolor.b, 2));
    let nR = rgbcolor.r/clength;
    let nG = rgbcolor.g/clength;
    let nB = rgbcolor.b/clength;
    return {r: nR * limit, g: nG * limit, b: nB * limit, a: props.rgb.a, source: 'rgb'};
  }

  function limitHSL(hsvcolor, limit) {
    let rgb = hslToRgb(hsvcolor.h, hsvcolor.s, hsvcolor.l);
    return limitRGB({r: rgb[0], g: rgb[1], b: rgb[2]}, limit);
  }

/*
  function limitRGB(rgbcolor, limit) {
    let clength = Math.sqrt(Math.pow(rgbcolor.r, 2) + Math.pow(rgbcolor.g, 2) + Math.pow(rgbcolor.b, 2));
    let nR = rgbcolor.r/clength;
    let nG = rgbcolor.g/clength;
    let nB = rgbcolor.b/clength;
    let newLength = Math.sqrt(Math.pow(255, 2)*3) * limit;
    return {r: nR * newLength, g: nG * newLength, b: nB * newLength, a: props.rgb.a, source: 'rgb'};
  }
*/
  const handleChange = (data, e) => {
    console.log(data)
    if (data.hex) {
      props.color.isValidHex(data.hex) && props.onChange({
        hex: data.hex,
        source: 'hex',
      }, e)
    } else if (data.r || data.g || data.b) {
      props.onChange(limitRGB({
        r: data.r || props.rgb.r,
        g: data.g || props.rgb.g,
        b: data.b || props.rgb.b,
        a: props.rgb.a,
        source: 'rgb',
      }, colorLimit*255), e)
    } else if (data.a) {
      if (data.a < 0) {
        data.a = 0
      } else if (data.a > 100) {
        data.a = 100
      }

      data.a /= 100
      props.onChange({
        h: props.hsl.h,
        s: props.hsl.s,
        l: props.hsl.l,
        a: data.a,
        source: 'rgb',
      }, e)
    } else if (data.l) {
      if (data.l < 0) {
        data.l = 0
      } else if (data.l> 1) {
        data.l = 1
      }

      //data.l /= 100
      props.onChange({
        h: props.hsl.h,
        s: props.hsl.s,
        l: data.l,
        a: props.hsl.a,
        source: 'rgb',
      }, e)
    } else if (data.hasOwnProperty('s')) {
      console.log("succes");
      if (data.s < 0) {
        data.s = 0
      } else if (data.s> 1) {
        data.s = 1
      }

      //data.s /= 100
      props.onChange({
        h: props.hsl.h,
        s: data.s,
        l: props.hsl.l,
        a: props.hsl.a,
        source: 'rgb',
      }, e)
    }
  }

  function calculateRGBConsumption(rgb, currentPerLed) {
    return (rgb.r/255)*currentPerLed + (rgb.g/255)*currentPerLed + (rgb.b/255)*currentPerLed;
  }
  
  useEffect(() => {
    handleChange(props.rgb);
  }, [colorLimit]);

  return (
    <div style={{background: "none", border: `1px solid black`, paddingRight: 5, paddingLeft: 5}}>
      {/* <div>
        <Slider min={0} max={255} step={1} value={props.rgb.r} onChange={(event, newVal) => {props.onChange(RGBToHSL(newVal, props.rgb.g, props.rgb.b))}}/>
        <Slider min={0} max={255} step={1} value={props.rgb.g} onChange={(event, newVal) => {props.onChange(RGBToHSL(props.rgb.r, newVal, props.rgb.b))}}/>
        <Slider min={0} max={255} step={1} value={props.rgb.b} onChange={(event, newVal) => {props.onChange(RGBToHSL(props.rgb.r, props.rgb.g, newVal))}}/>
        <Slider min={0} max={442} step={1}  value={Math.sqrt(Math.pow(props.rgb.r, 2) + Math.pow(props.rgb.g, 2) + Math.pow(props.rgb.b, 2))} onChange={(event, newVal) => {}}/>
      </div> */}
      <Box sx={{position: "relative", textAlign: "center", marginBottom: 1}}>
        <FastLinearProgress sx={{width: 150, height: 24}}  variant='determinate' value={Math.round((calculateRGBConsumption(props.rgb, props.currentPerLed)/props.currentPerLed)/0.03)}></FastLinearProgress>
        <Typography width={160} variant='body2' sx={{position: "absolute", width: "6ch", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "#121212CF"}}>{Math.round((calculateRGBConsumption(props.rgb, props.currentPerLed))*1000)} mA</Typography>
      </Box>

      <div style={ styles.hue }>
        <Hue hsl={ props.hsl } onChange={(data, e) => {limitHSL(data, colorLimit)}} />
      </div>
      <div style={ styles.hue }>
        <HueSelect hsl={ props.hsl } onChange={ props.onChange } />
      </div>
      <div style={{display: "flex", alignItems: 'center', justifyContent: 'flex-start', paddingRight: '1ch'}}>
      <Typography variant='body2' sx={{marginRight: "2ch"}}>Styrka</Typography>
        <ColorSlider min={0} max={1} step={0.01} value={ colorLimit }
          onChange={(event, newVal) => {setColorLimit(newVal)}}
          valueLabelDisplay='auto'
          valueLabelFormat={(number) => {return Math.round(number*100) + "%"}}
        />
      </div>
      
      <div style={{display: "flex", alignItems: 'center', justifyContent: 'flex-start'}}>
        <FormGroup>
          <FormControlLabel control={<Switch checked={isGrayScale} onChange={(event) => {setIsGrayScale(event.target.checked); handleChange({s: event.target.checked ? 0 : 1})}} />} label="Gråskala" labelPlacement="start"   />
        </FormGroup>
      </div>
      <div style={{display: "flex"}}>
        <EditableInput
          label="r"
          style={{ input: styles.smallinput, label: styles.smalllabel }}
          value={ props.rgb.r }
          onChange={ handleChange }
          dragLabel="true"
          dragMax="255"
        />
        <EditableInput
          label="g"
          style={{ input: styles.smallinput, label: styles.smalllabel }}
          value={ props.rgb.g }
          onChange={ handleChange }
          dragLabel="true"
          dragMax="255"
        />
        <EditableInput
          label="b"
          style={{ input: styles.smallinput, label: styles.smalllabel }}
          value={ props.rgb.b }
          onChange={ handleChange }
          dragLabel="true"
          dragMax="255"
        />
      </div>
    </div>
  )
}

export default CustomPicker(MyPicker)
/* eslint-disable react-hooks/exhaustive-deps */
import { Box, LinearProgress, Slider, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { styled } from '@mui/system';
import { linearProgressClasses } from '@mui/material/LinearProgress';
import { CustomPicker } from 'react-color'
import { EditableInput, Hue } from 'react-color/lib/components/common'
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

  

  function limitRGB(rgbcolor, limit) {
    let clength = Math.sqrt(Math.pow(rgbcolor.r, 2) + Math.pow(rgbcolor.g, 2) + Math.pow(rgbcolor.b, 2));
    let nR = rgbcolor.r/clength;
    let nG = rgbcolor.g/clength;
    let nB = rgbcolor.b/clength;
    let newLength = Math.sqrt(Math.pow(255, 2)*3) * limit;
    return {r: nR * newLength, g: nG * newLength, b: nB * newLength, a: props.rgb.a, source: 'rgb'};
  }

  const handleChange = (data, e) => {
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
      }, colorLimit), e)
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
    } else if (data.s) {
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
        <Hue hsl={ props.hsl } onChange={ props.onChange } />
      </div>
      <EditableInput
        style={{ input: styles.input }}
        value={ props.hex }
        onChange={ handleChange }
      />
      <div style={{display: "flex", alignItems: 'center', justifyContent: 'space-around'}}>
      <Typography variant='body2' sx={{width: "11ch", marginRight: "1ch"}}>Styrka</Typography>
        <ColorSlider min={0} max={1} step={0.01} value={ colorLimit }
          onChange={(event, newVal) => {setColorLimit(newVal)}}
          valueLabelDisplay='auto'
          valueLabelFormat={(number) => {return Math.round(number*100) + "%"}}
        />
      </div>
      
      <div style={{display: "flex", alignItems: 'center', justifyContent: 'space-around'}}>
        <Typography variant='body2' sx={{width: "11ch", marginRight: "1ch"}}>Mättnad</Typography>
        <ColorSlider min={0} max={1} step={0.01} value={ props.hsl.s }
          onChange={(event, newVal) => {handleChange({s: newVal}, event)}}
          valueLabelDisplay='auto'
          valueLabelFormat={(number) => {return Math.round(number*100)}}
        />
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
      <div style={ styles.swatch } />
    </div>
  )
}

export default CustomPicker(MyPicker)
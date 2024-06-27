/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'



export const HueSelect = ( props ) => {
  const hueStyles = {
    height: 10,
    width:"100%",
    background: "linear-gradient( in hsl longer hue 90deg, hsl(0, "+ props.hsl.s*100 + "%, "+ props.hsl.l*100 +"%), hsl(0, "+ props.hsl.s*100 +"%, "+ props.hsl.l*100 +"%))",
    ...props.styles,
  }


  function onMouseUp(event) {

  }



  return (
    <div style={{...hueStyles,}} >
      
    </div>
  )
}

export default HueSelect
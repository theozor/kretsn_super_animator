export function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

export function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

export function getLedFromXY(x,y) {
    //let led = 0;
    //return x + y*generations[selectedGeneration].layout*2;
    let c = x;
    let r = y
    let led_num = mod(r, 7) * 7;
    if (c < 7) {
        if (mod(r, 2) === 1) {
            led_num += mod(c, 7);
        } else {
            led_num += 6 - mod(c, 7);
        }
    } else {
        if (mod(r, 2) === 0) {
            led_num += mod(c, 7);
        } else {
            led_num += 6 - mod(c, 7);
        }
        led_num += 49;
    }
    return led_num;
}

export function mod(n, m) {
    return ((n % m) + m) % m;
}


export function getPrefixedString(number) {
    if(number === 0) {
      return "0 "
    }
    if(number >= 1000) {
      if(number >= 1000000) {
        return (Math.round(number/10000)/100).toFixed(2).replace(".00","") + " M"
      } else {
        return (Math.round(number/10)/100).toFixed(2).replace(".00","") + " K"
      }
    } else if(number <= 1.0) {
      return (Math.round(number*100000)/100).toFixed(2).replace(".00","") + " m"
    }
    return (Math.round(number*100)/100).toFixed(2).replace(".00","") + " ";
} 

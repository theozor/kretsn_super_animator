

export const BrillzIcon = (props) => {
    var fill = "none";
    var stroke = "#000000"
    var width = 605.72443;
    var height = width*0.43842;
    if(props.fill) {
        fill = props.fill;
    }
    if(props.stroke) {
        stroke = props.stroke;
    }
    if(props.width) {
        width = props.width;
    } else if(props.height) {
        width = height*2.28087
    }
    if(props.height) {
        height = props.height;
    }
    return (
        <svg
            viewBox="0 0 605.72441 265.56693"
            {...props}
            version="1.1"
            id="svg5"
            xmlns="http://www.w3.org/2000/svg">
        <desc
            id="desc1">KretsnBrillsOutline.dxf - scale = 1.000000, origin = (0.000000, 0.000000), method = manual</desc>
        <defs
            id="defs4">
            <marker
                id="DistanceX"
                orient="auto"
                refX="0"
                refY="0"
                style={{overflow: "visible"}}>
            <path
                d="M 3,-3 -3,3 M 0,-5 V 5"
                style={{stroke:"#000000", strokeWidth:"0.5"}}
                id="path1" />
            </marker>
            <pattern
                id="Hatch"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                x="0"
                y="0">
            <path
                d="M8 4 l-4,4"
                stroke="#000000"
                stroke-width="0.25"
                linecap="square"
                id="path2" />
            <path
                d="M6 2 l-4,4"
                stroke="#000000"
                stroke-width="0.25"
                linecap="square"
                id="path3" />
            <path
                d="M4 0 l-4,4"
                stroke="#000000"
                stroke-width="0.25"
                linecap="square"
                id="path4" />
            </pattern>
            <symbol
                id="*Model_Space" />
            <symbol
                id="*Paper_Space" />
            <symbol
                id="*Paper_Space0" />
        </defs>
        <g
            id="g5"
            transform="translate(-83.87224,-706.92841)">
            <path
                d="M 292.24626,971.99534 H 110.82893 A 26.456693,26.456693 0 0 1 84.37224,945.53865 V 733.8851 a 26.456693,26.456693 0 0 1 26.45669,-26.45669 h 551.81103 a 26.456693,26.456693 0 0 1 26.45669,26.45669 v 211.65355 a 26.456693,26.456693 0 0 1 -26.45669,26.45669 H 481.22263 A 18.897638,18.897638 0 0 1 462.325,953.0977 V 839.71188 A 18.897638,18.897638 0 0 0 443.42736,820.81424 H 330.04153 a 18.897638,18.897638 0 0 0 -18.89764,18.89764 V 953.0977 a 18.897638,18.897638 0 0 1 -18.89763,18.89764 z"
                style={{stroke: stroke, fillOpacity:"1", fill: fill}}
                id="path5" />
        </g>
        </svg>
    );
  };
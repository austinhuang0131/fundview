import * as React from "react";
import { Range, getTrackBackground } from "react-range";

const MIN = 0;
const STEP = 1;

function Slider(
    { quarters, state, range }:
        { quarters: string[], state: [number[], React.Dispatch<React.SetStateAction<number[]>>], range: boolean }
) {
    const MAX = quarters.length - 1;
    const [values, setValues] = state;
    return (
        <div
        style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
        }}
        >
        <Range
            values={values}
            step={STEP}
            min={MIN}
            max={MAX}
            rtl={false}
            onChange={(values) => setValues(values)}
            renderTrack={({ props, children }) => (
            <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                style={{
                    ...props.style,
                    height: "36px",
                    display: "flex",
                    width: "100%",
                }}
            >
                <div
                ref={props.ref}
                style={{
                    height: "5px",
                    width: "100%",
                    borderRadius: "4px",
                    background: getTrackBackground({
                        values,
                        colors: range ? ["#ccc", "#548BF4", "#ccc"] : ["#548BF4", "#ccc"],
                        min: MIN,
                        max: MAX,
                    }),
                    alignSelf: "center",
                }}
                >
                {children}
                </div>
            </div>
            )}
            renderThumb={({ index, props }) => (
            <div
                {...props}
                key={props.key}
                style={{
                    ...props.style,
                    height: "8px",
                    width: "8px",
                    borderRadius: "4px",
                    backgroundColor: "#FFF",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0px 2px 6px #AAA",
                }}
            >
                <div
                style={{
                    position: "absolute",
                    top: "-35px",
                    right: index == 0 ? "10px" : "unset",
                    left: index == 1 ? "10px" : "unset",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: "14px",
                    fontFamily: "Arial,Helvetica Neue,Helvetica,sans-serif",
                    padding: "4px",
                    borderRadius: "4px",
                    backgroundColor: "#548BF4",
                    whiteSpace: "nowrap"
                }}
                >
                {quarters[values[index]]}
                </div>
            </div>
            )}
        />
        </div>
    );
};

export default Slider;
import * as React from "react";
import { Range, getTrackBackground } from "react-range";

const MIN = 0;
const STEP = 1;

function SingleSlider({ quarters }: { quarters: string[] }) {
    const MAX = quarters.length - 1;
    const [values, setValues] = React.useState([MAX]);
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
                        colors: ["#548BF4", "#ccc"],
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
            renderThumb={({ props }) => (
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
                    left: "10px",
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
                {quarters[values[0]]}
                </div>
            </div>
            )}
        />
        </div>
    );
};

export default SingleSlider;
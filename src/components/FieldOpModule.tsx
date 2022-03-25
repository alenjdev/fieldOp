import { FC, useState, useLayoutEffect } from "react";
import { App, Device, ModuleData } from "@formant/data-sdk";
import { CompletionCircle } from "./CompletionCircle";
import styles from "./FieldOpModule.module.scss";
import { PauseIcon } from "./PauseIcon";
import { RunningIcon } from "./RunningIcon";

interface IFieldOpModuleProps {
  device: Device | undefined;
}

export const FieldOpModule: FC<IFieldOpModuleProps> = ({ device }) => {
  const [state, setState] = useState({
    status: "-",
    timeElapse: 0,
    timeRemaining: 0,
    completion: 0,
    battery: 0,
  });

  useLayoutEffect(() => {
    App.addModuleDataListener(setData);
  }, [device]);

  const setData = (newValue: ModuleData) => {
    const streams = newValue.streams;
    if (Object.keys(streams).length === 0) {
      throw new Error("No streams.");
    }
    const currentState = state;

    Object.keys(streams).forEach((stream, idx) => {
      const latestState = getLatestData(streams, stream);
      if (latestState === undefined) return;
      if (typeof latestState === "number") {
        if (streams[stream].data[0].name === "time.elapse")
          currentState.timeElapse = latestState;
        if (streams[stream].data[0].name === "time.remaining")
          currentState.timeRemaining = latestState;
        if (streams[stream].data[0].name === "completion")
          currentState.completion = latestState;
        if (streams[stream].data[0].name === "voltage")
          currentState.completion = latestState;
        return;
      }
      if (streams[stream].data[0].name === "mission.state") {
        currentState.status = (
          (latestState as string).replaceAll('"', "")[0].toUpperCase() +
          (latestState as string).replaceAll('"', "").slice(1)
        ).trim();
      }
    });
    if (JSON.stringify(state) !== JSON.stringify(currentState)) {
      setState(currentState);
    }
  };

  return (
    <div>
      <div className={styles.status}>
        {state.status === "Halted" ? <PauseIcon /> : <RunningIcon />}
        <span>{state.status}</span>
      </div>
      <CompletionCircle
        percentage={state.completion}
        name="Completion"
        value={state.completion + "%"}
      />
      <CompletionCircle
        percentage={
          (100 / (state.timeElapse + state.timeRemaining)) * state.timeElapse
        }
        name="Time Elapse"
        value={state.timeElapse + "min"}
      />
      <CompletionCircle
        percentage={
          (100 / (state.timeElapse + state.timeRemaining)) * state.timeRemaining
        }
        name="Time Remaining"
        value={state.timeRemaining + "min"}
      />
      <CompletionCircle
        percentage={state.battery}
        name="Battery"
        value={`${state.battery}%`}
      />
    </div>
  );
};

const getLatestData = (
  moduleData: {
    [stream_name: string]: Stream;
  },
  stream: string
): string | number | undefined => {
  if (moduleData[stream] === undefined) {
    return "No stream.";
  }
  if (moduleData[stream].loading) {
    return undefined;
  }
  if (moduleData[stream].tooMuchData) {
    return "Too much data.";
  }

  if (moduleData[stream].data.length === 0) {
    return "No data.";
  }
  const latestPoint = moduleData[stream].data[0].points.at(-1);

  if (!latestPoint) {
    return "No datapoints.";
  }

  return latestPoint[1];
};

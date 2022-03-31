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
  const [status, setStatus] = useState("-");
  const [timeElapse, setTimeElapse] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completion, setCompletion] = useState(0);
  const [battery, setBattery] = useState(0);

  useLayoutEffect(() => {
    App.addModuleDataListener(setData);
  }, [device]);

  const setData = (newValue: ModuleData) => {
    const streams = newValue.streams;
    if (Object.keys(streams).length === 0) {
      throw new Error("No streams.");
    }

    Object.keys(streams).forEach((stream, idx) => {
      const latestState = getLatestData(streams, stream);
      if (latestState === undefined) return;
      if (typeof latestState === "number") {
        if (streams[stream].data[0].name === "time.elapse")
          setTimeElapse(latestState);
        if (streams[stream].data[0].name === "time.remaining_2") {
          setTimeRemaining(latestState);
        }

        if (streams[stream].data[0].name === "completion")
          setCompletion(latestState);
        if (streams[stream].data[0].name === "voltage") setBattery(latestState);
        return;
      }
      if (streams[stream].data[0].name === "status" && latestState.length > 3) {
        let status = (
          (latestState as string).replaceAll('"', "")[0].toUpperCase() +
          (latestState as string).replaceAll('"', "").slice(1)
        ).trim();
        setStatus(status);
      }
    });
  };

  return (
    <div>
      <div className={styles.status}>
        {status === "Halted" ? <PauseIcon /> : <RunningIcon />}
        <span>{status}</span>
      </div>
      <CompletionCircle
        percentage={completion}
        name="Completion"
        value={completion + "%"}
      />
      <CompletionCircle
        percentage={(100 / (timeElapse + timeRemaining)) * timeElapse}
        name="Time Elapse"
        value={timeElapse + "min"}
      />
      <CompletionCircle
        percentage={(100 / (timeElapse + timeRemaining)) * timeRemaining}
        name="Time Remaining"
        value={timeRemaining + "min"}
      />
      <CompletionCircle
        percentage={battery}
        name="Battery"
        value={`${battery}%`}
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

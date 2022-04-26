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

  const shouldClearData = (
    lastUpdate: number,
    scruttingTime: number,
    seconds: number
  ) => {
    return lastUpdate + seconds * 1000 < scruttingTime;
  };

  useLayoutEffect(() => {
    App.addModuleDataListener(setData);
  }, [device]);

  const setData = (newValue: ModuleData) => {
    const streams = newValue.streams;
    if (Object.keys(streams).length === 0) {
      throw new Error("No streams.");
    }

    Object.keys(streams).forEach((stream) => {
      const latestState = getLatestData(streams, stream);
      if (latestState[1] === undefined) return;
      if (typeof latestState[1] === "number") {
        if (streams[stream].data[0].name === "time.elapse") {
          if (shouldClearData(latestState[0], newValue.time, 10)) {
            setTimeElapse(0);
            return;
          }
          setTimeElapse(latestState[1]);
        }
        if (streams[stream].data[0].name === "time.remaining_2") {
          if (shouldClearData(latestState[0], newValue.time, 10)) {
            setTimeRemaining(0);
            return;
          }
          setTimeRemaining(latestState[1]);
        }

        if (streams[stream].data[0].name === "completion") {
          if (shouldClearData(latestState[0], newValue.time, 10)) {
            setCompletion(0);
            return;
          }
          setCompletion(latestState[1]);
        }
        if (streams[stream].data[0].name === "voltage") {
          if (shouldClearData(latestState[0], newValue.time, 10)) {
            setBattery(0);
            return;
          }
          setBattery(latestState[1]);
        }
        return;
      }
      if (
        streams[stream].data[0].name === "status" &&
        latestState[1].length > 3
      ) {
        if (shouldClearData(latestState[0], newValue.time, 10)) {
          setStatus("-");
          return;
        }
        let status = (
          (latestState[1] as string).replaceAll('"', "")[0].toUpperCase() +
          (latestState[1] as string).replaceAll('"', "").slice(1)
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
  moduleData: any,
  stream: string
): any | number | undefined => {
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

  return latestPoint;
};

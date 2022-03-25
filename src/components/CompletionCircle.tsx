import styles from "./CompletionCircle.module.scss";
import { FC } from "react";

interface ICompletionCirleProps {
  name: string;
  value: string;
  percentage: number;
}

export const CompletionCircle: FC<ICompletionCirleProps> = ({
  name,
  value,
  percentage,
}) => {
  return (
    <div className={styles["circle-container"]}>
      <div className="circle-bg">
        <svg width="30" height="30">
          <circle
            cx="15"
            cy="15"
            r="13.5"
            fill="none"
            className={styles.circle}
          ></circle>
          <circle
            cx="15"
            cy="15"
            r="13.5"
            fill="none"
            strokeDasharray="84.82300164692441"
            transform="rotate(-90,15,15)"
            className={styles["circle-back"]}
            style={{
              strokeDashoffset: 84.82300164692441 * ((100 - percentage) / 100),
            }}
            // style={{stroke-dashoffset: "84.823"}}
          ></circle>
        </svg>
      </div>
      <div className={styles.text}>
        <span className={styles["text-percentage"]}>{value}</span>
        <span className={styles["text-name"]}>{name}</span>
      </div>
    </div>
  );
};

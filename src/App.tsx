import "./App.scss";
import { Fleet, Device, Authentication } from "@formant/data-sdk";
import { FieldOpModule } from "./components/FieldOpModule";
import { useEffect, useState } from "react";

function App() {
  const [device, setDevice] = useState<Device | undefined>();
  useEffect(() => {
    getCurrentDevice();
  }, []);
  const getCurrentDevice = async () => {
    if (await Authentication.waitTilAuthenticated()) {
      const currentDevice = await Fleet.getCurrentDevice();
      setDevice(currentDevice);
    }
  };
  return (
    <div className="App">
      <FieldOpModule device={device} />
    </div>
  );
}

export default App;

import "./App.css";
import { Button } from "primereact/button";
// import TemplateDemo from "./TemplateDemo";
import AdvanceDemo from "./TemplateDemo";
import HeadlessDemo from "./sideBar";

function App() {
  return (
    <div className="App">
      {/* <AdvanceDemo /> */}
      <HeadlessDemo />
    </div>
  );
}

export default App;

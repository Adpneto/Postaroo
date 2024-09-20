import { Outlet } from "react-router-dom";
import { ModeToggle } from "../mode-toogle";

const Visitant = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center">
      <div className="h-screen flex flex-col items-center justify-center">
        <Outlet />
        <ModeToggle />
      </div>
    </div>
  )
}

export default Visitant;
